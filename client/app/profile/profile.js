angular.module('rain.profile', [])

.controller('profile', ['$scope', '$sce', '$window', 'Weather', 'Video', 'Comments', 'Users', 'Playlists', 'Route', function($scope, $sce, $window, Weather, Video, Comments, Users, Playlists, Route) {

  $scope.route = Route.route;

  var generateSession = function() {
    var output = '';
    while (output.length < 10) { output += Math.floor(Math.random() * 10); }
    return output;
  };

  if ($window.localStorage.userName) {
    Users.getUser({ userName: $window.localStorage.userName }).then(function(data) {
      if (!data.length) {
        $window.localStorage.removeItem('userName');
      } else {
        if ($window.localStorage.compareSession !== data[0].session) {
          $window.localStorage.removeItem('userName');
          location.reload();
        } else {
          Weather.getWeatherByCity(data[0].lastLocation).then(function(data) {
            $scope.weather = 'Weather: ' + data.list[0].weather[0].main;
            $scope.loc = data.city.name + ', ' + data.city.country;
            $scope.location = 'Location: ' + $scope.loc;
            getPlaylist(data.list[0].weather[0].main);
            $scope.icon = weatherIcons[data.list[0].weather[0].main];
          });

          $scope.savedPlaylists = data[0].playlists;
          $scope.save = 'display: unset';
          $scope.currentUser = 'Logged in as - ' + $window.localStorage.userName;
          $scope.logInButton = 'display: none';
        }
      }
    });
  } else {
    $scope.logOutButton = 'display: none';
  }

  $scope.logOut = function() {
    $window.localStorage.removeItem('userName');
    $window.localStorage.removeItem('session');
    $window.localStorage.removeItem('playlistName');
    console.log($window.localStorage);
    Route.route('/');
  };

}]);
