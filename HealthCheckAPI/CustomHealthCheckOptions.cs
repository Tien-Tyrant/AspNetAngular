using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Newtonsoft.Json;
using System.Net.Mime;

namespace HealthCheckAPI
{
    public class CustomHealthCheckOptions : HealthCheckOptions
    {
        public CustomHealthCheckOptions() : base()
        {
            ResponseWriter = async (c, r) =>
          {
              c.Response.ContentType = MediaTypeNames.Application.Json;
              c.Response.StatusCode = StatusCodes.Status200OK;

              var result = JsonConvert.SerializeObject(new
              {
                  checks = r.Entries.Select(e => new
                  {
                      name = e.Key,
                      responseTime = e.Value.Duration.TotalMilliseconds,
                      status = e.Value.Status.ToString(),
                      description = e.Value.Description
                  }),
                  totalStatus = r.Status,
                  totalResponseTime = r.TotalDuration.TotalMilliseconds
              }, Formatting.Indented);

              await c.Response.WriteAsync(result);
          };
        }
    }
}
