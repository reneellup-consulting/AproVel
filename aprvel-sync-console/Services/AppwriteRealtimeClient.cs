using System.Net.WebSockets;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Logging;

namespace aprvel_sync_console.Services;

public class RealtimeEventArgs : EventArgs
{
    public required JsonElement Payload { get; set; }
    public required string[] Channels { get; set; }
    public required string[] Events { get; set; }
}

public interface IAppwriteRealtimeClient : IDisposable
{
    event EventHandler<RealtimeEventArgs>? OnMessage;
    Task StartAsync(IEnumerable<string> channels, CancellationToken cancellationToken = default);
    Task StopAsync(CancellationToken cancellationToken = default);
}

public class AppwriteRealtimeClient : IAppwriteRealtimeClient
{
    private readonly string _endpoint;
    private readonly string _projectId;
    private readonly ILogger<AppwriteRealtimeClient> _logger;
    private ClientWebSocket? _webSocket;
    private CancellationTokenSource? _reconnectCts;
    private IEnumerable<string> _channels = Array.Empty<string>();
    
    public event EventHandler<RealtimeEventArgs>? OnMessage;

    public AppwriteRealtimeClient(string endpoint, string projectId, ILogger<AppwriteRealtimeClient> logger)
    {
        // WS endpoint usually looks like: wss://[ENDPOINT]/v1/realtime
        var uri = new Uri(endpoint);
        var scheme = uri.Scheme == "https" ? "wss" : "ws";
        _endpoint = $"{scheme}://{uri.Authority}/v1/realtime";
        _projectId = projectId;
        _logger = logger;
    }

    public async Task StartAsync(IEnumerable<string> channels, CancellationToken cancellationToken = default)
    {
        _channels = channels;
        _reconnectCts = CancellationTokenSource.CreateLinkedTokenSource(cancellationToken);
        
        // Start the connection and receive loop in the background
        _ = Task.Run(() => ConnectAndReceiveLoopAsync(_reconnectCts.Token), _reconnectCts.Token);
        await Task.CompletedTask;
    }

    public async Task StopAsync(CancellationToken cancellationToken = default)
    {
        if (_reconnectCts != null)
        {
            await _reconnectCts.CancelAsync();
        }

        if (_webSocket != null && _webSocket.State == WebSocketState.Open)
        {
            try
            {
                await _webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Closing", cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error while closing WebSocket.");
            }
        }
    }

    private async Task ConnectAndReceiveLoopAsync(CancellationToken cancellationToken)
    {
        while (!cancellationToken.IsCancellationRequested)
        {
            try
            {
                _webSocket?.Dispose();
                _webSocket = new ClientWebSocket();
                _webSocket.Options.KeepAliveInterval = TimeSpan.FromSeconds(30);

                // Build Connection URI
                // Format: wss://cloud.appwrite.io/v1/realtime?project=YOUR_PROJECT_ID&channels[]=databases.YOUR_DATABASE_ID.collections.YOUR_COLLECTION_ID.documents
                var uriBuilder = new StringBuilder($"{_endpoint}?project={_projectId}");
                foreach (var channel in _channels)
                {
                    uriBuilder.Append($"&channels[]={channel}");
                }

                _logger.LogInformation("Connecting to Appwrite Realtime WebSocket...");
                await _webSocket.ConnectAsync(new Uri(uriBuilder.ToString()), cancellationToken);
                _logger.LogInformation("Appwrite Realtime WebSocket connected successfully.");

                var buffer = new byte[8192];
                var messageBuilder = new StringBuilder();

                while (_webSocket.State == WebSocketState.Open && !cancellationToken.IsCancellationRequested)
                {
                    var result = await _webSocket.ReceiveAsync(new ArraySegment<byte>(buffer), cancellationToken);

                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        _logger.LogInformation("WebSocket closed by server.");
                        break;
                    }

                    var messageChunk = Encoding.UTF8.GetString(buffer, 0, result.Count);
                    messageBuilder.Append(messageChunk);

                    if (result.EndOfMessage)
                    {
                        var jsonMessage = messageBuilder.ToString();
                        messageBuilder.Clear();
                        
                        ProcessMessage(jsonMessage);
                    }
                }
            }
            catch (OperationCanceledException)
            {
                // Normal shutdown
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "WebSocket connection error. Attempting to reconnect in 5 seconds...");
                
                try
                {
                    await Task.Delay(TimeSpan.FromSeconds(5), cancellationToken);
                }
                catch (OperationCanceledException)
                {
                    break;
                }
            }
        }
    }

    private void ProcessMessage(string jsonMessage)
    {
        try
        {
            using var document = JsonDocument.Parse(jsonMessage);
            var root = document.RootElement;

            if (root.TryGetProperty("type", out var typeElement) && typeElement.GetString() == "event")
            {
                if (root.TryGetProperty("data", out var dataElement))
                {
                    var channels = Array.Empty<string>();
                    if (dataElement.TryGetProperty("channels", out var channelsElement) && channelsElement.ValueKind == JsonValueKind.Array)
                    {
                        channels = channelsElement.EnumerateArray().Select(c => c.GetString() ?? "").ToArray();
                    }

                    var eventsList = Array.Empty<string>();
                    if (dataElement.TryGetProperty("events", out var eventsElement) && eventsElement.ValueKind == JsonValueKind.Array)
                    {
                        eventsList = eventsElement.EnumerateArray().Select(e => e.GetString() ?? "").ToArray();
                    }

                    JsonElement payloadDoc = dataElement;
                    if (dataElement.TryGetProperty("payload", out var InnerPayloadElement))
                    {
                        payloadDoc = InnerPayloadElement;
                    }

                    OnMessage?.Invoke(this, new RealtimeEventArgs 
                    { 
                        Payload = payloadDoc.Clone(),
                        Channels = channels,
                        Events = eventsList
                    });
                }
            }
            else if (root.TryGetProperty("type", out var errorElement) && errorElement.GetString() == "error")
            {
                 // Appwrite might send an error back, like permission denied.
                 if (root.TryGetProperty("data", out var errorData))
                 {
                     _logger.LogWarning("Appwrite Realtime Error: {Error}", errorData.ToString());
                 }
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse Appwrite WebSocket message: {Message}", jsonMessage);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Appwrite WebSocket message.");
        }
    }

    public void Dispose()
    {
        _reconnectCts?.Cancel();
        _reconnectCts?.Dispose();
        _webSocket?.Dispose();
    }
}
