using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(RPGSmith.Startup))]
namespace RPGSmith
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
