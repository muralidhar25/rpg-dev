using DAL.Services.RulesetTileServices;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace DAL
{
    public class BackgroundProcesses : IHostedService, IDisposable
    {
        private readonly ILogger<RulesetTileService> _logger;
        private Timer _timer;
        public IServiceProvider _serviceProvider { get; }

        public BackgroundProcesses(ILogger<RulesetTileService> logger, IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("RestaurantTimerService Background Service is starting.");

            _timer = new Timer(RestaurantTimer_Start, null, TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(10));
            return Task.CompletedTask;
        }

        private void RestaurantTimer_Start(object state)
        {
            _logger.LogInformation("Timed Background Service is working.");

            using (var scope = _serviceProvider.CreateScope())
            {
                var _processingService = scope.ServiceProvider.GetRequiredService<IRulesetTileService>();
                //_processingService.BGProcess();
            }
        }

        public Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("RestaurantTimerService Background Service is stopping.");

            _timer?.Change(Timeout.Infinite, 0);
            return Task.CompletedTask;
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
