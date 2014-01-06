using System;
using System.Diagnostics;
using System.Web;
using FubuPersistence;
using Fudo.Services;
using Raven.Client;
using StructureMap.Configuration.DSL;

namespace Fudo.App_Start
{
    public class FudoStructureMapRegistry : Registry
    {
        public FudoStructureMapRegistry()
        {
            For<HttpContextBase>()
                .Use(() => new HttpContextWrapper(HttpContext.Current));
            For<ITaskService>().Use<TaskService>();
        }
    }
}