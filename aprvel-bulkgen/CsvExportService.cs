using System.Data;
using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;
using Microsoft.Data.SqlClient;

namespace aprvel_bulkgen;

public class CsvExportService(string connectionString, int maxRecordsPerFile)
{
    private readonly string _connectionString = connectionString;
    private readonly int _maxRecordsPerFile = maxRecordsPerFile;

    public async Task ExportDataAsync(string outputDirectory)
    {
        Directory.CreateDirectory(outputDirectory);

        Console.WriteLine("Exporting Orders...");
        await ExportOrdersAsync(outputDirectory, "appwrite_orders");

        Console.WriteLine("Exporting Order Lines...");
        await ExportOrderLinesAsync(outputDirectory, "appwrite_order_lines");

        Console.WriteLine("Export Complete!");
    }

    private async Task ExportOrdersAsync(string outputDirectory, string baseFileName)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        // Get total count for progress reporting
        long totalRecords = await GetRecordCountAsync("vAllPurchaseOrders", conn);
        long processed = 0;
        int fileCounter = 1;
        int currentFileRecordCount = 0;

        Console.WriteLine($"Found {totalRecords:N0} orders to export.");

        // Query your view
        using var cmd = new SqlCommand("SELECT * FROM vAllPurchaseOrders WITH (NOLOCK)", conn);
        using var reader = await cmd.ExecuteReaderAsync();

        StreamWriter? writer = null;
        CsvWriter? csv = null;

        using var updateConn = new SqlConnection(_connectionString);
        await updateConn.OpenAsync();
        using var markCmd = new SqlCommand("UPDATE GenJournalHeader SET IsSynced = 1, ReSynced = 0 WHERE OID = @Oid", updateConn);
        markCmd.Parameters.Add("@Oid", SqlDbType.Int);

        try
        {
            while (await reader.ReadAsync())
            {
                if (csv == null || currentFileRecordCount >= _maxRecordsPerFile)
                {
                    // Close previous file if open
                    if (csv != null)
                    {
                        csv.Dispose();
                        writer?.Dispose();
                    }

                    // Start new file
                    string filePath = Path.Combine(outputDirectory, $"{baseFileName}_{fileCounter}.csv");
                    writer = new StreamWriter(filePath);
                    csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture));
                    WriteOrderHeader(csv);

                    fileCounter++;
                    currentFileRecordCount = 0;
                }

                var oid = GetString(reader, "OID");

                csv.WriteField($"po-{oid}");

                csv.WriteField(GetString(reader, "PO_Type"));
                csv.WriteField(oid); // ref_id
                csv.WriteField(GetString(reader, "SourceNo"));
                csv.WriteField(GetString(reader, "Status"));
                csv.WriteField(GetString(reader, "StatusBy"));
                csv.WriteField(GetIsoDate(reader, "StatusDate"));
                csv.WriteField(GetString(reader, "VendorName"));
                csv.WriteField(GetString(reader, "VendorAddress"));
                csv.WriteField(GetString(reader, "ShipToAddress"));
                csv.WriteField(GetString(reader, "ReferenceNo"));
                csv.WriteField(GetIsoDate(reader, "EntryDate"));
                csv.WriteField(GetIsoDate(reader, "ExpectedDate"));
                csv.WriteField(GetString(reader, "Remarks"));
                csv.WriteField(""); // rejection_reason
                csv.WriteField(GetString(reader, "Comments"));
                csv.WriteField(GetString(reader, "History"));
                
                // UPDATED: Now points to TotalAmount from the updated SQL View
                csv.WriteField(GetNumber(reader, "TotalAmount")); 
                
                csv.WriteField(GetString(reader, "FuelCustomer"));
                csv.WriteField(GetString(reader, "UnitNo"));
                csv.WriteField(GetNumber(reader, "MeterRead"));
                csv.WriteField(GetString(reader, "TaggedTrips"));
                csv.WriteField(GetString(reader, "FuelUsageClass"));
                csv.WriteField(GetString(reader, "TripType"));
                csv.WriteField(GetString(reader, "Driver"));
                csv.WriteField(GetIsoDate(reader, "PrevGasDate"));
                csv.WriteField(GetNumber(reader, "PrevMeter"));
                csv.WriteField(GetNumber(reader, "NoOfLtrs"));
                csv.WriteField(GetNumber(reader, "FuelPrice"));
                csv.WriteField(GetNumber(reader, "PrevTotalAmt"));
                csv.NextRecord();

