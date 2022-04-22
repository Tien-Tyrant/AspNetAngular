using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Sinks.MSSqlServer;
using Serilog.Events;
using WorldCitiesAPI.Data;
using WorldCitiesAPI.Data.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WorldCitiesAPI.Data.GraphQL;

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

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.SignIn.RequireConfirmedAccount = true;
    options.Password.RequireDigit = true;
    options.Password.RequireLowercase = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.Password.RequiredLength = 8;
}).AddEntityFrameworkStores<ApplicationDbContext>();

builder.Services.AddAuthentication(opt =>
{
    opt.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opt.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        RequireExpirationTime = true,
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(
                builder.Configuration["JwtSettings:SecurityKey"]))
    };
});

builder.Services.AddCors(options => 
options.AddPolicy(name: "AngularPolicy", corsPolicyBuilder =>
{
    corsPolicyBuilder.AllowAnyHeader();
    corsPolicyBuilder.AllowAnyMethod();
    corsPolicyBuilder.WithOrigins(builder.Configuration["AllowedCORS"]);
}));

builder.Services.AddScoped<JwtHandler>();

builder.Services.AddGraphQLServer()
    .AddAuthorization()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddFiltering()
    .AddSorting();

var app = builder.Build();
app.UseSerilogRequestLogging();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseCors("AngularPolicy");
app.MapControllers();
app.MapMethods("api/heartbeat", new[] { "HEAD" }, () => Results.Ok());
app.MapGraphQL("/api/graphql");

app.Run();
