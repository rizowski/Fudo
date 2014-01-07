using System;
using System.Diagnostics;
using System.Linq;
using FubuPersistence;
using FubuPersistence.InMemory;
using FubuTestingSupport;
using Fudo.Features.Home;
using Fudo.Features.Todo;
using Fudo.Services;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Mono.CSharp;
using NUnit.Framework;
using Raven.Client;
using Raven.Client.Document;
using Raven.Client.Linq;
using Raven.Database.Tasks;
using Rhino.Mocks;
using Xunit;

namespace Test.Services
{
    public class TodoServiceTest : InteractionContext<TaskService>
    {
        private ITaskService service;

        private Todo input;
        private EntityRepository repository;
        private Todo dbElement;

        private Todo createdTodo;
        private Todo updatedTodo;

        protected override void beforeEach()
        {
            input = new Todo()
            {
                Name = "TestTodo",
                Description = "Better do it",
                Completed = true,
                DueDate = new DateTime()
            };

            dbElement = new Todo()
            {
                Name = "TestTodo",
                Description = "Better do it",
                Completed = true
            };

            repository = EntityRepository.InMemory();
            
            Services.Inject<IEntityRepository>(repository);
            Services.Inject<ITransaction>(new InMemoryTransaction(Services.Container));

            ClassUnderTest.Create(dbElement);
            createdTodo = ClassUnderTest.Create(input);
            updatedTodo = ClassUnderTest.Update(input);
        }

        [Test]
        public void create_todo()
        {
            var todo = repository.All<Todo>().FirstOrDefault();
            todo.ShouldNotBeNull();

            createdTodo.Id.ShouldNotBeNull();
        }

        [Test]
        public void update_todo()
        {
            input.ShouldBeTheSameAs(updatedTodo);
        }

        [Test]
        public void delete_todo()
        {
            ClassUnderTest.Delete(createdTodo);
            var found = repository.FindWhere<Todo>(t => t.Id == createdTodo.Id);
            found.ShouldBeNull();
        }

        [Test]
        public void get_single_todo()
        {
            var found = ClassUnderTest.Get(new Todo()
            {
                Id = createdTodo.Id
            });
            found.Name.ShouldNotBeNull();
        }

        [Test]
        public void get_all_todos()
        {
            var all = ClassUnderTest.GetAll();
            all.ShouldNotBeEmpty();
            all.ShouldHaveCount(2);
        }


        // Erase all is not a production method. Just for debug.
        //[Test]
        //public void delete_all_todos()
        //{
        //    ClassUnderTest.EraseAll();
        //    var all = repository.All<Todo>();
        //    all.ShouldHaveCount(0);
        //}

    }
}
