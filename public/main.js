var todoList = document.getElementById("todo-list");
var todoListPlaceholder = document.getElementById("todo-list-placeholder");
var form = document.getElementById("todo-form");
var todoTitle = document.getElementById("new-todo");
var error = document.getElementById("error");
var countLabel = document.getElementById("count-label");

form.onsubmit = function (event) {
    var title = todoTitle.value;
    createTodo(title, function () {
        reloadTodoList();
    });
    todoTitle.value = "";
    event.preventDefault();
};

// TO DO
function createTodo(title, callback) {
    fetch("/api/todo/", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"},
        body: JSON.stringify({
            title: title,
            isComplete: false})
    }).then(function(res) {
        if (res.status === 201) {
            callback();
        } else {
            error.textContent = "Failed to create item. Server returned " +
                res.status + " - " + res.statusText;
        }
    });
}

function filterTodo() {
    var sender = event.target;
    var filterFunction = function (todo) {
        return true;
    };
    if (sender.id === "filter-complete") {
        filterFunction = function (todo) {
            return todo.isComplete;
        };
    }
    if (sender.id === "filter-active") {
        filterFunction = function (todo) {
            return todo.isComplete === false;
        };
    }
    reloadTodoList(filterFunction);
}

function deleteTodo() {
    var self = this;
    fetch("/api/todo/" + this.value, {method: "DELETE"})
        .then(function(res) {
            if (res.status === 200) {
                reloadTodoList();
            } else {
                error.textContent = "Failed to delete item. Server returned " +
                    res.status + " - " + res.statusText;
            }
        });
}

function deleteCompleted() {
    fetch("/api/todo/", {method: "DELETE"})
        .then(function(res) {
            if (res.status === 200) {
                reloadTodoList();
            } else {
                error.textContent = "Failed to delete completed items. Server returned " +
                    res.status + " - " + res.statusText;
            }
        });
}

function compelteTodo() {
    var self = this;
    fetch("/api/todo/", {
        method: "PUT",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"},
        body: JSON.stringify({
            id: self.value,
            isComplete: true})
    }).then(function(res) {
        if (res.status === 200) {
            reloadTodoList();
        } else {
            error.textContent = "Failed to mark item as complete. Server returned " +
                res.status + " - " + res.statusText;
        }
    });
}

function getTodoList(callback) {
    fetch("/api/todo", {method: "GET"})
        .then(function(res) {
            if (res.status === 200) {
                return res.json();
            } else {
                error.textContent = "Failed to get list. Server returned " +
                    res.status + " - " + res.statusText;
            }
        }).then(function (json) {
            callback(json);
        })
        .catch(function(error) {
            error.textContent = "Failed to get list.";
            console.log(error);
        });
}

function reloadTodoList(filterFunction) {
    while (todoList.firstChild) {
        todoList.removeChild(todoList.firstChild);
    }
    todoListPlaceholder.style.display = "block";
    if (typeof filterFunction === "undefined") {
        filterFunction = function (todo) { return true; };
    }
    getTodoList(function (todos) {
        todoListPlaceholder.style.display = "none";
        var completeItems = todos.filter(function(todo) { return todo.isComplete === true; }).length;
        var activeItems = todos.filter(function(todo) { return todo.isComplete === false; }).length;
        todos = todos.filter(filterFunction);
        todos.forEach(function (todo) {
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
            }
            listItem.appendChild(deleteButton);
            todoList.appendChild(listItem);
        });
        countLabel.textContent = activeItems + " remaining items.";
        var deleteCompletedButton = document.getElementById("delete-complete");
        if (completeItems === 0) {
            deleteCompletedButton.style.display = "none";
        } else {
            deleteCompletedButton.style.display = "block";
        }
    });
}

reloadTodoList();
setInterval(reloadTodoList, 10000);
