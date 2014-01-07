using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Fudo.Features.Todo;

namespace Fudo.Services
{
    public interface ITaskService
    {
        Todo Create(Todo todo);
        void Delete(Todo todo);
        Todo Update(Todo todo);
        Todo Get(Todo todo);
        IEnumerable<Todo> GetAll();
        void EraseAll();
    }
}
