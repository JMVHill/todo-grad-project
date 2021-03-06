var express = require("express");
var bodyParser = require("body-parser");
var _ = require("underscore");
//var bootstrap = require('bootstrap');

module.exports = function(port, middleware, callback) {
    var app = express();

    if (middleware) {
        app.use(middleware);
    }
    app.use(express.static("public"));
    app.use("/fetch/", express.static("node_modules/whatwg-fetch"));
    app.use(bodyParser.json());

    var latestId = 0;
    var todos = [];

    // Create
    app.post("/api/todo", function(req, res) {
        var todo = req.body;
        todo.id = latestId.toString();
        todo.isComplete = false;
        latestId++;
        todos.push(todo);
        res.set("Location", "/api/todo/" + todo.id);
        res.sendStatus(201);
    });

    // Read
    app.get("/api/todo", function(req, res) {
        res.json(todos);
    });

    // Delete
    app.delete("/api/todo/:id", function(req, res) {
        var id = req.params.id;
        var todo = getTodo(id);
        if (todo) {
            todos = todos.filter(function(otherTodo) {
                return otherTodo !== todo;
            });
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    // Delete
    app.delete("/api/todo/", function(reg, res) {
        try {
            todos = todos.filter(function(todo) {
                return todo.isComplete === false;
            });
            res.sendStatus(200);
        } catch (err) {
            res.sendStatus(404);
        }
    });

    // Update
    app.put("/api/todo/", function(reg, res) {
        var todo = reg.body;
        var existingTodo = getTodo(todo.id);
        if ((existingTodo) && (todo.id === existingTodo.id)) {
            if (typeof todo.title !== "undefined") {
                existingTodo.title = todo.title;
            }
            if (typeof todo.isComplete !== "undefined") {
                existingTodo.isComplete = todo.isComplete;
            }
            res.sendStatus(200);
        } else {
            res.sendStatus(404);
        }
    });

    function getTodo(id) {
        return _.find(todos, function(todo) {
            return todo.id === id;
        });
    }

    var server = app.listen(port, callback);

    // We manually manage the connections to ensure that they're closed when calling close().
    var connections = [];
    server.on("connection", function(connection) {
        connections.push(connection);
    });

    return {
        close: function(callback) {
            connections.forEach(function(connection) {
                connection.destroy();
            });
            server.close(callback);
        }
    };
};
