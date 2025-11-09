using Microsoft.EntityFrameworkCore;
using Serilog;
using TracklioCPZMigration.Core.Data;
using TracklioCPZMigration.Core.Repositories;
using TracklioCPZMigration.Core.Services;
using TracklioCPZMigration.Worker;

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .Enrich.FromLogContext()
    .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level:u3}] {Message:lj}{NewLine}{Exception}")
    .WriteTo.File(
        "logs/migration-.log",
        rollingInterval: RollingInterval.Day,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz} [{Level:u3}] {Message:lj}{NewLine}{Exception}")
    .CreateLogger();

try
{
    Log.Information("Starting Tracklio CPZ Migration Worker");

    var builder = Host.CreateApplicationBuilder(args);

    // Use Serilog
    builder.Services.AddSerilog();

    // Configure database with PostGIS
    var connectionString = builder.Configuration.GetConnectionString("Database");

    if (string.IsNullOrEmpty(connectionString))
    {
        Log.Fatal("Database connection string not configured");
        return;
    }

    builder.Services.AddDbContext<ParkingZoneDbContext>(options =>
    {
        options.UseNpgsql(
            connectionString,
            npgsqlOptions => npgsqlOptions.UseNetTopologySuite());
    });

    // Register services
    builder.Services.AddScoped<IGeoJsonReader, GeoJsonReader>();
    builder.Services.AddScoped<IMigrationService, MigrationService>();
    builder.Services.AddScoped<IParkingZoneRepository, ParkingZoneRepository>();
    builder.Services.AddScoped<IMigrationLogRepository, MigrationLogRepository>();

    // Register worker
    builder.Services.AddHostedService<Worker>();

    var host = builder.Build();

    // Ensure database is created (for development)
    using (var scope = host.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<ParkingZoneDbContext>();

        Log.Information("Ensuring database exists and applying migrations...");
        await dbContext.Database.MigrateAsync();
        Log.Information("Database ready");
    }

    await host.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    await Log.CloseAndFlushAsync();
}
