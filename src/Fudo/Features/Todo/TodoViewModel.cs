using System;
using System.Collections;
using System.Collections.Generic;

namespace Fudo.Features.Todo
{
    public class TodoViewModel
    {
        public Todo Todo { get; set; }
        public IEnumerable<ITodo> Todos { get; set; }

        public TodoViewModel()
        {
            
        }

        public TodoViewModel(CreateTodoInputModel model)
        {
            Todo = new Todo(model);
            Todos = new List<ITodo>();
        }
    }
}