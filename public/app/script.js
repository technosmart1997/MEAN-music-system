    var app = angular.module('myApp',['appRoutes','usersCtrl','mainController','authService','managementcontroller']);

    app.config(function($httpProvider){
    	$httpProvider.interceptors.push('AuthInterceptor');
    });
