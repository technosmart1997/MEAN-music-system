var app = angular.module('authService',[]);

app.factory('Authtoken',function($window){
    	return {

			setusertoken : function(token){
				if(token){
				 	$window.localStorage.setItem('usertoken',token);
				}else{
					$window.localStorage.removeItem('usertoken');
				}
			},

			getusertoken : function(){
				return $window.localStorage.getItem('usertoken'); 
			}	
    	}
    });

app.factory('LoginInfo', function(Authtoken){
	return {
		isloggedin : function(){
			if(Authtoken.getusertoken()){
				return true;
			}else{
				return false;
			}
		}
	}
});


app.factory('AuthInterceptor', function(Authtoken){
	return  {
		request : function(config){

			var token = Authtoken.getusertoken();

				if(token)
					config.headers['x-access-token'] = token; 

			return config;
		}
	}
});


app.factory('userInfo',function($http){

	return {
		getuserinfo : function(token){
			if(token){
				return $http.post('/me');
				}
			}
		}	
});


app.factory('renewToken',function($http){
	return {
		renewSession : function(username){
			return $http.post('/newToken/'+ username);
		}
	}
});


app.factory('Permission',function($http){
	return {
		getPermission: function(){
			return $http.post('/getpermission');
		}
	}
})

app.factory('songAuth',function($http,$window){
	var moviepath;
	return {
		getsongs  : function(){
			return $http.post('/gettracks');
		},
		putsong_id : function(id){
			$window.localStorage.setItem('songid',id);
		},
		getsong_id : function(){
			return $window.localStorage.getItem('songid'); 
		},
		setmoviepath : function(path){
			moviepath = path;
 		},

 		getmoviepath: function(){
 			return moviepath;
 		}
	}
})