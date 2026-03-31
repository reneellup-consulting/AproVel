using System.Data;
using aprvel_sync_console.Configuration;
using aprvel_sync_console.Models;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace aprvel_sync_console.Data;

public interface IEmployeeRepository
{
    Task<Dictionary<string, (string AppWriteUserId, string Permission)>> GetAuthorizedApproversWithAppwriteIdAsync();
    Task<bool> UpdateEmployeeClaimAsync(string oid, string userId, string dateUpdated);
}

public class SqlEmployeeRepository(IOptions<AppConfig> config, ILogger<SqlEmployeeRepository> logger) : IEmployeeRepository
{
    private readonly AppConfig _config = config.Value;
    private readonly ILogger<SqlEmployeeRepository> _logger = logger;

    private SqlConnection GetConnection() => new(_config.ConnectionStrings.SqlDb);

    public async Task<Dictionary<string, (string AppWriteUserId, string Permission)>> GetAuthorizedApproversWithAppwriteIdAsync()
    {
        var sqlData = new Dictionary<string, (string AppWriteUserId, string Permission)>();
        
        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();
            var cmd = new SqlCommand("SELECT OID, POApproverPermission, AppWriteUserId FROM Employee WHERE POApprover=1 AND (POApproverKeyClaimed = 1 OR AppWriteUserId IS NOT NULL)", conn);
            
            using var reader = await cmd.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                var oid = reader.GetGuid(0).ToString().ToUpper();
                
                int permissionVal = 0;
                if (!reader.IsDBNull(1))
                {
                    permissionVal = reader.GetInt32(1);
                }

                string appWriteUserId = string.Empty;
                if (!reader.IsDBNull(2))
                {
                    appWriteUserId = reader.GetString(2);
                }

                string permissionStr = permissionVal switch
                {
                    0 => "all",
                    1 => "general",
                    2 => "fuel",
                    3 => "purchaserAll",
                    4 => "purchaserGeneral",
                    5 => "purchaserFuel",
                    _ => "all"
                };

                sqlData[oid] = (appWriteUserId, permissionStr);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching authorized approvers with Appwrite IDs from SQL.");
            throw;
        }

        return sqlData;
    }

    public async Task<bool> UpdateEmployeeClaimAsync(string oid, string userId, string dateUpdated)
    {
        try
        {
            using var conn = GetConnection();
            await conn.OpenAsync();
            var query = "UPDATE Employee SET POApproverKeyClaimed = 1, AppWriteUserId = @uid, AppWriteLastUpdated = @dateUpdated WHERE OID = @oid";
            
            using var cmd = new SqlCommand(query, conn);
            cmd.Parameters.AddWithValue("@uid", userId);
            cmd.Parameters.AddWithValue("@oid", oid);
            cmd.Parameters.AddWithValue("@dateUpdated", dateUpdated);

            int rows = await cmd.ExecuteNonQueryAsync();
            return rows > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating employee claim for OID: {Oid}, User: {UserId}", oid, userId);
            return false;
        }
    }
}
