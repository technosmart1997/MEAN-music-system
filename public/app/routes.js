var route = angular.module('appRoutes',['ngRoute']);


route.config(function($routeProvider,$locationProvider){
        $routeProvider
       
        .when('/login',{    
            templateUrl : 'app/views/pages/login.html',
            authenticated : false
        })

        .when('/register',{
            templateUrl : 'app/views/pages/signup.html',
            controller  : 'regCtrl',
            authenticated : false
         })

        .when('/dashboard',{
            templateUrl : 'app/views/pages/dashboard.html',
            controller : 'dashCtrl',
            authenticated : true
        })

        .when('/home' , {
        	templateUrl : 'app/views/pages/test.html',
            authenticated : false	
        })

        .when('/songs/:movie_title/:movie_id' , {
            templateUrl : 'app/views/pages/songs.html',
            controller : 'songCtrl',
            authenticated : true   
        })

        .when('/management',{
            templateUrl : 'app/views/pages/management.html',
            controller : 'managementCtrl',
            authenticated : true,
            permission : ['admin', 'moderator']
        })


        .when('/edit/:id',{
            templateUrl : 'app/views/pages/edit.html',
            controller : 'editCtrl',
            authenticated : true,
            permission : ['admin', 'moderator']
        })
        
        .otherwise({
            redirectTo : '/login' 
        })

        // No Base Method Of AngularJS.

        $locationProvider.html5Mode({                             
            enabled: true,
            requireBase: false
        });
    });


route.run(['$rootScope','LoginInfo','$location','Permission',function($rootScope,LoginInfo,$location,Permission){
    $rootScope.$on('$routeChangeStart',function(event,next,current){
        if(next.$$route.authenticated == true){
            if(!LoginInfo.isloggedin()){
                event.preventDefault();
                $location.path('/login');
            }else if(next.$$route.permission){
                Permission.getPermission().then(function(response){
                    if(next.$$route.permission[0] !== response.data.permission){
                        if(next.$$route.permission[1] !== response.data.permission){
                            event.preventDefault();
                            $location.path('/dashboard');
                        }
                    }
                });
            }
            }
        else if(next.$$route.authenticated == false){
            if(LoginInfo.isloggedin()){
                event.preventDefault();
                $location.path('/dashboard');
            }
        }
    });
}]);



        
