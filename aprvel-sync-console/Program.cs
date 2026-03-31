using aprvel_sync_console.Configuration;
using aprvel_sync_console.Data;
using aprvel_sync_console.Services;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Serilog; // Added for Serilog

namespace aprvel_sync_console;

class Program
{
    static async Task Main(string[] args)
    {
        var builder = Host.CreateApplicationBuilder(args);

        var logDirectory = System.IO.Path.Combine(AppContext.BaseDirectory, "logs");

        // Configure Serilog
        Log.Logger = new LoggerConfiguration()
            .MinimumLevel.Information()
            .WriteTo.Console()
            .WriteTo.File(System.IO.Path.Combine(logDirectory, "sync-engine-.txt"), rollingInterval: RollingInterval.Day)
            .CreateLogger();

        builder.Services.AddSerilog();

        // Configuration
        builder.Services.Configure<AppConfig>(builder.Configuration);

        // Services
        builder.Services.AddSingleton<IEmployeeRepository, SqlEmployeeRepository>();
        builder.Services.AddSingleton<IPurchaseOrderRepository, SqlPurchaseOrderRepository>();

        builder.Services.AddSingleton<IAppwriteRealtimeClient>(sp =>
        {
            var config = sp.GetRequiredService<Microsoft.Extensions.Options.IOptions<AppConfig>>().Value;
            var logger = sp.GetRequiredService<ILogger<AppwriteRealtimeClient>>();
            return new AppwriteRealtimeClient(config.Appwrite.Endpoint, config.Appwrite.ProjectId, logger);
        });

        builder.Services.AddSingleton<IAppwriteService, AppwriteService>();

        // Hosted Service (The Loop)
        builder.Services.AddHostedService<SyncEngine>();

        // Register as a Windows Service
        builder.Services.AddWindowsService(options =>
        {
            options.ServiceName = "AprvelSyncService";
        });

        var host = builder.Build();

        await host.RunAsync();
    }
}
