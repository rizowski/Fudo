using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using FubuMVC.Core.Registration;
using FubuMVC.Validation;
using FubuValidation;

namespace Fudo.Features.Todo
{
    public class CreateTodoInputModel : ITodo
    {
        
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool Completed { get; set; }
        public DateTime DueDate { get; set; }


        public CreateTodoInputModel()
        {
            
        }
    }

    public class CreateTodoInputModelOverrides : OverridesFor<CreateTodoInputModel>
    {
        public CreateTodoInputModelOverrides()
        {
            Property(x => x.Name).Required();
            Property(x => x.DueDate).Required();
        }
    }
}