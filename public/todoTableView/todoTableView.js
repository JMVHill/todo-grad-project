"use strict";

angular.module("todoApp.todoTableView", ["ngRoute"])

    .config(["$routeProvider", function ($routeProvider) {
        $routeProvider.when("/todoTable", {
            templateUrl: "todoTableView/todoTableView.html",
            controller: "todoTableCtrl"
        });
    }])

    .controller("todoTableCtrl", ["$scope", "$http", function ($scope, $http) {

        // Declare/initialise variables
        $scope.todos = [];
        $scope.errorText = "";
        $scope.newTodoTitle = "";
        $scope.loadingList = false;
        $scope.completeCount = 0;
        $scope.incompleteCount = 0;
        $scope.filterFunction = function (todo) {
            return true;
        };

        // Create new todo
        $scope.createTodo = function () {
            $http.post("/api/todo/", {"title": $scope.newTodoTitle, "isComplete": false}).then(function (response) {
                $scope.updateList();
                $scope.newTodoTitle = "";
            }, function (response) {
                $scope.errorText = "Failed to create item. Server returned " +
                    response.status + " - " + response.statusText;
            });
        };

        // Filter todo items
        $scope.filterTodo = function (filterIndex) {
            if (filterIndex == 0) {
                $scope.filterFunction = function (todo) {
                    return true;
                };
            }
            ;
            if (filterIndex == 1) {
                $scope.filterFunction = function (todo) {
                    return todo.isComplete;
                };
            }
            ;
            if (filterIndex == 2) {
                $scope.filterFunction = function (todo) {
                    return !todo.isComplete;
                };
            }
            ;
            $scope.updateList();
        };

        // Delete a todo item
        $scope.deleteTodo = function (todo) {
            $http.delete("/api/todo/" + todo.id).then(function (response) {
                $scope.updateList();
            }, function (response) {
                $scope.errorText = "Failed to delete item. Server returned " +
                    response.status + " - " + response.statusText;
            });
        };

        // Delete all completed items
        $scope.deleteCompleted = function () {
            $http.delete("/api/todo/").then(function (response) {
                $scope.updateList();
            }, function (response) {
                $scope.errorText = "Failed to delete completed items. Server returned " +
                    response.status + " - " + response.statusText;
            });
        };

        // Mark todo as complete
        $scope.completeTodo = function (todo) {
            $http.put("/api/todo/", {"id": todo.id, "isComplete": true}).then(function (response) {
                $scope.updateList();
            }, function (response) {
                $scope.errorText = "Failed to mark item as complete. Server returned " +
                    response.status + " - " + response.statusText;
            });
        };

        // Update list function
        $scope.updateList = function () {
            $scope.loadingList = true;
            $http.get("/api/todo/").then(function (response) {
                var receivedTodos = response.data;
                $scope.loadingList = false;
                $scope.completeCount = receivedTodos.filter(function (todo) {
                    return todo.isComplete === true;
                }).length;
                $scope.incompleteCount = receivedTodos.filter(function (todo) {
                    return todo.isComplete === false;
                }).length;
                $scope.todos = receivedTodos.filter($scope.filterFunction);
            }, function (response) {
                $scope.errorText = "Failed to get list. Server returned " +
                    response.status + " - " + response.statusText;
                $scope.loadingList = false;
            });
        };

        // Call update list
        $scope.updateList();

    }]);