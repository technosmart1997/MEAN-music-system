	
	var app = angular.module('usersCtrl',[]);


	app.controller('regCtrl',['$scope','$http','$location','$timeout','Authtoken',function($scope,$http,$location,$timeout,Authtoken){

		$scope.register = function(regData){
		var regData = $scope.regData;
			if(regData.reg_username == '' || regData.reg_username == null || regData.reg_password == '' || regData.reg_password == null || regData.reg_email == '' || regData.reg_email == null)
				{
			    	$scope.errorMsg = 'Please Fill All The Credentials';
			    }else{
				$http.post('/register', regData).then(function(response){
				if(response.data.login){

					Authtoken.setusertoken(response.data.token);
					$scope.successMsg = response.data.message;
					$timeout(function() {
						$scope.successMsg = false;     
					}, 3000);

					$timeout(function() {
						$location.path('/dashboard');  
					}, 3500);
						
				}else{
					$scope.errorMsg = response.data.message;
					$timeout(function() {
						$scope.errorMsg = false;
					}, 3000);
				}

				$timeout(function() {
					regData.reg_username = '';
					regData.reg_password = '';
					regData.reg_email = '';
				}, 3500);
					
				});
	    	}		    
	    }

	    $scope.checkusername = function(regData){
	    	$scope.msgsuccess = false;
	    	$scope.msgerror = false;
	    	$http.post('/checkusername', regData).then(function(response){
	    		if(response.data.status){
	    			$scope.msgsuccess = true;
	    			$scope.usernameMsg = response.data.message;
	    		}else{
	    			$scope.msgerror = true;
	    			$scope.usernameMsg = response.data.message;
	    		}
	    	});
	    }

	    $scope.checkemail = function(regData){
	    	$http.post('/checkemail', regData).then(function(response){
	    		if(response.data.status){
	    			$scope.emailsuccess = true;
	    			$scope.emailMsg = response.data.message;
	    		}else{
	    			$scope.emailerror = true;
	    			$scope.emailMsg = response.data.message;
	    		}
	         });
		    }
		}]);


	app.controller('dashCtrl',function($scope,$http){


			$http.post('/getmovies').then(function(data){
				if(data.data.status){
					$scope.movies = data.data.tracks;
				}
			});


	});