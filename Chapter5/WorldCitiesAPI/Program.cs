using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Sinks.MSSqlServer;
using Serilog.Events;
using WorldCitiesAPI.Data;

var builder = WebApplication.CreateBuilder(args);

// Add Serilog support
builder.Host.UseSerilog((ctx, loggerConfig) => loggerConfig
.ReadFrom
.Configuration(ctx.Configuration)
.WriteTo.MSSqlServer(connectionString: ctx.Configuration.GetConnectionString("DefaultConnection"),
restrictedToMinimumLevel: LogEventLevel.Information,
sinkOptions: new MSSqlServerSinkOptions()
{
    TableName = "LogEvents",
    AutoCreateSqlTable = true,
})
.WriteTo.Console());

// Add services to the container.

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.WriteIndented = true);
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

var app = builder.Build();

app.UseSerilogRequestLogging();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
