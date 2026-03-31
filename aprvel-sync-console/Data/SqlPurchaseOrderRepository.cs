using System.Data;
using aprvel_sync_console.Configuration;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace aprvel_sync_console.Data;

public interface IPurchaseOrderRepository
{
    Task<List<Dictionary<string, object>>> GetNewPurchaseOrdersAsync();
    Task<List<Dictionary<string, object>>> GetNewPurchaseOrderLinesAsync(IEnumerable<string> poIds);
    Task<bool> MarkPurchaseOrderAsUploadedAsync(string poId, string poType);
    Task<List<Dictionary<string, object>>> GetReSyncPurchaseOrdersAsync();
    Task<List<Dictionary<string, object>>> GetReSyncPurchaseOrderLinesAsync(IEnumerable<string> poIds);
    Task<bool> MarkPurchaseOrderAsReSyncedAsync(string poId);
    Task<List<Dictionary<string, object>>> GetPendingDeletionsAsync();
    Task<bool> RemoveFromDeletionQueueAsync(int queueOid);
    Task<bool> MarkPurchaseOrderLineAsUploadedAsync(string lineOid, string poType);
    Task<bool> UpdatePurchaseOrderStatusAsync(string oid, int status, string statusBy, DateTime statusDate, string? remarks, string? rejectionReason, string poType);
    Task<bool> UpdatePurchaseOrderLineStatusAsync(string oid, int lineApprovalStatus, string? remarks, string poType);
}

public class SqlPurchaseOrderRepository(IOptions<AppConfig> config, ILogger<SqlPurchaseOrderRepository> logger) : IPurchaseOrderRepository
{
    private readonly AppConfig _config = config.Value;
    private readonly ILogger<SqlPurchaseOrderRepository> _logger = logger;

    private SqlConnection GetConnection() => new(_config.ConnectionStrings.SqlDb);

