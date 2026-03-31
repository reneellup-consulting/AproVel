namespace aprvel_bulkgen.Configuration;

public class AppConfig
{
    public ConnectionStrings ConnectionStrings { get; set; } = new();
    public int MaxRecordsPerFile { get; set; } = 50000;
}

public class ConnectionStrings
{
    public string SqlDb { get; set; } = string.Empty;
}
