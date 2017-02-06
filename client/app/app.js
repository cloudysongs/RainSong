angular.module('rain', [
  'rain.services',
  'rain.weather',
  'rain.profile',
  'ngRoute'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'app/weather/weather.html',
    controller: 'weatherControl'
  })
  .when('/profile', {
    templateUrl: 'app/profile/profile.html',
    controller: 'profile'
  })
  .otherwise({  
    redirectTo: '/'  
  });    
}]);
