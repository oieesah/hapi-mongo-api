var Hapi = require('hapi');
var joi = require('joi');
var todos = [
    {
    todo : "take a nap",
    note : "note for nap"
},

{
    todo : "buy a book",
    note : "note for book"
},

{
    todo : "read a blog",
    note : "note for blog"
}
];
var server = new Hapi.Server(3000);

server.route({
    method: 'GET',
    path: '/todos',
    handler: function (request, reply) {
        reply(todos);
    }
});


server.route({
    method: 'GET',
    path: '/todo/{id}',
    handler: function (request, reply) {
        if (request.params.id) {
            if (todos.length < request.params.id) {
                return reply('No item found.').code(404);
            }
            return reply(todos[request.params.id-1]);
        }
        reply(todos);
    }
});

server.route({
    method: 'POST',
    path: '/todos',
    config: {

        handler: function (request, reply) {
            var newTodo = {
                todo: request.payload.todo,
                note: request.payload.note
            };
            
            todos.push(newTodo);
            reply(todos);
        
        },

        validate: {
            payload: {
                todo: joi.string().required(),
                note: joi.string().required()
            }
        }

    }
});

server.route({
    method: 'DELETE',
    path: '/todo/{id}',
    handler: function(request, reply) {
        if (todos.length < request.params.id) {
            return reply('No Todo found.').code(404);
        }
        todos.splice((request.params.id-1), 1);
        reply(true);
    }
});



server.start(function (){ console.log('Server running at:', server.info.uri)});
