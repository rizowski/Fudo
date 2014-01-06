using System;
using System.Web;
using FubuMVC.Core;
using Fudo.App_Start;
using Fudo.Services;
using Raven.Client;
using StructureMap;

namespace Fudo
{
    public class Global : HttpApplication
    {
        private FubuRuntime runtime;

        protected void Application_Start(object sender, EventArgs e)
        {
            runtime = FubuApplication.BootstrapApplication<FuduApplication>();
            //ObjectFactory.Configure(config =>
            //{
            //    config.For<ITaskService>().Use<TaskService>();
            //});
        }

        protected void Application_End(object sender, EventArgs e)
        {
            runtime.Dispose();
        }
    }
}