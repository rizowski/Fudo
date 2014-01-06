
$(document).ready(function () {

    window.Todo = {
        serverCalls: {
            loadTodos: function(_callback, _errorcallback){
                $.ajax({
                    url: 'getall/todo',
                    type: 'GET',
                    dataType: 'json',
                    success: function(data){
                        _.each(data.Todos, function(todo){
                            todo.DueDate = moment(todo.DueDate);
                        });
                        data.Todos.sort(function(a, b){
                            return b.DueDate - a.DueDate
                        });
                        _callback(data);
                    },
                    error: function(xhr, error, data){
                        _errorcallback(xhr,error,data);
                    }
                });
            },
            updateTodo: function(todo, _callback){
                todo.DueDate = todo.DueDate.toJSON()
                $.ajax({
                    url: 'update/todo/',
                    type: 'PUT',
                    data: todo,
                    success: function(data){
                        _callback(data);
                    }
                });
            },
            createTodo: function(todo, _callback){
                $.ajax({
                    url: 'create/todo',
                    type: 'POST',
                    data: JSON.stringify(todo),
                    success: function(data){
                        _callback(data);
                    }
                });
            },
            deleteTodo: function(todoId, _callback){
                $.ajax({
                    url: 'delete/todo',
                    type: 'DELETE',
                    data: JSON.stringify({Id: todoId}),
                    success: function(data){
                        _callback(data);
                    }
                });
            }
        }
    };
    $.ajaxSetup({
        dataType: 'json'
    });

    //Load the Items
    //Set up listeners on the Todos for viewing data
    // Setup delete/Compeleted Functionality
    //Check null and inconsistant data before submit (server too)
    $('#todos').ready(function(){
        window.Todo.serverCalls.loadTodos(function(data){
            var notFinishedBody = $('#todos>tbody')
            var finishedBody = $('#finished>tbody')
            var todos = data.Todos;

            _.each(todos, function(todo){
                var line = "<tr id='"+todo.Id+"'><td><input id='"+todo.Id+"' type='checkbox'/></td><td id='"+todo.DueDate+"'>"+todo.DueDate.format('MMMM Do YYYY')+"</td><td>"+ todo.Name+"</td><td>" + todo.Description+ "</td></tr>";
                if(!todo.Completed)
                    notFinishedBody.prepend(line);
                
                $('#'+todo.Id).click(function(){
                    var contents = $('#'+this.id+">td");
                    var task ={
                        Id : this.id,
                        Name: $(contents[2]).html(),
                        Description: $(contents[3]).html(),
                        DueDate: moment(new Date(parseInt($(contents[1]).attr('id')))),
                        Completed : contents.find("input").prop('checked')
                    };
                    window.Todo.serverCalls.updateTodo(task, function(data){
                        // notFinishedBody.html('');
                        // finishedBody.html('');
                        // window.Todo.serverCalls.loadTodos();
                        //window.location.href= "/";
                    });
                    $(this).fadeOut(500);
                })
            });
        });
    });


    $('a#destructive').click(function(event){
        var action = confirm("Are you sure?");
        if(!action)
            event.preventDefault();
    })

    // $('#submit').click(function(event) {
    //     var values = $('#todoForm');
    //     _.each(values, function(item){
    //         console.log(item)
    //     });
    //     console.log(values);
    //     event.preventDefault();
    // });



});