                if (int.TryParse(oid, out var parsedOid))
                {
                    markCmd.Parameters["@Oid"].Value = parsedOid;
                    await markCmd.ExecuteNonQueryAsync();
                }

                processed++;
                currentFileRecordCount++;

                if (processed % 100 == 0 || processed == totalRecords)
                {
                    ReportProgress(processed, totalRecords);
                }
            }
        }
        finally
        {
            csv?.Dispose();
            writer?.Dispose();
        }

        Console.WriteLine(); // New line after progress complete
    }

    private async Task ExportOrderLinesAsync(string outputDirectory, string baseFileName)
    {
        using var conn = new SqlConnection(_connectionString);
        await conn.OpenAsync();

        // Get total count for progress reporting
        long totalRecords = await GetRecordCountAsync("vAllPurchaseOrdreDetails", conn);
        long processed = 0;
        int fileCounter = 1;
        int currentFileRecordCount = 0;

        Console.WriteLine($"Found {totalRecords:N0} order lines to export.");

        using var cmd = new SqlCommand("SELECT * FROM vAllPurchaseOrdreDetails WITH (NOLOCK)", conn);
        using var reader = await cmd.ExecuteReaderAsync();

        StreamWriter? writer = null;
        CsvWriter? csv = null;

        using var updateConn = new SqlConnection(_connectionString);
        await updateConn.OpenAsync();
        
        using var markDetailCmd = new SqlCommand("UPDATE PurchaseOrderDetail SET IsSynced = 1 WHERE OID = @Oid", updateConn);
        markDetailCmd.Parameters.Add("@Oid", SqlDbType.Int);

        using var markFuelCmd = new SqlCommand("UPDATE POrderFuelDetail SET IsSynced = 1 WHERE OID = @Oid", updateConn);
        markFuelCmd.Parameters.Add("@Oid", SqlDbType.Int);

        try
        {
            while (await reader.ReadAsync())
            {
                if (csv == null || currentFileRecordCount >= _maxRecordsPerFile)
                {
                    // Close previous file if open
                    if (csv != null)
                    {
                        csv.Dispose();
                        writer?.Dispose();
                    }

                    // Start new file
                    string filePath = Path.Combine(outputDirectory, $"{baseFileName}_{fileCounter}.csv");
                    writer = new StreamWriter(filePath);
                    csv = new CsvWriter(writer, new CsvConfiguration(CultureInfo.InvariantCulture));
                    WriteOrderLineHeader(csv);

                    fileCounter++;
                    currentFileRecordCount = 0;
                }

                var oid = GetString(reader, "OID");
                var parentRefId = GetString(reader, "GenJournalID"); // Foreign Key
                var recordType = GetString(reader, "RecordType");

                csv.WriteField($"line-{oid}");
                
                // Foreign Key targeting the Order's $id
                csv.WriteField($"po-{parentRefId}"); 
                
                csv.WriteField(oid); // line_ref_id
                csv.WriteField(recordType);
                csv.WriteField(GetString(reader, "Item"));
                csv.WriteField(GetString(reader, "Requestor"));
                csv.WriteField(GetString(reader, "ChargeTo"));
                csv.WriteField(GetNumber(reader, "Quantity"));
                csv.WriteField(GetString(reader, "UOM"));
                csv.WriteField(GetNumber(reader, "BaseCost"));
                csv.WriteField(GetNumber(reader, "Total"));
                csv.WriteField(GetString(reader, "Reason"));
                csv.WriteField(GetString(reader, "LineApprovalStatus"));
                csv.WriteField(GetString(reader, "Department"));
                csv.WriteField(GetString(reader, "RequisitionNo"));
                csv.WriteField(GetNumber(reader, "LineDiscount"));
                csv.WriteField(GetNumber(reader, "RemainingQty"));
                csv.WriteField(GetString(reader, "Origin"));
                csv.WriteField(GetString(reader, "Destination"));
                csv.WriteField(GetString(reader, "CodeNo"));
                csv.WriteField(GetNumber(reader, "Tad"));
                csv.NextRecord();

                if (int.TryParse(oid, out var parsedOid))
                {
                    if (recordType == "General")
                    {
                        markDetailCmd.Parameters["@Oid"].Value = parsedOid;
                        await markDetailCmd.ExecuteNonQueryAsync();
                    }
                    else if (recordType == "Fuel")
                    {
                        markFuelCmd.Parameters["@Oid"].Value = parsedOid;
                        await markFuelCmd.ExecuteNonQueryAsync();
                    }
                }

                processed++;
                currentFileRecordCount++;

                if (processed % 100 == 0 || processed == totalRecords)
                {
                    ReportProgress(processed, totalRecords);
                }
            }
        }
        finally
        {
            csv?.Dispose();
            writer?.Dispose();
        }

        Console.WriteLine(); // New line after progress complete
    }

    private static void WriteOrderHeader(CsvWriter csv)
    {
        csv.WriteField("po_id");
        csv.WriteField("po_type");
        csv.WriteField("ref_id");
        csv.WriteField("source_no");
        csv.WriteField("status");
        csv.WriteField("status_by");
        csv.WriteField("status_date");
        csv.WriteField("vendor");
        csv.WriteField("vendor_address");
        csv.WriteField("ship_to_address");
        csv.WriteField("ref_nos");
        csv.WriteField("entry_date");
        csv.WriteField("expected_date");
        csv.WriteField("remarks");
        csv.WriteField("rejection_reason");
        csv.WriteField("comments");
        csv.WriteField("history");
        csv.WriteField("amount");
        csv.WriteField("fuel_customer");
        csv.WriteField("unit_no");
        csv.WriteField("meter_read");
        csv.WriteField("tagged_trips");
        csv.WriteField("fuel_usage_class");
        csv.WriteField("trip_type");
        csv.WriteField("driver");
        csv.WriteField("prev_gas_date");
        csv.WriteField("prev_meter");
        csv.WriteField("prev_no_liters");
        csv.WriteField("prev_price");
        csv.WriteField("prev_total_amt");
        csv.NextRecord();
    }

    private static void WriteOrderLineHeader(CsvWriter csv)
    {
        csv.WriteField("line_id");
        csv.WriteField("parent_id");
        csv.WriteField("line_ref_id");
        csv.WriteField("record_type");
        csv.WriteField("item");
        csv.WriteField("requestor");
        csv.WriteField("charge_to");
        csv.WriteField("quantity");
        csv.WriteField("unit_of_measure");
        csv.WriteField("unit_cost");
        csv.WriteField("total");
        csv.WriteField("reason");
        csv.WriteField("line_status");
        csv.WriteField("facility_department");
        csv.WriteField("requisition_no");
        csv.WriteField("discount");
        csv.WriteField("remaining_qty");
        csv.WriteField("origin");
        csv.WriteField("destination");
        csv.WriteField("code_no");
        csv.WriteField("tad");
        csv.NextRecord();
    }

    private static async Task<long> GetRecordCountAsync(string tableName, SqlConnection conn)
    {
        // Don't close the connection here, it's managed by the caller
        using var cmd = new SqlCommand($"SELECT COUNT(*) FROM {tableName}", conn);
        var result = await cmd.ExecuteScalarAsync();
        return result != null ? Convert.ToInt64(result) : 0;
    }

    private static void ReportProgress(long current, long total)
    {
        double percentage = total > 0 ? (double)current / total * 100 : 0;
        Console.Write($"\rProgress: {current:N0}/{total:N0} ({percentage:F2}%)");
    }

    // --- Helper Methods to handle SQL NULLs gracefully ---

    private static string GetString(SqlDataReader reader, string columnName)
    {
        int colIndex = reader.GetOrdinal(columnName);
        return reader.IsDBNull(colIndex) ? string.Empty : reader[colIndex].ToString() ?? string.Empty;
    }

    private static string GetNumber(SqlDataReader reader, string columnName)
    {
        int colIndex = reader.GetOrdinal(columnName);
        // Returns string format so CsvHelper prints it without formatting issues
        return reader.IsDBNull(colIndex) ? "" : reader[colIndex].ToString() ?? "";
    }

    private static string GetIsoDate(SqlDataReader reader, string columnName)
    {
        int colIndex = reader.GetOrdinal(columnName);
        if (reader.IsDBNull(colIndex)) return string.Empty;

        var date = reader.GetDateTime(colIndex);
        // Appwrite requires ISO 8601 DateTime format
        return date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");
    }
}