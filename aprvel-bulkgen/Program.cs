using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using aprvel_bulkgen.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace aprvel_bulkgen;

class Program
{
    static async Task Main(string[] args)
    {
        var builder = Host.CreateApplicationBuilder(args);

        // Configuration
        builder.Services.Configure<AppConfig>(builder.Configuration);

        var host = builder.Build();

        // =========================================================================
        // ONE-TIME CSV EXPORT MODE
        // =========================================================================
        // Generates the CSVs and exits without starting the background sync engine.
        if (args.Contains("--export-csv"))
        {
            Console.WriteLine("--- Starting Appwrite CSV Export ---");

            // Extract the connection string safely using your existing AppConfig DI
            var appConfig = host.Services.GetRequiredService<IOptions<AppConfig>>().Value;
            var sqlConnectionString = appConfig.ConnectionStrings.SqlDb;

            // Initialize the new CSV Exporter
            var exporter = new CsvExportService(sqlConnectionString, appConfig.MaxRecordsPerFile);

            // Create a folder named "AppwriteExports" in the execution directory
            var exportPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "AppwriteExports");

            await exporter.ExportDataAsync(exportPath);

            Console.WriteLine($"\nExport complete! You can find your CSV files here:\n{exportPath}");
            Console.WriteLine("Exiting program.");
            return; // Stop execution here so the SyncEngine doesn't start
        }

        Console.WriteLine("Tip: Run the app with the '--export-csv' argument to generate bulk CSVs for Appwrite.");
    }
}