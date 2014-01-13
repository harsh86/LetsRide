angular.module('maparound', ['ionic', 
                             'ngRoute', 'ngAnimate', 
                             'maparound.service', 'maparound.controller', 
                             'maparound.directives']).config(function($routeProvider, $locationProvider) {

	  // Set up the initial routes that our app will respond to.
	  // These are then tied up to our nav router which animates and
	  // updates a navigation bar
	  $routeProvider.when('/home', {
	    templateUrl: 'templates/maps.html',
	    controller: 'MapCtrl'
	  });

	  // if none of the above routes are met, use this fallback
	  // which executes the 'AppCtrl' controller (controllers.js)
	  $routeProvider.otherwise({
	    redirectTo: '/home'
	  });

	});;