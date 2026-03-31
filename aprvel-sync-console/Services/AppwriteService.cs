using Appwrite;
using Appwrite.Models;
using Appwrite.Services;
using aprvel_sync_console.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace aprvel_sync_console.Services;

public interface IAppwriteService
{
    Task<Dictionary<string, (string DocId, string Permission)>> GetApproversAsync();
    Task CreateApproverAsync(string oid, string permission);
    Task UpdateApproverPermissionAsync(string docId, string permission);
    Task DeleteApproverAsync(string docId);
    Task<RowList> GetPendingClaimsAsync();
    Task UpdateClaimSyncedAsync(string docId, bool synced);
    Task DeleteClaimAsync(string docId);

    Task<Appwrite.Models.Row> UploadPurchaseOrderAsync(Dictionary<string, object> orderData);
    Task<Appwrite.Models.Row> UploadPurchaseOrderLineAsync(Dictionary<string, object> lineData);
    Task<Appwrite.Models.Row> UpdatePurchaseOrderAsync(string appwritePoId, Dictionary<string, object> orderData);
    Task<Appwrite.Models.Row> UpdatePurchaseOrderLineAsync(string appwriteLineId, Dictionary<string, object> lineData);
    Task<bool> DeletePurchaseOrderAsync(string appwritePoId);
    Task<bool> DeletePurchaseOrderLineAsync(string appwriteLineId, string poType);
    Task SendPushNotificationAsync(List<string> appwriteUserIds, string title, string body);

    Task StartRealtimeAsync(IEnumerable<string> channels, EventHandler<RealtimeEventArgs> onMessageAction, CancellationToken cancellationToken = default);
    Task<RowList> GetRecentlyUpdatedOrdersAsync(DateTime since);
    Task<RowList> GetRecentlyUpdatedOrderLinesAsync(DateTime since);
}

public class AppwriteService : IAppwriteService
{
    private readonly AppConfig _config;
    private readonly ILogger<AppwriteService> _logger;
    private readonly Client _client;
    private readonly TablesDB _db;
    private readonly IAppwriteRealtimeClient _realtimeClient;

    public AppwriteService(
        IOptions<AppConfig> config,
        ILogger<AppwriteService> logger,
        IAppwriteRealtimeClient realtimeClient)
    {
        _config = config.Value;
        _logger = logger;
        _realtimeClient = realtimeClient;

        _client = new Client()
            .SetEndpoint(_config.Appwrite.Endpoint)
            .SetProject(_config.Appwrite.ProjectId)
            .SetKey(_config.Appwrite.ApiKey);

        _db = new TablesDB(_client);
    }

    public async Task<Dictionary<string, (string DocId, string Permission)>> GetApproversAsync()
    {
        var appwriteData = new Dictionary<string, (string DocId, string Permission)>();
        string? lastId = null;
        int limit = 100;
        RowList fileList;

        try
        {
            do
            {
                var queryList = new List<string> { Query.Limit(limit) };
                if (!string.IsNullOrEmpty(lastId))
                {
                    queryList.Add(Query.CursorAfter(lastId));
                }

                fileList = await _db.ListRows(_config.Appwrite.DatabaseId, _config.Appwrite.AvailableCollectionId, queries: queryList);
                foreach (var doc in fileList.Rows)
                {
                    if (doc.Data.TryGetValue("oid", out var oidVal) && oidVal != null)
                    {
                        string oid = oidVal.ToString()!.ToUpper();
                        string perm = "all";
                        if (doc.Data.TryGetValue("permission", out var permVal) && permVal != null)
                        {
                            perm = permVal.ToString() ?? "all";
                        }
                        appwriteData[oid] = (doc.Id, perm);
                    }
                }

                if (fileList.Rows.Count > 0)
                {
                    lastId = fileList.Rows[^1].Id;
                }
            }
            while (fileList.Rows.Count == limit);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching approvers from Appwrite.");
            throw;
        }

        return appwriteData;
    }

    public async Task CreateApproverAsync(string oid, string permission)
    {
        var data = new Dictionary<string, object>
        {
            { "oid", oid },
            { "permission", permission }
        };
        await _db.CreateRow(_config.Appwrite.DatabaseId, _config.Appwrite.AvailableCollectionId, oid, data);
    }

    public async Task UpdateApproverPermissionAsync(string docId, string permission)
    {
        var data = new Dictionary<string, object>
        {
            { "permission", permission }
        };
        await _db.UpdateRow(_config.Appwrite.DatabaseId, _config.Appwrite.AvailableCollectionId, docId, data);
    }

    public async Task DeleteApproverAsync(string docId)
    {
        await _db.DeleteRow(_config.Appwrite.DatabaseId, _config.Appwrite.AvailableCollectionId, docId);
    }

