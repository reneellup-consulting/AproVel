namespace aprvel_sync_console.Configuration;

public class AppConfig
{
    public AppwriteSettings Appwrite { get; set; } = new();
    public ConnectionStrings ConnectionStrings { get; set; } = new();
}

public class AppwriteSettings
{
    public string Endpoint { get; set; } = string.Empty;
    public string ProjectId { get; set; } = string.Empty;
    public string ApiKey { get; set; } = string.Empty;
    public string DatabaseId { get; set; } = string.Empty;
    public string QueueCollectionId { get; set; } = string.Empty;
    public string AvailableCollectionId { get; set; } = string.Empty;
    public string OrderCollectionId { get; set; } = string.Empty;
    public string OrderDetailCollectionId { get; set; } = string.Empty;
}

public class ConnectionStrings
{
    public string SqlDb { get; set; } = string.Empty;
}
