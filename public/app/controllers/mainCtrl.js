	var app = angular.module('mainController',['authService']);

	app.controller('mainCtrl',function($scope,$window,$http,$location,$timeout,LoginInfo,Authtoken,userInfo,$rootScope,$interval,renewToken){
		$scope.loggedin = false;

		$rootScope.$on('$routeChangeStart',function(){
			if(LoginInfo.isloggedin()){
				$scope.checksession();
				$scope.loggedin = true;
				console.log('User is Logged in');
				var token = Authtoken.getusertoken();
				userInfo.getuserinfo(token).then(function(response){
					$scope.username = response.data.username;
					$scope.email = response.data.email;
				});
			}else{
				console.log('User is Logged out');
				$scope.loggedin = false;
			}
		});
	

		$scope.authenticate = function(loginData){
			var loginData = loginData;

			if(loginData.username == '' || loginData.username == null || loginData.password == '' || loginData.password == null)
				{
			    	console.log('Please Fill All The Credentials');
			    }else{
				$http.post('/login', loginData).then(function(response){
				if(response.data.login){

						Authtoken.setusertoken(response.data.token);
						$scope.loginsuccessMsg = response.data.message;

					$timeout(function() {
						$scope.loginsuccessMsg = false;     
					}, 3000);

					$timeout(function() {
						$location.path('/dashboard');  
					}, 3500);
				}else{
					$scope.loginerrorMsg = response.data.message;
					$timeout(function() {
						$scope.loginerrorMsg = false;
					}, 3000);
				}

					loginData.username = '';
					loginData.password = '';
	    	});
	        }
		}



		$scope.logout = function(){
			$scope.showModal(2);
		}


		$scope.checksession = function(){						// checking session
			if(LoginInfo.isloggedin()){
				$scope.checkingSession = true;
				var interval = $interval(function(){
					var token =  $window.localStorage.getItem('usertoken');
					if(token === null){
						$interval.cancel(interval);
					}else{
						self.parsejwt = function(){
							var base64url = token.split('.')[1];
							var base64 = base64url.replace('-','+').replace('_','/');
							return JSON.parse($window.atob(base64));
						}

						var exptime = self.parsejwt(token);
						var timestamp = Math.floor(Date.now()/1000);
						var checktime = exptime.exp - timestamp;
						
						if(checktime <= 300){
							$scope.showModal(1);   
							$interval.cancel(interval);
						}else{
							//console.log('Session is not expired');
						}
					}
				},2000);
			}
		};

		$scope.checksession();

		$scope.showModal = function(option){
			$scope.button = false;
			$scope.choicemade = false;
			$scope.modalHeader = '';
			$scope.modalInfo = '';
			$scope.modalFooter = '';

			if(option === 1){
				$scope.modalHeader = 'Session Timeout Warning';
				$scope.modalInfo = 'Your session will expire in 5 mins. Do you want to renew your session?';
				$('#myModal').modal({ backdrop : 'static'});

				$timeout(function(){
					if(!$scope.choicemade){
						$scope.modalHeader = 'No Action taken by the user';
						$scope.modalInfo = 'Sorry, your session is expired , please login again to continue';
						$timeout(function(){
							Authtoken.setusertoken();
							$location.path('/login');
							$scope.endModal();
						},4000);
					}
				}, 10000);

			}else if(option === 2){
				$scope.button = true;
				$scope.modalHeader = 'Logging  You Out...';
				$scope.modalFooter = 'Please Login Again to continue your interaction with us...';
				$('#myModal').modal({ backdrop : 'static'});
				$timeout(function(){
					Authtoken.setusertoken();
					$location.path('/login');
					$scope.endModal();
				}, 5000);
			}
		};

		$scope.renewSession = function(){
			$scope.choicemade = true;
			console.log('Renew Session Function Called');

			renewToken.renewSession($scope.username).then(function(data){
				if(data.data.status){
					Authtoken.setusertoken(data.data.token);
					console.log('New Token is set');
					$scope.checksession();
				}else{
					console.log('Function Not Working');
				}
			});
			$scope.endModal();
		};

		$scope.endSession = function(){
			$scope.choicemade = true;
			$scope.endModal();
			$timeout(function(){
				$scope.showModal(2);
			},2000); 
		};


		$scope.endModal = function(){
			$('#myModal').modal('hide');
		};

	
		

	});