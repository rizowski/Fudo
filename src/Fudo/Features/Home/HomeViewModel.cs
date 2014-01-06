using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using Fudo.Features.Todo;

namespace Fudo.Features.Home
{
    public class HomeViewModel
    {
        public string Message { get; set; }
        public IEnumerable<ITodo> Todos { get; set; } 
    }
}