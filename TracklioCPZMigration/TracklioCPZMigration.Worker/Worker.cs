using Microsoft.Extensions.Logging;
using TracklioCPZMigration.Core.Services;

namespace TracklioCPZMigration.Worker;

/// <summary>
/// Background worker service that performs the CPZ GeoJSON migration.
/// Runs once on startup and then exits.
/// </summary>
public class Worker : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<Worker> _logger;
    private readonly IConfiguration _configuration;
    private readonly IHostApplicationLifetime _lifetime;

    public Worker(
        IServiceProvider serviceProvider,
        ILogger<Worker> logger,
        IConfiguration configuration,
        IHostApplicationLifetime lifetime)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
        _lifetime = lifetime;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("CPZ Migration Worker starting at: {Time}", DateTimeOffset.Now);

        try
        {
            // Get configuration
            var filePath = _configuration["Migration:FilePath"];
            var skipIfExists = _configuration.GetValue<bool>("Migration:SkipIfExists", true);
            var replaceExisting = _configuration.GetValue<bool>("Migration:ReplaceExisting", false);
            var batchSize = _configuration.GetValue<int>("Migration:BatchSize", 500);

            // Validate file path
            if (string.IsNullOrEmpty(filePath))
            {
                _logger.LogError("Migration:FilePath not configured in appsettings.json");
                return;
            }

            if (!File.Exists(filePath))
            {
                _logger.LogError("GeoJSON file not found: {FilePath}", filePath);
                return;
            }

            // Prepare migration options
            var options = new MigrationOptions
            {
                SkipIfExists = skipIfExists,
                ReplaceExisting = replaceExisting,
                BatchSize = batchSize
            };

            // Execute migration using a scope to resolve scoped services
            _logger.LogInformation("Starting migration from {FilePath}", filePath);

            using (var scope = _serviceProvider.CreateScope())
            {
                var migrationService = scope.ServiceProvider.GetRequiredService<IMigrationService>();
                await migrationService.MigrateAsync(filePath, options, stoppingToken);
            }

            _logger.LogInformation("Migration completed successfully at: {Time}", DateTimeOffset.Now);
        }
        catch (OperationCanceledException)
        {
            _logger.LogWarning("Migration was cancelled");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Migration failed with error");
            throw;
        }
        finally
        {
            // Stop the application after migration completes
            _lifetime.StopApplication();
        }
    }
}
