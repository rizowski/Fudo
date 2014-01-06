using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace Fudo.Features.Todo
{
    public class DeleteTodoInputModel : ITodo
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool Completed { get; set; }
        public DateTime DueDate { get; set; }
    }
}