    public async Task<List<Dictionary<string, object>>> GetNewPurchaseOrdersAsync()
    {
        var orders = new List<Dictionary<string, object>>();
        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();
            var cmd = new SqlCommand("SELECT * FROM vAllPurchaseOrders", conn);

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var dict = new Dictionary<string, object>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    string colName = reader.GetName(i);
                    dict[colName] = reader.IsDBNull(i) ? null! : reader.GetValue(i);
                }
                orders.Add(dict);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching new purchase orders from SQL.");
            throw;
        }

        return orders;
    }

    public async Task<List<Dictionary<string, object>>> GetNewPurchaseOrderLinesAsync(IEnumerable<string> poIds)
    {
        var lines = new List<Dictionary<string, object>>();

        var poIdHashSet = new HashSet<string>(poIds);
        if (poIdHashSet.Count == 0) return lines;

        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();

            // To avoid the 2100 parameter limit and complex batching, 
            // query the view for lines that haven't been synced, 
            // and filter them in memory by the PO IDs we are currently processing.
            // Note: Since this view is already filtered by IsSynced = 0 in SQL (as per your feedback), 
            // scanning it is safe and avoids parameter limits entirely.
            var cmd = new SqlCommand("SELECT * FROM vAllPurchaseOrdreDetails", conn);

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                // Check if this line belongs to one of the POs we're syncing
                int journalIdOrdinal = reader.GetOrdinal("GenJournalID");
                if (reader.IsDBNull(journalIdOrdinal)) continue;

                string journalId = reader.GetValue(journalIdOrdinal).ToString() ?? string.Empty;

                if (poIdHashSet.Contains(journalId))
                {
                    var dict = new Dictionary<string, object>();
                    for (int k = 0; k < reader.FieldCount; k++)
                    {
                        string colName = reader.GetName(k);
                        dict[colName] = reader.IsDBNull(k) ? null! : reader.GetValue(k);
                    }
                    lines.Add(dict);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching purchase order lines from SQL.");
            throw;
        }

        return lines;
    }

    public async Task<bool> MarkPurchaseOrderAsUploadedAsync(string poId, string poType)
    {
        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();

            // Note: In SQL Server, you cannot UPDATE a view (vAllPurchaseOrderDetails) if it affects multiple base tables
            // or if it has complex logic. Assuming `PurchaseOrderDetail` is the base table for the lines' `IsSynced`.
            // We will execute a batch query to update both the parent PO and its detail lines.

            string detailTable = string.Equals(poType, "Fuel", StringComparison.OrdinalIgnoreCase)
                ? "POrderFuelDetail"
                : "PurchaseOrderDetail";

            var query = $@"
                UPDATE GenJournalHeader SET IsSynced = 1 WHERE OID = @oid;
                UPDATE {detailTable} SET IsSynced = 1 WHERE GenJournalID = @oid;
            ";

            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@oid", poId);

            int rows = await cmd.ExecuteNonQueryAsync();

            // Even if lines don't exist, as long as no error is thrown, it's considered successfully processed from our end.
            // If the parent PO was found and updated, rows > 0.
            return rows > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating IsSynced status for PO: {PoId}", poId);
            return false;
        }
    }

    public async Task<bool> MarkPurchaseOrderLineAsUploadedAsync(string lineOid, string poType)
    {
        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();

            string detailTable = string.Equals(poType, "Fuel", StringComparison.OrdinalIgnoreCase)
                ? "POrderFuelDetail"
                : "PurchaseOrderDetail";

            var query = $@"
                UPDATE {detailTable} SET IsSynced = 1 WHERE OID = @oid;
            ";

            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@oid", lineOid);

            int rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating IsSynced status for PO Line: {LineId}", lineOid);
            return false;
        }
    }

    public async Task<List<Dictionary<string, object>>> GetReSyncPurchaseOrdersAsync()
    {
        var orders = new List<Dictionary<string, object>>();
        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();
            var cmd = new SqlCommand("SELECT * FROM vAllPurchaseOrders_ReSync", conn);

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var dict = new Dictionary<string, object>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    string colName = reader.GetName(i);
                    dict[colName] = reader.IsDBNull(i) ? null! : reader.GetValue(i);
                }
                orders.Add(dict);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching resync purchase orders from SQL.");
            throw;
        }

        return orders;
    }

    public async Task<List<Dictionary<string, object>>> GetReSyncPurchaseOrderLinesAsync(IEnumerable<string> poIds)
    {
        var lines = new List<Dictionary<string, object>>();

        var poIdHashSet = new HashSet<string>(poIds);
        if (poIdHashSet.Count == 0) return lines;

        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();

            var cmd = new SqlCommand("SELECT * FROM vAllPurchaseOrderDetail_ReSync", conn);

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                int journalIdOrdinal = reader.GetOrdinal("GenJournalID");
                if (reader.IsDBNull(journalIdOrdinal)) continue;

                string journalId = reader.GetValue(journalIdOrdinal).ToString() ?? string.Empty;

                if (poIdHashSet.Contains(journalId))
                {
                    var dict = new Dictionary<string, object>();
                    for (int k = 0; k < reader.FieldCount; k++)
                    {
                        string colName = reader.GetName(k);
                        dict[colName] = reader.IsDBNull(k) ? null! : reader.GetValue(k);
                    }
                    lines.Add(dict);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching resync purchase order lines from SQL.");
            throw;
        }

        return lines;
    }

    public async Task<bool> MarkPurchaseOrderAsReSyncedAsync(string poId)
    {
        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();

            var query = "UPDATE GenJournalHeader SET ReSynced = 0 WHERE OID = @oid;";

            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@oid", poId);

            int rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating ReSynced status for PO: {PoId}", poId);
            return false;
        }
    }

    public async Task<List<Dictionary<string, object>>> GetPendingDeletionsAsync()
    {
        var deletions = new List<Dictionary<string, object>>();
        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();
            var cmd = new SqlCommand("SELECT OID, POType, RowType, RowId FROM PoSyncDeletionsQueue", conn);

            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var dict = new Dictionary<string, object>();
                for (int i = 0; i < reader.FieldCount; i++)
                {
                    string colName = reader.GetName(i);
                    dict[colName] = reader.IsDBNull(i) ? null! : reader.GetValue(i);
                }
                deletions.Add(dict);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching pending deletions from SQL.");
            throw;
        }

        return deletions;
    }

    public async Task<bool> RemoveFromDeletionQueueAsync(int queueOid)
    {
        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();
            var cmd = new SqlCommand("DELETE FROM PoSyncDeletionsQueue WHERE OID = @oid", conn);
            cmd.Parameters.AddWithValue("@oid", queueOid);
            int rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing OID {QueueOid} from deletion queue.", queueOid);
            return false;
        }
    }

    public async Task<bool> UpdatePurchaseOrderStatusAsync(string oid, int status, string statusBy, DateTime statusDate, string? remarks, string? rejectionReason, string poType)
    {
        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();

            using var cmd = new SqlCommand("UpdatePurchaseOrderStatus", conn);
            cmd.CommandType = System.Data.CommandType.StoredProcedure;

            cmd.Parameters.AddWithValue("@OID", oid);
            cmd.Parameters.AddWithValue("@Status", status);
            cmd.Parameters.AddWithValue("@StatusBy", (object?)statusBy ?? DBNull.Value);

            // Handle SqlDateTime overflow if statusDate is minimal e.g. DateTime.MinValue
            object dbStatusDate = statusDate < (DateTime)System.Data.SqlTypes.SqlDateTime.MinValue
                ? System.Data.SqlTypes.SqlDateTime.MinValue.Value
                : statusDate;
            cmd.Parameters.AddWithValue("@StatusDate", dbStatusDate);
            cmd.Parameters.AddWithValue("@Remarks", (object?)remarks ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@RejectionReason", (object?)rejectionReason ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@PoType", poType);

            int rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for PO: {PoId}", oid);
            return false;
        }
    }

    public async Task<bool> UpdatePurchaseOrderLineStatusAsync(string oid, int lineApprovalStatus, string? remarks, string poType)
    {
        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();

            string table = string.Equals(poType, "Fuel", StringComparison.OrdinalIgnoreCase)
                ? "POrderFuelDetail"
                : "PurchaseOrderDetail";

            var query = $@"
                UPDATE {table}
                SET 
                    LineApprovalStatus = @lineStatusInt,
                    Remarks = @remarks
                WHERE OID = @oid;
            ";

            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@lineStatusInt", lineApprovalStatus);
            cmd.Parameters.AddWithValue("@remarks", (object?)remarks ?? DBNull.Value);
            cmd.Parameters.AddWithValue("@oid", oid);

            int rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating status for PO Line: {LineId}", oid);
            return false;
        }
    }
}
