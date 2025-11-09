using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using TracklioCPZMigration.Core.Data;

namespace TracklioCPZMigration.Worker;

/// <summary>
/// Design-time factory for creating DbContext instances during migrations.
/// This is only used by EF Core tools at design time.
/// </summary>
public class ParkingZoneDbContextFactory : IDesignTimeDbContextFactory<ParkingZoneDbContext>
{
    public ParkingZoneDbContext CreateDbContext(string[] args)
    {
        // Build configuration
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        // Get connection string
        var connectionString = configuration.GetConnectionString("Database");

        if (string.IsNullOrEmpty(connectionString))
        {
            throw new InvalidOperationException("Database connection string not found in appsettings.json");
        }

        // Create DbContext options
        var optionsBuilder = new DbContextOptionsBuilder<ParkingZoneDbContext>();
        optionsBuilder.UseNpgsql(
            connectionString,
            npgsqlOptions => npgsqlOptions.UseNetTopologySuite());

        return new ParkingZoneDbContext(optionsBuilder.Options);
    }
}
