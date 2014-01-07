using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography.X509Certificates;
using FubuMVC.Core;
using FubuMVC.Core.Continuations;
using Fudo.Features.Home;
using Fudo.Services;
using Raven.Client;

namespace Fudo.Features.Todo
{
    public class TodoController
    {
        private readonly ITaskService _session;

        public TodoController(ITaskService session)
        {
            _session = session;
        }

        #region AJAX
        public class AjaxResponse
        {
            public IEnumerable<Todo> Todos { get; set; }
            public Todo Todo { get; set; }
        }
        #region GET
        [UrlPattern("getall/todo")]
        public AjaxResponse get_all()
        {
            return new AjaxResponse()
            {
                Todos = _session.GetAll()
            };
        }
        #endregion
        #endregion

#region ClassMethods
        #region GET

        [UrlPattern("todo")]
        public TodoViewModel get_index()
        {
            return new TodoViewModel()
            {
                Todos = _session.GetAll().ToList()
            };
        }

        [UrlPattern("create/todo")]
        public CreateTodoViewModel get_create()
        {
            return new CreateTodoViewModel();
        }

        [UrlPattern("erase/everything")]
        public FubuContinuation get_erase()
        {
            _session.EraseAll();
            return FubuContinuation.RedirectTo<HomeInputModel>();
        }
        #endregion

        #region POST

        [UrlPattern("create/todo")]
        public FubuContinuation create_todo(CreateTodoInputModel todo)
        {
            _session.Create(new Todo(todo));
            return FubuContinuation.RedirectTo<HomeInputModel>();
        }

        #endregion

        #region UPDATE

        [UrlPattern("update/todo")]
        public UpdateTodoViewModel update_task(UpdateTodoInputModel todo)
        {
            _session.Update(new Todo(todo));
            return new UpdateTodoViewModel(todo);
        }

        #endregion

        #region DELETE

        [UrlPattern("delete/todo/{Id}")]
        public FubuContinuation get_task(DeleteTodoInputModel todo)
        {
            _session.Delete(new Todo(todo));
            return FubuContinuation.RedirectTo<HomeInputModel>();
        }

        #endregion
#endregion

        //[UrlPattern("show/todo/{Id}")]
        //public ShowTodoViewModel get_show(CreateTodoInputModel todo)
        //{
        //    var model = _session.Load<CreateTodoInputModel>(todo.Id);
        //    return model != null ? new ShowTodoViewModel(model) : new ShowTodoViewModel();
        //}

        //[UrlPattern("update/todo/{Id}")]
        //public UpdateTodoViewModel get_update(UpdateTodoInputModel todo)
        //{
        //    var model = _session.Load<CreateTodoInputModel>(todo.Id);
        //    return model != null ? new UpdateTodoViewModel(todo) : null;
        //}



        //This really should be a Delete HTTP Action. 
        //I am just being lazy to get the project done.

    }


}