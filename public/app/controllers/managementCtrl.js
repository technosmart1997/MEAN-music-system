var app = angular.module('managementcontroller',[]).config(function(){
	var audio;
});

app.controller('managementCtrl',function($scope,$http,$timeout){
	
	$scope.showeditbtn = false;
	$scope.showdeletebtn = false;  
	$scope.showMsg = false;
	$scope.errorMsg = '';
	
	$scope.limit = 5;


	$scope.applyFilter = function(number){
		if(number > 0){
			$scope.limit = number;
			$scope.getallusers();
		}else{
			$scope.showMsg = true;
			$scope.errorMsg = 'Please Enter Valid Number To Apply Filter';

			$timeout(function() {
				$scope.showMsg = false;     
			}, 3000);

		}		
	}

	$scope.showAll = function(){
		$scope.limit = undefined;
		$scope.getallusers();
	}

	$scope.getallusers = function(){
		$http.post('/getallusers').then(function(data){
		if(data.data.status){
			if(data.data.permission == 'admin' || data.data.permission == 'moderator'){
				$scope.permissiongranted = data.data.permission;
				$scope.users = data.data.users;
				if(data.data.permission == 'admin'){
					$scope.showeditbtn = true;
					$scope.showdeletebtn = true;
				}else if(data.data.permission == 'moderator'){
					$scope.showeditbtn = true;
					$scope.showdeletebtn = false;
					}
				}
			}else{
					$scope.showMsg = true;
					$scope.errorMsg = data.data.message;
			}	
		});
	}


	$scope.getallusers();
	

	$scope.deleteuser = function(username){
		$http.delete('/deleteuser/' + username).then(function(data){
			if(data.data.status){
					$scope.getallusers();
				}
		});
	}
});

app.controller('editCtrl',function($scope,$http,$filter,songAuth){

	
});



app.controller('songCtrl',function($scope,$http,$routeParams,songAuth,$filter,$location){


console.log($scope.username);

	$http.post('/getmoviesongs/'+ $routeParams.movie_id).then(function(data){
		if(data.data.status){
			$scope.movie = data.data.tracks[0];
			$scope.movie_name = data.data.tracks[0].movie_title;
			$scope.movie_path = $scope.movie.movie_path;
			$scope.year = data.data.tracks[0].year;
			$scope.songs = $scope.movie.songs;
			$scope.firstsong = $scope.songs[0]; 
			$scope.producer = $scope.movie.producer;
			$scope.img = $scope.movie.img;
			//songAuth.setmoviepath($scope.movie_path);
			songAuth.putsong_id(1);
			$scope.initialize(1,$scope.firstsong,$scope.movie_path);
		}
	});
		

	var pausebtn = angular.element('#pause');
	pausebtn.hide();
	var stopbtn = angular.element('#stop');
	stopbtn.hide();

	$scope.initialize = function(id, song, moviepath){
		var title = song.song_title;
		var src= song.song_path + '.mp3';
		var artist = song.artist;
		$scope.title = song.song_title;
		$scope.artist = song.artist;
		var movie_path = moviepath; 
		audio = new Audio('media/'+ movie_path +'/' + src);	
        
       /* alert(audio.duration);
        angular.element("#duration").text();*/
		//audio.play();
	}
	

	// Play Button

	var playbtn = angular.element('#play').click(function(){
		audio.play();
       /* var duration = audio.duration;
        duration = duration/60;
        duration.toFixed(2);
        angular.element('#duration').text(duration);*/
		pausebtn.show();
		playbtn.hide();
		stopbtn.show();
	});

	var pausebtn = angular.element('#pause').click(function(){
		audio.pause();
		pausebtn.hide();
		playbtn.show();

	});

	$scope.setvolume = function(v){
        v = v/10;
		audio.volume = v;
	}

	var stopbtn = angular.element('#stop').click(function(){
		audio.pause();
		audio.currentTime = 0;
		pausebtn.hide();
		playbtn.show();
		stopbtn.hide();
	});


	var nextbtn = angular.element('#next').click(function(){
		audio.pause();

		$http.post('/getmoviesongs/'+ $routeParams.movie_id).then(function(data){
			if(data.data.status){
				stopbtn.show();
				var movie_path = data.data.tracks[0].movie_path;
				var songs = data.data.tracks[0].songs;
				var max = songs.length;
				var curid = songAuth.getsong_id();
				if(curid != max){
					curid = parseInt(curid) + 1;
				}else{
					curid = 1;
				}
				curid = parseInt(curid);
				songAuth.putsong_id(curid);

				//console.log(curid);
				var cursong = $filter('filter')(songs, { 'song_id': curid });
				//console.log(cursong[0]);
				$scope.initialize(curid,cursong[0],movie_path);
				audio.play();
				pausebtn.show();
				playbtn.hide();
			}
		});	

	});

	var prevbtn = angular.element('#prev').click(function(){
		audio.pause();
		
		
		$http.post('/getmoviesongs/'+ $routeParams.movie_id).then(function(data){
			if(data.data.status){
				stopbtn.show();
				var movie_path = data.data.tracks[0].movie_path;
				var songs = data.data.tracks[0].songs;
				var max = songs.length;
				var curid = songAuth.getsong_id();
				if(curid == 1){
					curid = max;
				}else{
					curid = parseInt(curid) - 1;
				}
				curid = parseInt(curid);
				//console.log(curid);
				songAuth.putsong_id(curid);

				//console.log(curid);
				var cursong = $filter('filter')(songs, { 'song_id': curid });
				//console.log(cursong[0]);

				$scope.initialize(curid,cursong[0],movie_path);
				audio.play();
				pausebtn.show();
				playbtn.hide();
			}
		});	

	});

	$scope.songplay =  function(id,movie){
			var id = id;
			audio.pause();
			stopbtn.show();
			//var cursong = $filter('filter')(songs, { 'song_id': id });
			var movie_path =  movie.movie_path;
			var songs = movie.songs;
			songAuth.putsong_id(id);
			var cursong = $filter('filter')(songs, { 'song_id': id });
			//console.log(cursong[0]);
			$scope.initialize(id,cursong[0],movie_path);
			audio.play();
			pausebtn.show();
			playbtn.hide();
			
		}
	
	$scope.back = function(){
		$location.path('/dashboard');
		audio.pause();
	}


});
