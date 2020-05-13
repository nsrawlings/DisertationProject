using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(DissertationPhysioSite.Startup))]
namespace DissertationPhysioSite
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