    public async Task<RowList> GetPendingClaimsAsync()
    {
        return await _db.ListRows(
            _config.Appwrite.DatabaseId,
            _config.Appwrite.QueueCollectionId,
            queries: [
                Query.Limit(100),
                 Query.Or([Query.Equal("Synced", false), Query.IsNull("Synced")])
            ]);
    }

    public async Task UpdateClaimSyncedAsync(string docId, bool synced)
    {
        var data = new Dictionary<string, object>
        {
            { "Synced", synced }
        };
        await _db.UpdateRow(_config.Appwrite.DatabaseId, _config.Appwrite.QueueCollectionId, docId, data);
    }

    public async Task DeleteClaimAsync(string docId)
    {
        await _db.DeleteRow(_config.Appwrite.DatabaseId, _config.Appwrite.QueueCollectionId, docId);
    }

    public async Task<Appwrite.Models.Row> UploadPurchaseOrderAsync(Dictionary<string, object> orderData)
    {
        try
        {
            return await _db.CreateRow(_config.Appwrite.DatabaseId, _config.Appwrite.OrderCollectionId, ID.Unique(), orderData);
        }
        catch (AppwriteException ex)
        {
            _logger.LogWarning(ex, "Failed to create PO, checking for unique index conflict.");
            if (orderData.TryGetValue("po_id", out var poIdObj) && poIdObj is string poId)
            {
                var existingDocs = await _db.ListRows(_config.Appwrite.DatabaseId, _config.Appwrite.OrderCollectionId, queries: [Query.Equal("po_id", poId)]);
                if (existingDocs.Rows.Count > 0)
                {
                    var docId = existingDocs.Rows[0].Id;
                    return await _db.UpdateRow(_config.Appwrite.DatabaseId, _config.Appwrite.OrderCollectionId, docId, orderData);
                }
            }
            throw;
        }
    }

    public async Task<Appwrite.Models.Row> UploadPurchaseOrderLineAsync(Dictionary<string, object> lineData)
    {
        try
        {
            return await _db.CreateRow(_config.Appwrite.DatabaseId, _config.Appwrite.OrderDetailCollectionId, ID.Unique(), lineData);
        }
        catch (AppwriteException ex)
        {
            _logger.LogWarning(ex, "Failed to create PO Line, checking for unique index conflict.");
            if (lineData.TryGetValue("line_id", out var lineIdObj) && lineIdObj is string lineId)
            {
                var existingDocs = await _db.ListRows(_config.Appwrite.DatabaseId, _config.Appwrite.OrderDetailCollectionId, queries: [Query.Equal("line_id", lineId)]);

                Appwrite.Models.Row? targetRow = null;
                if (lineData.TryGetValue("parent_id", out var pIdObj) && pIdObj is string parentId)
                {
                    targetRow = existingDocs.Rows.FirstOrDefault(r =>
                        r.Data.TryGetValue("parent_id", out var pId) && pId?.ToString() == parentId);
                }

                if (targetRow != null)
                {
                    return await _db.UpdateRow(_config.Appwrite.DatabaseId, _config.Appwrite.OrderDetailCollectionId, targetRow.Id, lineData);
                }
            }
            throw;
        }
    }

    public async Task<Appwrite.Models.Row> UpdatePurchaseOrderAsync(string appwritePoId, Dictionary<string, object> orderData)
    {
        var existingDocs = await _db.ListRows(_config.Appwrite.DatabaseId, _config.Appwrite.OrderCollectionId, queries: [Query.Equal("po_id", appwritePoId)]);
        if (existingDocs.Rows.Count > 0)
        {
            var docId = existingDocs.Rows[0].Id;
            return await _db.UpdateRow(_config.Appwrite.DatabaseId, _config.Appwrite.OrderCollectionId, docId, orderData);
        }
        else
        {
            return await _db.CreateRow(_config.Appwrite.DatabaseId, _config.Appwrite.OrderCollectionId, ID.Unique(), orderData);
        }
    }

    public async Task<Appwrite.Models.Row> UpdatePurchaseOrderLineAsync(string appwriteLineId, Dictionary<string, object> lineData)
    {
        var existingDocs = await _db.ListRows(_config.Appwrite.DatabaseId, _config.Appwrite.OrderDetailCollectionId, queries: [Query.Equal("line_id", appwriteLineId)]);

        Appwrite.Models.Row? targetRow = null;
        if (lineData.TryGetValue("parent_id", out var pIdObj) && pIdObj is string parentId)
        {
            targetRow = existingDocs.Rows.FirstOrDefault(r =>
                r.Data.TryGetValue("parent_id", out var pId) && pId?.ToString() == parentId);
        }

        if (targetRow != null)
        {
            return await _db.UpdateRow(_config.Appwrite.DatabaseId, _config.Appwrite.OrderDetailCollectionId, targetRow.Id, lineData);
        }
        else
        {
            return await _db.CreateRow(_config.Appwrite.DatabaseId, _config.Appwrite.OrderDetailCollectionId, ID.Unique(), lineData);
        }
    }

