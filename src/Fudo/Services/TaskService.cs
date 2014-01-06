using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Web;
using FubuPersistence;
using Fudo.Features.Todo;
using Raven.Client;
using Raven.Database.Tasks;

namespace Fudo.Services
{
    public class TaskService : ITaskService
    {
        private IEntityRepository _service;
        private ITransaction _transaction;
        private IDocumentSession _session;

        public TaskService(IEntityRepository service, ITransaction transaction, IDocumentSession session)
        {
            _service = service;
            _transaction = transaction;
            _session = session;
        }

        public void Create(Todo todo)
        {
            _transaction.WithRepository(t => t.Update(todo));
        }

        public void Delete(Todo todo)
        {
            var item = Get(todo);
            _session.Delete(item);
            _session.SaveChanges();
            
        }

        public void Update(Todo todo)
        {
            _transaction.WithRepository(t => t.Update(todo));
        }

        public Todo Get(Todo todo)
        {
            return _service.Find<Todo>(todo.Id);
        }

        public IEnumerable<Todo> GetAll()
        {
            return _service.All<Todo>();
        }

        public void EraseAll()
        {
            var all = GetAll();
            foreach (var item in all)
            {
                Delete(item);
            }
        }
    }
}