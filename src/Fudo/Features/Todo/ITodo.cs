using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using FubuPersistence;

namespace Fudo.Features.Todo
{
    public interface ITodo : IEntity
    {
        string Name { get; set; }
        string Description { get; set; }
        bool Completed { get; set; }
        DateTime DueDate { get; set; }
    }
}