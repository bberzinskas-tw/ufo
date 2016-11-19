var statusURL = 'http://localhost:3000/status';
var versionURL = 'http://localhost:3000/version';

//var statusURL = 'http://10.0.0.23/status';
//var versionURL = 'http://10.0.0.23/version';

angular.module("ufo", [])
  .controller('statusController', function($scope, $http, $interval) {
  $scope.error = "";
  $scope.status = {};

   var refreshData = function(){
   	 $http({
	   method: 'GET',
	   url: statusURL
	  }).then(function successCallback(response) {
  	  	$scope.status = response.data;
  	  }, function errorCallback(response) {
  		$scope.error = response;
  	  });
  	}

  	refreshData();

  	$interval(function(){
  		console.log('polling server');
  		refreshData();
  	}, 10000);

  })

  .controller('versionController', function($scope, $http, $interval) {

		$scope.status = {};
		$scope.version = { latest: "CONNECTING", staging:"CONNECTING", production:"CONNECTING"};

		var getVersion = function(server){
			$http({
				method: 'GET',
				url: versionURL ,
				responseType:'text'
			}).then(function successCallback(response) {
			  	$scope.version = response.data;
		    });
		}

		getVersion();

		$interval(function(){
			console.log('polling environments for version details');
			getVersion();

		}, 60000);

  })

  .controller('logController', function($scope) {
  })

  .controller('testController', function($scope, $http) {
    $scope.test = {"environment":"", "status":""};

    $scope.sendTest = function(){
    	$http({
		  method: 'POST',
		  url: statusURL,
		  data: $scope.test
		}).then(function successCallback(response) {
	  	  	$scope.status = response.data;
	  	}, function errorCallback(response) {
	  		$scope.error = response;
	  	});
    }
  })

  .directive("status", function($timeout){
    return {
      template: "<div><i class='glyphicon glyphicon-{{icon}}'></i><h4>{{title}}</h4><span class='text-muted'>{{build}}</span></div>",
      replace: true,
      scope: { icon: '@', title: '@', build: '@'},
      link: function( scope, element, attrs){
      	scope.icon="refresh";

      	attrs.$observe('build', function(value){
	  		switch (attrs.build) {
	    		case "CONNECTING":
			       scope.icon = "refresh";
			       break;
			    case "BUILDING":
			       scope.icon = "wrench";
			       break;
			    case "DEPLOYING":
			       scope.icon = "	";
			       break;
				case "TESTING":
			       scope.icon = "tasks";
			       break;
				case "STABLE":
			       scope.icon = "check";
			       break;
				case "UNSTABLE":
			       scope.icon = "warning-sign";
			       break;
				case "FAILED":
			       scope.icon = "fire";
			       break;
				case "ALARM":
			       scope.icon = "bullhorn";
			       break;
			}
		});
	  }
	}

  })