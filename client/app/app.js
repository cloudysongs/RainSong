angular.module('rain', [
  'rain.services',
  'rain.weather',
  'ngRoute'
])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'app/weather/weather.html',
    controller: 'weatherControl'
  })     
  .otherwise({  
    redirectTo: '/'  
  });    
}]);