    public async Task SendPushNotificationAsync(List<string> appwriteUserIds, string title, string body)
    {
        if (appwriteUserIds == null || appwriteUserIds.Count == 0) return;

        try
        {
            var messaging = new Messaging(_client);
            await messaging.CreatePush(
                messageId: ID.Unique(),
                title: title,
                body: body,
                topics: [], // We will rely on User IDs instead of Topics
                users: appwriteUserIds,     // Target specific users
                targets: []
            );
            _logger.LogInformation("Successfully sent push notification to {Count} users.", appwriteUserIds.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send push notification to {Count} users. Title: {Title}", appwriteUserIds.Count, title);
        }
    }

    public async Task<bool> DeletePurchaseOrderAsync(string appwritePoId)
    {
        try
        {
            var existingDocs = await _db.ListRows(_config.Appwrite.DatabaseId, _config.Appwrite.OrderCollectionId, queries: [Query.Equal("po_id", appwritePoId)]);
            foreach (var doc in existingDocs.Rows)
            {
                await _db.DeleteRow(_config.Appwrite.DatabaseId, _config.Appwrite.OrderCollectionId, doc.Id);
            }
            return true;
        }
        catch (AppwriteException ex) when (ex.Code == 404)
        {
            // Already deleted in Appwrite, ignore.
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete from Appwrite: {Message}", ex.Message);
            return false;
        }
    }

    public async Task<bool> DeletePurchaseOrderLineAsync(string appwriteLineId, string poType)
    {
        try
        {
            var existingDocs = await _db.ListRows(_config.Appwrite.DatabaseId, _config.Appwrite.OrderDetailCollectionId, queries: [Query.Equal("line_id", appwriteLineId)]);
            foreach (var doc in existingDocs.Rows)
            {
                bool shouldDelete = false;

                if (doc.Data.TryGetValue("parent_id", out var pIdObj) && pIdObj is string parentId)
                {
                    try
                    {
                        var parentDocs = await _db.ListRows(_config.Appwrite.DatabaseId, _config.Appwrite.OrderCollectionId, queries: [Query.Equal("po_id", parentId)]);
                        if (parentDocs.Rows.Count > 0)
                        {
                            var parentDoc = parentDocs.Rows[0];
                            if (parentDoc.Data.TryGetValue("po_type", out var typeObj) && string.Equals(typeObj?.ToString(), poType, StringComparison.OrdinalIgnoreCase))
                            {
                                shouldDelete = true;
                            }
                        }
                        else
                        {
                            // Parent PO no longer exists, orphan line is safe to delete
                            shouldDelete = true;
                        }
                    }
                    catch
                    {
                        shouldDelete = true;
                    }
                }
                else
                {
                    shouldDelete = true;
                }

                if (shouldDelete)
                {
                    await _db.DeleteRow(_config.Appwrite.DatabaseId, _config.Appwrite.OrderDetailCollectionId, doc.Id);
                }
            }
            return true;
        }
        catch (AppwriteException ex) when (ex.Code == 404)
        {
            // Already deleted in Appwrite, ignore.
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete PO Line from Appwrite: {Message}", ex.Message);
            return false;
        }
    }

    public async Task StartRealtimeAsync(IEnumerable<string> channels, EventHandler<RealtimeEventArgs> onMessageAction, CancellationToken cancellationToken = default)
    {
        _realtimeClient.OnMessage += onMessageAction;
        await _realtimeClient.StartAsync(channels, cancellationToken);
    }

    public async Task<RowList> GetRecentlyUpdatedOrdersAsync(DateTime since)
    {
        return await _db.ListRows(
            _config.Appwrite.DatabaseId,
            _config.Appwrite.OrderCollectionId,
            queries: [
                Query.Limit(100),
                Query.GreaterThan("$updatedAt", since.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")),
                //Query.NotEqual("status", "pending")
            ]);
    }

    public async Task<RowList> GetRecentlyUpdatedOrderLinesAsync(DateTime since)
    {
        return await _db.ListRows(
            _config.Appwrite.DatabaseId,
            _config.Appwrite.OrderDetailCollectionId,
            queries: [
                Query.Limit(100),
                Query.GreaterThan("$updatedAt", since.ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"))
            ]);
    }
}
