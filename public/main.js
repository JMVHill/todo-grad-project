var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLabel = document.getElementById("count-label");

form.onsubmit = function(event) {
    var title = todoTitle.value;
    createTodo(title, function() {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

function createTodo(title, callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("POST", "/api/todo");
    createRequest.setRequestHeader("Content-type", "application/json");
    createRequest.send(JSON.stringify({
        title: title,
        isComplete: false
    }));
    createRequest.onload = function() {
        if (this.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function filterTodo() {
    var sender = event.target;
    var filterFunction = function(todo) { return true; };
    if (sender.id == "filter-complete") {
        filterFunction = function(todo) { return todo.isComplete; }
    }
    if (sender.id == "filter-active") {
        filterFunction = function(todo) { return todo.isComplete === false; }
    }
    reloadTodoList(filterFunction);
}

function deleteTodo() {
    var self = this;
    var deleteRequest = new XMLHttpRequest();
    deleteRequest.open("DELETE", "/api/todo/" + this.value);
    deleteRequest.setRequestHeader("Content-type", "application/json");
    deleteRequest.send();
    deleteRequest.onload = function() {
        if (this.status === 200) {
            self.parentNode.remove(self);
            reloadTodoList();
        } else {
            error.textContent = "Failed to delete item. Server returned " + this.status + " - " + this.responseText;
        }
    };
}

function deleteCompleted() {
    var self = this;
    var deleteCompRequest = new XMLHttpRequest();
    deleteCompRequest.open("DELETE", "/api/todo/");
    deleteCompRequest.setRequestHeader("Content-type", "application/json");
    deleteCompRequest.send();
    deleteCompRequest.onload = function() {
        if (this.status === 200) {
            reloadTodoList();
        } else {
            error.textContent = "Failed to delete completed items. Server returned " +
                this.status + " - " + this.responseText;
        }
    };
}

function compelteTodo() {
    var self = this;
    var putRequest = new XMLHttpRequest();
    putRequest.open("PUT", "/api/todo/");
    putRequest.setRequestHeader("Content-type", "application/json");
    putRequest.send(JSON.stringify({
        id: self.value,
        isComplete: true
    }));
    putRequest.onload = function() {
        if (this.status === 200) {
            reloadTodoList();
        } else {
            error.textContent = "Failed to mark item as complete. Server returned " +
                this.status + " - " + this.responseText;
        }
    };
}

function getTodoList(callback) {
    var createRequest = new XMLHttpRequest();
    createRequest.open("GET", "/api/todo");
    createRequest.onload = function() {
        if (this.status === 200) {
            callback(JSON.parse(this.responseText));
        } else {
            error.textContent = "Failed to get list. Server returned " + this.status + " - " + this.responseText;
        }
    };
    createRequest.send();
}

function reloadTodoList(filterFunction) {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    if (typeof filterFunction == "undefined") {
        filterFunction = function(todo) { return true; }
    }
    getTodoList(function(todos) {
        todoListPlaceholder.style.display = "none";
        todos = todos.filter(filterFunction);
        var uncompleteItems = 0;
        todos.forEach(function(todo) {
            var listItem = document.createElement("li");
            var deleteButton = document.createElement("button");
            var completeButton = document.createElement("button");
            deleteButton.id = "todo-delete";
            deleteButton.value = todo.id;
            deleteButton.textContent = "X";
            deleteButton.className = deleteButton.className + "button-custom";
            deleteButton.onclick = deleteTodo;
            completeButton.id = "todo-complete";
            completeButton.value = todo.id;
            completeButton.textContent = "Complete";
            completeButton.className = completeButton.className + "button-custom";
            completeButton.onclick = compelteTodo;
            listItem.textContent = todo.title + "   ";
            listItem.id = "todo-list-item";
            listItem.isComplete = todo.isComplete;
            if (listItem.isComplete) {
                listItem.style.fontWeight = "bold";
            } else {
                listItem.appendChild(completeButton);
                uncompleteItems += 1;
            }
            listItem.appendChild(deleteButton);
            todoList.appendChild(listItem);
        });
        countLabel.textContent = uncompleteItems + " remaining items.";
    });
}

reloadTodoList();
