using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Web;
using FubuPersistence;

namespace Fudo.Features.Todo
{
    public class Todo : ITodo
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool Completed { get; set; }
        public DateTime DueDate { get; set; }

        public Todo()
        {
            
        }

        public Todo(ITodo input)
        {
            Id = input.Id;
            Name = input.Name;
            Description = input.Description;
            Completed = input.Completed;
            DueDate = input.DueDate;
        }
    }
}