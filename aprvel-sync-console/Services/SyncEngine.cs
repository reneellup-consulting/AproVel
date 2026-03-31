using aprvel_sync_console.Data;
using aprvel_sync_console.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace aprvel_sync_console.Services;

public class SyncEngine(
    IEmployeeRepository employeeRepository,
    IPurchaseOrderRepository poRepository,
    IAppwriteService appwriteService,
    IOptions<AppConfig> config,
    ILogger<SyncEngine> logger) : BackgroundService
{
    private readonly AppConfig _config = config.Value;
    private Dictionary<string, (string AppWriteUserId, string Permission)>? _cachedSqlData;
    private Dictionary<string, (string AppWriteUserId, string Permission)>? _cachedApproversWithIds;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("--- APRVEL SYNC ENGINE STARTING ---");

        var channels = new List<string>
        {
            $"databases.{_config.Appwrite.DatabaseId}.collections.{_config.Appwrite.OrderCollectionId}.documents",
            $"databases.{_config.Appwrite.DatabaseId}.collections.{_config.Appwrite.OrderDetailCollectionId}.documents"
        };
        
        await appwriteService.StartRealtimeAsync(channels, OnAppwriteRealtimeEvent, stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            logger.LogInformation("\n--- Cycle Start: {Time} ---", DateTime.Now);
            try
            {
                await SyncDown_SqlToAppwrite();
                await SyncUp_PurchaseOrdersToAppwrite();
                await SyncUp_ReSyncPurchaseOrdersToAppwrite();
                await SyncUp_DeletionsToAppwrite();
                await SyncDown_ReconcileRealtimeFallback();
            }
            catch (Exception ex)
            {
                logger.LogCritical(ex, "Cycle failed.");
            }

            logger.LogInformation("--- Cycle Complete. Waiting 10 seconds... ---");
            await Task.Delay(10000, stoppingToken);
        }
    }

    private async Task SyncDown_SqlToAppwrite()
    {
        logger.LogInformation("[SyncDown] Reading SQL... ");
        
        var sqlData = await employeeRepository.GetAuthorizedApproversWithAppwriteIdAsync();
        logger.LogInformation("Found {Count} available Approvers.", sqlData.Count);

        // Check QueueCollection for existing claims
        logger.LogInformation("[SyncDown] Checking QueueCollection for pending claims... ");
        var pendingClaims = await appwriteService.GetPendingClaimsAsync();
        
        foreach (var claim in pendingClaims.Rows)
        {
            if (claim.Data.TryGetValue("oid", out var oidVal) && oidVal != null &&
                claim.Data.TryGetValue("user_id", out var userIdVal) && userIdVal != null &&
                claim.Data.TryGetValue("$updatedAt", out var dateUpdatedVal) && dateUpdatedVal != null)
            {
                string oid = oidVal.ToString()!.ToUpper();
                string userId = userIdVal.ToString()!;
                string dateUpdated = dateUpdatedVal.ToString()!;

                if (sqlData.ContainsKey(oid))
                {
                    logger.LogInformation("  > OID {Oid} is newly claimed in QueueCollection. Updating SQL for User {UserId}...", oid, userId);
                    bool updateSuccess = await employeeRepository.UpdateEmployeeClaimAsync(oid, userId, dateUpdated);

                    if (updateSuccess)
                    {
                        // Remove from sqlData so it doesn't get uploaded to AvailableCollection
                        sqlData.Remove(oid);
                        await appwriteService.UpdateClaimSyncedAsync(claim.Id, true);
                        logger.LogInformation("    + Marked claim {Id} as Synced in Appwrite.", claim.Id);
                    }
                    else
                    {
                        logger.LogWarning("    ! SQL Update failed. Remove from sqlData anyway to prevent loop.");
                        sqlData.Remove(oid);
                        await appwriteService.UpdateClaimSyncedAsync(claim.Id, true);
                    }
                }
                else
                {
                    // OID not in available SQL Data, ignore but mark as synced to prevent loop
                    logger.LogInformation("  > OID {Oid} not found in available SQL data. Marking claim {Id} as Synced to prevent loop.", oid, claim.Id);
                    await appwriteService.UpdateClaimSyncedAsync(claim.Id, true);
                }
            }
            else
            {
                logger.LogWarning("    ! Missing required fields in claim {Id}. Marking as Synced to prevent loop.", claim.Id);
                await appwriteService.UpdateClaimSyncedAsync(claim.Id, true);
            }
        }

        // Validating Cache
        if (IsSqlDataUnchanged(sqlData))
        {
            logger.LogInformation("[SyncDown] No changes detected in SQL. Skipping Appwrite sync.");
            return;
        }

        // Update cache for next run
        // Create a copy so that any subsequent modification (though there shouldn't be any here) doesn't mutate the cache
        _cachedSqlData = new Dictionary<string, (string AppWriteUserId, string Permission)>(sqlData);

        // Get Appwrite OIDs
        logger.LogInformation("[SyncDown] Reading Appwrite... ");
        var appwriteData = await appwriteService.GetApproversAsync();
        logger.LogInformation(" Done. Found {Count} cached Approvers.", appwriteData.Count);

        // Calculate Differences
        var toAdd = sqlData.Where(x => !appwriteData.ContainsKey(x.Key)).ToList();
        var toRemove = appwriteData.Where(x => !sqlData.ContainsKey(x.Key)).ToList();
        var toUpdate = sqlData.Where(x => appwriteData.ContainsKey(x.Key) && appwriteData[x.Key].Permission != x.Value.Permission).ToList();

        // Execute Changes
        if (toAdd.Count > 0) logger.LogInformation("[SyncDown] Adding {Count} new Approvers...", toAdd.Count);
        foreach (var item in toAdd)
        {
            try
            {
                await appwriteService.CreateApproverAsync(item.Key, item.Value.Permission);
                logger.LogInformation("  + Added: {Key} ({Value})", item.Key, item.Value.Permission);
            }
            catch (Exception ex) { logger.LogError(ex, "  x Failed to add {Key}", item.Key); }
        }

        if (toUpdate.Count > 0) logger.LogInformation("[SyncDown] Updating {Count} Approvers with changed permissions...", toUpdate.Count);
        
        // Fetch Appwrite IDs for notifications
        if (toUpdate.Count > 0)
        {
            _cachedApproversWithIds = await employeeRepository.GetAuthorizedApproversWithAppwriteIdAsync();
        }

        foreach (var item in toUpdate)
        {
            try
            {
                var docId = appwriteData[item.Key].DocId;
                await appwriteService.UpdateApproverPermissionAsync(docId, item.Value.Permission);
                logger.LogInformation("  * Updated: {Key} -> {Value}", item.Key, item.Value.Permission);
                
                // Trigger notification
                if (_cachedApproversWithIds != null && _cachedApproversWithIds.TryGetValue(item.Key, out var approverInfo))
                {
                    if (!string.IsNullOrEmpty(approverInfo.AppWriteUserId))
                    {
                        string body = $"Your account permission has been updated to: {item.Value.Permission}";
                        await appwriteService.SendPushNotificationAsync([approverInfo.AppWriteUserId], "Permission Updated", body);
                    }
                }
            }
            catch (Exception ex) { logger.LogError(ex, "  x Failed to update {Key}", item.Key); }
        }

        if (toRemove.Count > 0) logger.LogInformation("[SyncDown] Removing {Count} stale Approvers...", toRemove.Count);
        foreach (var item in toRemove)
        {
            try
            {
                // We don't easily have AppWriteUserId to notify after removal, but Appwrite Document is deleted
                await appwriteService.DeleteApproverAsync(item.Value.DocId);
                logger.LogInformation("  - Removed: {Key}", item.Key);
            }
            catch (Exception ex) { logger.LogError(ex, "  x Failed to remove {Key}", item.Key); }
        }
    }

    private async Task SyncUp_PurchaseOrdersToAppwrite()
    {
        logger.LogInformation("[SyncUp] Checking for new Purchase Orders...");

        var newOrders = await poRepository.GetNewPurchaseOrdersAsync();
        if (newOrders.Count == 0)
        {
            logger.LogInformation("No new Purchase Orders found.");
            return;
        }

        logger.LogInformation("Found {Count} new Purchase Orders. Fetching lines...", newOrders.Count);

        // We assume OID is returned as a Guid in SQL, so we'll need a string representation to query lines
        var poIds = newOrders.Select(o => o["OID"]?.ToString() ?? string.Empty)
                             .Where(id => !string.IsNullOrEmpty(id))
                             .ToList();

        var poLines = await poRepository.GetNewPurchaseOrderLinesAsync(poIds);
        logger.LogInformation("Found {Count} related Order Lines.", poLines.Count);

        // Group lines by parent PO ID for easier processing
        var linesByPoId = poLines
            .Where(l => l["GenJournalID"] != null)
            .GroupBy(l => l["GenJournalID"]!.ToString()!)
            .ToDictionary(g => g.Key, g => g.ToList());

        int successCount = 0;
        int failCount = 0;

        // Fetch user IDs for notifications once if there are orders
        var allApprovers = await employeeRepository.GetAuthorizedApproversWithAppwriteIdAsync();

        foreach (var orderRecord in newOrders)
        {
            var oid = orderRecord["OID"]?.ToString();
            if (string.IsNullOrEmpty(oid)) continue;

            logger.LogInformation("  > Processing PO {OID}...", oid);

            try
            {
                bool hasLines = linesByPoId.TryGetValue(oid, out var linesForThisPo);

                var orderData = MapOrderData(orderRecord);
                
                // Upload Order
                var createdPo = await appwriteService.UploadPurchaseOrderAsync(orderData);
                string newOrderId = $"po-{oid.ToLower()}";

                // Upload Lines
                if (hasLines)
                {
                    foreach (var lineRecord in linesForThisPo!)
                    {
                        var lineOid = lineRecord["OID"]?.ToString();
                        if (string.IsNullOrEmpty(lineOid)) continue;

                        var lineData = MapOrderLineData(lineRecord, newOrderId);

                        await appwriteService.UploadPurchaseOrderLineAsync(lineData);
                    }
                }

                // If successful, mark as uploaded in SQL
                string poType = GetString(orderRecord, "PO_Type");
                bool marked = await poRepository.MarkPurchaseOrderAsUploadedAsync(oid, poType);
                if (marked)
                {
                    logger.LogInformation("    + Success! Uploaded PO and marked as synced.");
                    successCount++;

                    // Trigger Push Notifications
                    if (allApprovers != null)
                    {
                        var userIdsToNotify = GetUsersToNotify(allApprovers, poType);
                        if (userIdsToNotify.Count > 0)
                        {
                            string title = "New Purchase Order";
                            string sourceNo = GetString(orderRecord, "SourceNo");
                            string bodyStr = string.IsNullOrEmpty(sourceNo) ? $"New Purchase Order {oid} requires approval." : $"New Purchase Order {sourceNo} requires approval.";
                            await appwriteService.SendPushNotificationAsync(userIdsToNotify, title, bodyStr);
                        }
                    }
                }
                else
                {
                    logger.LogWarning("    ! Uploaded PO but failed to mark as synced in SQL. It may be re-uploaded next cycle.");
                    failCount++;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "    x Failed to upload PO {OID}.", oid);
                failCount++;
            }
        }

        logger.LogInformation("[SyncUp] PO Upload Complete. Success: {Success}, Failed: {Failed}", successCount, failCount);
    }

    private async Task SyncUp_ReSyncPurchaseOrdersToAppwrite()
    {
        logger.LogInformation("[ReSync] Checking for Purchase Orders to ReSync...");

        var resyncOrders = await poRepository.GetReSyncPurchaseOrdersAsync();
        if (resyncOrders.Count == 0)
        {
            logger.LogInformation("No Purchase Orders flagged for ReSync.");
            return;
        }

        logger.LogInformation("Found {Count} Purchase Orders to ReSync. Fetching lines...", resyncOrders.Count);

        var poIds = resyncOrders.Select(o => o["OID"]?.ToString() ?? string.Empty)
                                .Where(id => !string.IsNullOrEmpty(id))
                                .ToList();

        var poLines = await poRepository.GetReSyncPurchaseOrderLinesAsync(poIds);
        logger.LogInformation("Found {Count} related Order Lines for ReSync.", poLines.Count);

        var linesByPoId = poLines
            .Where(l => l["GenJournalID"] != null)
            .GroupBy(l => l["GenJournalID"]!.ToString()!)
            .ToDictionary(g => g.Key, g => g.ToList());

        int successCount = 0;
        int failCount = 0;

        // Fetch user IDs for notifications once if there are orders to resync
        var allApprovers = await employeeRepository.GetAuthorizedApproversWithAppwriteIdAsync();

        foreach (var orderRecord in resyncOrders)
        {
            var oid = orderRecord["OID"]?.ToString();
            if (string.IsNullOrEmpty(oid)) continue;

            logger.LogInformation("  > ReSyncing PO {OID}...", oid);

            try
            {
                string poType = GetString(orderRecord, "PO_Type");
                bool hasLines = linesByPoId.TryGetValue(oid, out var linesForThisPo);

                var orderData = MapOrderData(orderRecord);
                string newOrderId = $"po-{oid.ToLower()}";
                
                await appwriteService.UpdatePurchaseOrderAsync(newOrderId, orderData);

                if (hasLines)
                {
                    foreach (var lineRecord in linesForThisPo!)
                    {
                        var lineOid = lineRecord["OID"]?.ToString();
                        if (string.IsNullOrEmpty(lineOid)) continue;

                        var lineData = MapOrderLineData(lineRecord, newOrderId);
                        string newLineId = $"line-{lineOid.ToLower()}";

                        await appwriteService.UpdatePurchaseOrderLineAsync(newLineId, lineData);

                        // Mark line as synced
                        bool markedLine = await poRepository.MarkPurchaseOrderLineAsUploadedAsync(lineOid, poType);
                        if (markedLine)
                        {
                            logger.LogInformation("    + Success! Uploaded PO Line and marked as synced.");
                            successCount++;
                        }
                        else
                        {
                            logger.LogWarning("    ! Uploaded PO Line but failed to mark as synced in SQL. It may be re-uploaded next cycle.");
                            failCount++;
                        }
                    }
                }

                bool marked = await poRepository.MarkPurchaseOrderAsReSyncedAsync(oid);
                if (marked)
                {
                    logger.LogInformation("    + Success! ReSynced PO and cleared flag in SQL.");
                    successCount++;
                    
                    // Trigger Push Notifications
                    var userIdsToNotify = GetUsersToNotify(allApprovers, poType);
                    if (userIdsToNotify.Count > 0)
                    {
                        string title = "Purchase Order Updated";
                        string sourceNo = GetString(orderRecord, "SourceNo");
                        string bodyStr = string.IsNullOrEmpty(sourceNo) ? $"Purchase Order {oid} has been successfully updated." : $"Purchase Order {sourceNo} has been successfully updated.";
                        await appwriteService.SendPushNotificationAsync(userIdsToNotify, title, bodyStr);
                    }
                }
                else
                {
                    logger.LogWarning("    ! ReSynced PO in Appwrite but failed to clear ReSynced flag in SQL.");
                    failCount++;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "    x Failed to ReSync PO {OID}.", oid);
                failCount++;
            }
        }

        logger.LogInformation("[ReSync] PO ReSync Complete. Success: {Success}, Failed: {Failed}", successCount, failCount);
    }

    private async Task SyncUp_DeletionsToAppwrite()
    {
        logger.LogInformation("[SyncUp] Checking for pending deletions...");

        var pendingDeletions = await poRepository.GetPendingDeletionsAsync();
        if (pendingDeletions.Count == 0)
        {
            logger.LogInformation("No pending deletions found.");
            return;
        }

        logger.LogInformation("Found {Count} pending deletions.", pendingDeletions.Count);

        int successCount = 0;
        int failCount = 0;

        // Fetch user IDs for notifications once if there are deletions
        var allApprovers = await employeeRepository.GetAuthorizedApproversWithAppwriteIdAsync();

        foreach (var deletion in pendingDeletions)
        {
            if (!deletion.TryGetValue("OID", out var queueOidObj) || queueOidObj == null) continue;
            int queueOid = Convert.ToInt32(queueOidObj);
            
            string rowType = GetString(deletion, "RowType");
            string rowIdStr = deletion["RowId"]?.ToString() ?? "";
            string poType = GetString(deletion, "POType");
            
            if (string.IsNullOrEmpty(rowIdStr))
            {
                logger.LogWarning("  > Queue OID {QueueOid} has empty RowId. Removing from queue.", queueOid);
                await poRepository.RemoveFromDeletionQueueAsync(queueOid);
                continue;
            }

            logger.LogInformation("  > Processing Deletion for {RowType} with RowId {RowId} (Queue OID: {QueueOid})...", rowType, rowIdStr, queueOid);

            try
            {
                bool deleteSuccess = false;
                if (string.Equals(rowType, "Parent", StringComparison.OrdinalIgnoreCase))
                {
                    string appwriteId = $"po-{rowIdStr.ToLower()}";
                    deleteSuccess = await appwriteService.DeletePurchaseOrderAsync(appwriteId);
                }
                else if (string.Equals(rowType, "Line", StringComparison.OrdinalIgnoreCase))
                {
                    string appwriteId = $"line-{rowIdStr.ToLower()}";
                    deleteSuccess = await appwriteService.DeletePurchaseOrderLineAsync(appwriteId, poType);
                }
                else
                {
                    logger.LogWarning("    ! Unknown RowType '{RowType}'. Removing from queue.", rowType);
                    await poRepository.RemoveFromDeletionQueueAsync(queueOid);
                    continue;
                }

                if (deleteSuccess) 
                {
                    bool removed = await poRepository.RemoveFromDeletionQueueAsync(queueOid);
                    if (removed)
                    {
                        logger.LogInformation("    + Success! Deleted from Appwrite and cleared from queue.");
                        successCount++;

                        // Trigger Push Notifications
                        if (allApprovers != null)
                        {
                            var userIdsToNotify = GetUsersToNotify(allApprovers, poType);
                            if (userIdsToNotify.Count > 0)
                            {
                                string title = "Purchase Order Deleted";
                                string bodyStr = string.Equals(rowType, "Parent", StringComparison.OrdinalIgnoreCase)
                                    ? $"Purchase Order {rowIdStr} has been deleted."
                                    : $"A line item from Purchase Order {rowIdStr} has been deleted.";
                                await appwriteService.SendPushNotificationAsync(userIdsToNotify, title, bodyStr);
                            }
                        }
                    }
                    else
                    {
                        logger.LogWarning("    ! Deleted from Appwrite but failed to clear from SQL queue.");
                        failCount++;
                    }
                }
                else
                {
                    logger.LogWarning("    ! Failed to delete from Appwrite. Keeping in SQL queue.");
                    failCount++;
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "    x Failed to process deletion for Queue OID {QueueOid}.", queueOid);
                failCount++;
            }
        }

        logger.LogInformation("[SyncUp] Deletions Complete. Success: {Success}, Failed: {Failed}", successCount, failCount);
    }

    private static List<string> GetUsersToNotify(Dictionary<string, (string AppWriteUserId, string Permission)> allApprovers, string poType)
    {
        var validPermissions = new HashSet<string> { "all" };
        var lowerPoType = poType.ToLower();

        if (lowerPoType.Contains("fuel"))
        {
            validPermissions.Add("fuel");
            validPermissions.Add("purchaserfuel");
            validPermissions.Add("purchaserall");
        }
        else // Assume General for anything else
        {
            validPermissions.Add("general");
            validPermissions.Add("purchasergeneral");
            validPermissions.Add("purchaserall");
        }

        return allApprovers.Values
            .Where(a => !string.IsNullOrEmpty(a.AppWriteUserId) && validPermissions.Contains(a.Permission.ToLower()))
            .Select(a => a.AppWriteUserId)
            .Distinct()
            .ToList();
    }

    private static Dictionary<string, object> MapOrderData(Dictionary<string, object> record)
    {
        string oid = record["OID"]?.ToString() ?? "";
        long refId = long.TryParse(oid, out var parsedRef) ? parsedRef : 0;
        return new Dictionary<string, object>
        {
            { "po_id", $"po-{oid.ToLower()}" },
            { "po_type", GetString(record, "PO_Type") },
            { "ref_id", refId },
            { "source_no", GetString(record, "SourceNo") },
            { "status", GetString(record, "Status") },
            { "status_by", GetString(record, "StatusBy") },
            { "status_date", GetIsoDate(record, "StatusDate") },
            { "vendor", GetString(record, "VendorName") },
            { "vendor_address", GetString(record, "VendorAddress") },
            { "ship_to_address", GetString(record, "ShipToAddress") },
            { "ref_nos", GetString(record, "ReferenceNo") },
            { "entry_date", GetIsoDate(record, "EntryDate") },
            { "expected_date", GetIsoDate(record, "ExpectedDate") },
            { "remarks", GetString(record, "Remarks") },
            { "rejection_reason", "" }, // Default empty matching CsvExportService
            { "comments", GetString(record, "Comments") },
            { "history", GetString(record, "History") },
            { "amount", GetDouble(record, "TotalAmount") },
            { "fuel_customer", GetString(record, "FuelCustomer") },
            { "unit_no", GetString(record, "UnitNo") },
            { "meter_read", GetDouble(record, "MeterRead") },
            { "tagged_trips", GetString(record, "TaggedTrips") },
            { "fuel_usage_class", GetString(record, "FuelUsageClass") },
            { "trip_type", GetString(record, "TripType") },
            { "driver", GetString(record, "Driver") },
            { "prev_gas_date", GetIsoDate(record, "PrevGasDate") },
            { "prev_meter", GetDouble(record, "PrevMeter") },
            { "prev_no_liters", GetDouble(record, "NoOfLtrs") },
            { "prev_price", GetDouble(record, "FuelPrice") },
            { "prev_total_amt", GetDouble(record, "PrevTotalAmt") }
        };
    }

    private static Dictionary<string, object> MapOrderLineData(Dictionary<string, object> record, string parentOrderId)
    {
        string oid = record["OID"]?.ToString() ?? "";
        long lineRefId = long.TryParse(oid, out var parsedRef) ? parsedRef : 0;
        return new Dictionary<string, object>
        {
            { "line_id", $"line-{oid.ToLower()}" },
            { "parent_id", parentOrderId }, // Foreign Key pointing to the Order's $id
            { "line_ref_id", lineRefId },
            { "item", GetString(record, "Item") },
            { "requestor", GetString(record, "Requestor") },
            { "charge_to", GetString(record, "ChargeTo") },
            { "quantity", GetDouble(record, "Quantity") },
            { "unit_of_measure", GetString(record, "UOM") },
            { "unit_cost", GetDouble(record, "BaseCost") },
            { "total", GetDouble(record, "Total") },
            { "reason", GetString(record, "Reason") },
            { "line_status", GetString(record, "LineApprovalStatus") },
            { "facility_department", GetString(record, "Department") },
            { "requisition_no", GetString(record, "RequisitionNo") },
            { "discount", GetDouble(record, "LineDiscount") },
            { "remaining_qty", GetDouble(record, "RemainingQty") },
            { "origin", GetString(record, "Origin") },
            { "destination", GetString(record, "Destination") },
            { "code_no", GetString(record, "CodeNo") },
            { "tad", GetDouble(record, "Tad") }
        };
    }

    private static string GetString(Dictionary<string, object> record, string columnName)
    {
        if (record.TryGetValue(columnName, out var val) && val != null)
        {
            return val.ToString() ?? string.Empty;
        }
        return string.Empty;
    }

    private static double GetDouble(Dictionary<string, object> record, string columnName)
    {
        if (record.TryGetValue(columnName, out var val) && val != null)
        {
            if (double.TryParse(val.ToString(), out double result))
            {
                return result;
            }
        }
        return 0;
    }

    private static string GetIsoDate(Dictionary<string, object> record, string columnName)
    {
        if (record.TryGetValue(columnName, out var val) && val != null)
        {
            if (val is DateTime dt)
            {
                return dt.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
            }
        }
        return string.Empty;
    }

    // Kept for reference but not called in ExecuteAsync per original logic
    private async Task SyncUp_AppwriteToSql()
    {
        logger.LogInformation("[SyncUp] Starting queue processing...");

        while (true)
        {
            logger.LogInformation("[SyncUp] Checking Queue... ");
            var pendingClaims = await appwriteService.GetPendingClaimsAsync();
            
            if (pendingClaims.Rows.Count == 0)
            {
                logger.LogInformation("No (more) pending claims.");
                break;
            }

            logger.LogInformation("Found {Total} total claims (processing batch of {BatchSize}).", pendingClaims.Total, pendingClaims.Rows.Count);

            foreach (var claim in pendingClaims.Rows)
            {
                if (!claim.Data.TryGetValue("oid", out var oidVal) || oidVal is null)
                {
                    logger.LogWarning("    ! Error: Claim {Id} is missing 'oid'. Skipping.", claim.Id);
                    continue;
                }
                string oid = oidVal.ToString() ?? string.Empty;

                if (!claim.Data.TryGetValue("user_id", out var userIdVal) || userIdVal is null)
                {
                    logger.LogWarning("    ! Error: Claim {Id} is missing 'user_id'. Skipping.", claim.Id);
                    continue;
                }
                string userId = userIdVal.ToString() ?? string.Empty;

                    if (!claim.Data.TryGetValue("$updatedAt", out var dateUpdatedVal) || dateUpdatedVal is null)
                {
                    logger.LogWarning("    ! Error: Claim {Id} is missing '$updatedAt'. Skipping.", claim.Id);
                    continue;
                }
                string dateUpdated = dateUpdatedVal.ToString() ?? string.Empty;
                
                logger.LogInformation("  > Processing Claim: User {UserId} -> OID {Oid}", userId, oid);

                bool updateSuccess = await employeeRepository.UpdateEmployeeClaimAsync(oid, userId, dateUpdated);

                if (updateSuccess)
                {
                    await appwriteService.DeleteClaimAsync(claim.Id);
                    logger.LogInformation("    + Success! SQL Updated & Queue Item removed.");
                }
                else
                {
                    logger.LogWarning("    ! SQL Update affected 0 rows (OID not found?). Removing from queue anyway to prevent loop.");
                    await appwriteService.DeleteClaimAsync(claim.Id);
                }
            }
        }
    }

    private bool IsSqlDataUnchanged(Dictionary<string, (string AppWriteUserId, string Permission)> newData)
    {
        if (_cachedSqlData == null) return false; // First run
        if (_cachedSqlData.Count != newData.Count) return false;

        foreach (var kvp in newData)
        {
            if (!_cachedSqlData.TryGetValue(kvp.Key, out var val) || val.AppWriteUserId != kvp.Value.AppWriteUserId || val.Permission != kvp.Value.Permission)
            {
                return false;
            }
        }
        return true;
    }

    private void OnAppwriteRealtimeEvent(object? sender, RealtimeEventArgs e)
    {
        // Fire and forget the async processing so we don't block the WebSocket reading thread
        _ = Task.Run(async () => 
        {
            try
            {
                await ProcessRealtimeEventAsync(e);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error processing Realtime Event.");
            }
        });
    }

    private async Task ProcessRealtimeEventAsync(RealtimeEventArgs e)
    {
        if (e.Events == null) return;
        
        bool isCreateOrUpdate = e.Events.Contains("databases.*.collections.*.documents.*.create") || 
                                e.Events.Contains("databases.*.collections.*.documents.*.update");
                                
        if (!isCreateOrUpdate)
            return;

        var collectionIdMatch = e.Channels.FirstOrDefault(c => c.Contains("collections."));
        if (collectionIdMatch == null) return;
        
        if (collectionIdMatch.Contains(_config.Appwrite.OrderCollectionId))
        {
            await ProcessPurchaseOrderUpdateAsync(e.Payload);
        }
        else if (collectionIdMatch.Contains(_config.Appwrite.OrderDetailCollectionId))
        {
            await ProcessPurchaseOrderLineUpdateAsync(e.Payload);
        }
    }

    private async Task ProcessPurchaseOrderUpdateAsync(System.Text.Json.JsonElement payload)
    {
        string poIdStr = payload.TryGetProperty("po_id", out var poEl) ? poEl.GetString() ?? "" : "";
        if (!poIdStr.StartsWith("po-")) return;
        string sqlOid = poIdStr.Substring(3).ToUpper();

        string appwriteStatus = payload.TryGetProperty("status", out var statEl) ? statEl.GetString() ?? "" : "";
        if (string.IsNullOrEmpty(appwriteStatus)) return;
        
        int sqlStatus = appwriteStatus == "approved" ? 1 : 
                        (appwriteStatus == "rejected" ? 4 : 
                        (appwriteStatus == "Pending" ? 0 : -1));
        
        if (sqlStatus == -1) return; // Unknown status

        string statusBy = payload.TryGetProperty("status_by", out var byEl) ? byEl.GetString() ?? "" : "";
        DateTime statusDate = DateTime.UtcNow;
        if (payload.TryGetProperty("status_date", out var dateEl) && dateEl.ValueKind == System.Text.Json.JsonValueKind.String)
        {
            DateTime.TryParse(dateEl.GetString(), out statusDate);
        }
        
        string remarks = payload.TryGetProperty("remarks", out var remEl) ? remEl.GetString() ?? "" : "";
        string rejectionReason = payload.TryGetProperty("rejection_reason", out var rejEl) ? rejEl.GetString() ?? "" : "";
        string poType = payload.TryGetProperty("po_type", out var typeEl) ? typeEl.GetString() ?? "General" : "General";

        logger.LogInformation("[Realtime] Order {Oid} updated to {Status}", sqlOid, appwriteStatus);
        
        await poRepository.UpdatePurchaseOrderStatusAsync(sqlOid, sqlStatus, statusBy, statusDate, remarks, rejectionReason, poType);
    }

    private async Task ProcessPurchaseOrderLineUpdateAsync(System.Text.Json.JsonElement payload)
    {
        string lineIdStr = payload.TryGetProperty("line_id", out var lineEl) ? lineEl.GetString() ?? "" : "";
        if (!lineIdStr.StartsWith("line-")) return;
        string sqlOid = lineIdStr.Substring(5).ToUpper();

        string lineStatusStr = payload.TryGetProperty("line_status", out var statEl) ? statEl.GetString() ?? "" : "";
        
        int sqlStatus = lineStatusStr == "Released" ? 1 : 0;
        string remarks = payload.TryGetProperty("reason", out var reasonEl) ? reasonEl.GetString() ?? "" : "";
        
        // We need po_type to update the right table. We can derive it by asking SQL or Appwrite, 
        // but since we only have line data here, let's assume General if we can't find it easily, 
        // OR we can query SQL for the parent PO type. 
        // For simplicity, we'll run a quick fix: Use a dummy POType "General" but 
        // SqlPurchaseOrderRepository will try the General table, and if it affects 0 rows, we don't sweat it
        // Or we can just update both tables. (For now, passing "General", you may need to fetch the true type).
        
        logger.LogInformation("[Realtime] Order Line {Oid} updated to {Status}", sqlOid, lineStatusStr);
        await poRepository.UpdatePurchaseOrderLineStatusAsync(sqlOid, sqlStatus, remarks, "General");
        await poRepository.UpdatePurchaseOrderLineStatusAsync(sqlOid, sqlStatus, remarks, "Fuel");
    }

    private readonly string _fallbackSyncStateFile = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "fallback_sync_state.dat");

    private DateTime GetLastFallbackSyncTime()
    {
        if (File.Exists(_fallbackSyncStateFile))
        {
            try
            {
                var content = File.ReadAllText(_fallbackSyncStateFile);
                if (DateTime.TryParse(content, out var dt))
                {
                    return dt.ToUniversalTime();
                }
            }
            catch (Exception ex)
            {
                logger.LogWarning(ex, "Failed to read fallback sync state. Using default (-10 mins).");
            }
        }
        return DateTime.UtcNow.AddMinutes(-10);
    }

    private void SaveLastFallbackSyncTime(DateTime dt)
    {
        try
        {
            File.WriteAllText(_fallbackSyncStateFile, dt.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"));
        }
        catch (Exception ex)
        {
            logger.LogWarning(ex, "Failed to save fallback sync state to file.");
        }
    }

    private async Task SyncDown_ReconcileRealtimeFallback()
    {
        var lastSync = GetLastFallbackSyncTime();
        logger.LogInformation("[Reconcile] Checking for missed Appwrite updates since {Time}...", lastSync);
        var runTime = DateTime.UtcNow;

        try
        {
            var updatedOrders = await appwriteService.GetRecentlyUpdatedOrdersAsync(lastSync);
            foreach (var doc in updatedOrders.Rows)
            {
                try
                {
                    // To convert Dictionary<string, object> to JsonElement, we serialize and deserialize
                    var jsonStr = System.Text.Json.JsonSerializer.Serialize(doc.Data);
                    using var jsonDoc = System.Text.Json.JsonDocument.Parse(jsonStr);
                    await ProcessPurchaseOrderUpdateAsync(jsonDoc.RootElement);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "[Reconcile] Failed to process order {DocId}", doc.Id);
                }
            }

            var updatedLines = await appwriteService.GetRecentlyUpdatedOrderLinesAsync(lastSync);
            foreach (var doc in updatedLines.Rows)
            {
                try
                {
                    var jsonStr = System.Text.Json.JsonSerializer.Serialize(doc.Data);
                    using var jsonDoc = System.Text.Json.JsonDocument.Parse(jsonStr);
                    await ProcessPurchaseOrderLineUpdateAsync(jsonDoc.RootElement);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "[Reconcile] Failed to process order line {DocId}", doc.Id);
                }
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "[Reconcile] Loop failed.");
        }
        finally
        {
            SaveLastFallbackSyncTime(runTime);
            logger.LogInformation("[Reconcile] Fallback complete.");
        }
    }
}
