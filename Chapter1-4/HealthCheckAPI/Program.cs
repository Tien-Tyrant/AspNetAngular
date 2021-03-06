global using HealthCheckAPI;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddHealthChecks()
    .AddCheck("ICMP1", new ICMPHealthCheck("www.google.com", 100))
    .AddCheck("ICMP2", new ICMPHealthCheck("www.youtube.com", 100))
    .AddCheck("ICMP3", new ICMPHealthCheck($"www.{Guid.NewGuid():N}.com", 100))
    ;
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(options =>
options.AddPolicy(name: "AngularPolicy", corsPolicyBuilder =>
{
    corsPolicyBuilder.AllowAnyHeader();
    corsPolicyBuilder.AllowAnyMethod();
    corsPolicyBuilder.WithOrigins(builder.Configuration["AllowedCORS"]);
}));

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();
app.UseCors("AngularPolicy");
app.UseHealthChecks(new PathString("/api/health"), new CustomHealthCheckOptions());
app.MapControllers();
app.MapMethods("api/heartbeat", new[] { "HEAD" }, () => Results.Ok());
app.Run();