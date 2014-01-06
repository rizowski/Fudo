using System;
using System.Security.Cryptography.X509Certificates;
using FubuMVC.Core;
using Fudo.Features.Home;

namespace Fudo.App_Start
{
    public class TodoRegistry : FubuRegistry
    {
        public TodoRegistry()
        {
            Actions.IncludeClassesSuffixedWithController();
            Actions.IncludeClassesSuffixedWithEndpoint();
            

            Routes.HomeIs<HomeInputModel>()
                .ConstrainToHttpMethod(x => x.Method.Name.StartsWith("get",  StringComparison.InvariantCultureIgnoreCase), "GET")
                .ConstrainToHttpMethod(x => x.Method.Name.StartsWith("create", StringComparison.InvariantCultureIgnoreCase), "POST")
                .ConstrainToHttpMethod(x => x.Method.Name.StartsWith("update", StringComparison.InvariantCultureIgnoreCase), "PUT")
                .ConstrainToHttpMethod(x => x.Method.Name.StartsWith("delete", StringComparison.InvariantCultureIgnoreCase), "DELETE")
                .IgnoreControllerNamespaceEntirely();
        }
        
    }
}