var Hapi = require('hapi');
var joi = require('joi');

var dbOpts = {
    "url"       : "mongodb://localhost:27017/mytodos",
    "options"   : {
        "db"    : {
            "native_parser" : false
        }
    }
};

var server = new Hapi.Server(3000);

server.pack.register({
    plugin: require('hapi-mongodb'),
    options: dbOpts
}, function (err) {
    if (err) {
        console.error(err);
        throw err;
    }
});


server.route({
    method: 'GET',
    path: '/todos',
    handler: function (request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;
        db.collection('todos').find().toArray(function (err, doc){
            reply(doc);
        });
    }
});


server.route({
    method: 'GET',
    path: '/todo/{id}',
    handler: function (request, reply) {
        var db = request.server.plugins['hapi-mongodb'].db;
        var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

        db.collection('todos').findOne({  "_id" : new ObjectID(request.params.id) }, function(err, result) {
            if (err) return reply(Hapi.error.internal('Internal MongoDB error', err));
            reply(result);
        });
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
            var db = request.server.plugins['hapi-mongodb'].db;
            db.collection('todos').insert(newTodo, {w:1}, function (err, doc){
                if (err){
                    return reply(Hapi.error.internal('Internal MongoDB error', err));
                }else{
                    reply(doc);
                }
            });
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
        var db = request.server.plugins['hapi-mongodb'].db;
        var ObjectID = request.server.plugins['hapi-mongodb'].ObjectID;

        db.collection('todos').remove({"_id": new ObjectID(request.params.id)}, function (err){
            if (err) return reply(Hapi.error.internal('Internal MongoDB error', err));
            reply("Record Deleted");
        });
    }
});

server.start(function (){ console.log('Server running at:', server.info.uri)});
