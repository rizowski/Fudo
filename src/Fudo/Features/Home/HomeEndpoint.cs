using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.ModelBinding;
using FubuMVC.Core;
using Fudo.Features.Todo;
using Raven.Client;

namespace Fudo.Features.Home
{
    public class HomeEndpoint
    {
        private IDocumentSession _session { get; set; }
        public HomeEndpoint(IDocumentSession session)
        {
            _session = session;
        }

        public HomeViewModel Get(HomeInputModel input)
        {
            //var tasks = _session.Query<CreateTodoInputModel>();
            return new HomeViewModel()
            {
                Message = "Person!"
            };
        }
    }
}