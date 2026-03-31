## Publish the Application

1. Open the Developer Command Prompt for Visual Studio 2022.
2. Navigate to the project directory: cd d:\repos\aprvel\aprvel-sync-console
3. Run the publish command:

```
dotnet publish -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true -o ./publish
```

## Install as a Windows Service

1. Open the Developer Command Prompt for Visual Studio 2022.
2. Navigate to the publish directory: cd d:\repos\aprvel\aprvel-sync-console\publish
3. Install the service:

```
New-Service -Name "AprvelSyncService" -BinaryPathName "C:\Services\AprvelSyncConsole\aprvel-sync-console.exe" -DisplayName "Aprvel Sync Engine" -Description "Synchronizes purchase orders to Appwrite." -StartupType Automatic
```

## Start the Service

1. Open the Developer Command Prompt for Visual Studio 2022.
2. Start the service:

```
Start-Service -Name "AprvelSyncService"
```

## Stop the Service

1. Open the Developer Command Prompt for Visual Studio 2022.
2. Stop the service:

```
Stop-Service -Name "AprvelSyncService"
```

## Uninstall the Service

1. Open the Developer Command Prompt for Visual Studio 2022.
2. Stop the service:

```
Stop-Service -Name "AprvelSyncService"
```

3. Uninstall the service:

```
sc.exe delete "AprvelSyncService"
```
