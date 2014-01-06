using System;
using System.Linq;
using System.Runtime.Remoting.Channels;
using FubuPersistence;
using FubuPersistence.InMemory;
using FubuTestingSupport;
using Fudo.Features.Todo;
using Fudo.Services;
using NUnit.Framework;
using Rhino.Mocks;

namespace Fudu.Tests
{
    [TestFixture]
    public class ServicesTest : InteractionContext<TaskService>
    {

        private Todo input;
        private EntityRepository repository;
        private Todo dbElement;

        protected override void beforeEach()
        {
            input = new Todo()
            {
                Id = new Guid(),
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

            MockFor<ITaskService>().Stub(t => t.Create(input)).Return(dbElement);

            repository = EntityRepository.InMemory();
            Services.Inject<IEntityRepository>(repository);


            ClassUnderTest.Create(input);
        }

        [Test]
        public void create_todo()
        {
            var todo = repository.All<Todo>().Single();
            todo.ShouldNotBeNull();
        }

        public void update_todo()
        {

        }

        public void delete_todo()
        {

        }

        public void get_single_todo()
        {

        }

        public void get_all_todos()
        {

        }
    }
}
