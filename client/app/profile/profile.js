angular.module('rain.profile', [])

.controller('profile', ['$scope', '$sce', '$window', 'Weather', 'Video', 'Comments', 'Users', 'Playlists', 'Route', function($scope, $sce, $window, Weather, Video, Comments, Users, Playlists, Route) {

  $scope.route = Route.route;
  $scope.username = $window.localStorage.userName;
  $scope.playlists = null;
  $scope.deleteUser = Users.deleteUser;
  $scope.oldPassword = '';
  $scope.newPassword = '';
  $scope.error = '';
  $scope.deleteAccount = function() {
    if ($window.confirm('Do you really want to leave?')) {
      $scope.logOut();
      $scope.deleteUser($scope.username);
    }
  };
  $scope.changePassword = function() {
    Users.getUser({ userName: $scope.username }).then(function(data) {
      if (data[0].password === $scope.oldPassword) {
        const update = Object.assign(data[0], { method: '$set', property: 'password', value: $scope.newPassword });
        Users.updateUser(update);
      } else {
        $scope.error = 'Wrong password, try again.';
      }
      $scope.oldPassword = '';
      $scope.newPassword = '';
    });
  };

  if ($window.localStorage.userName) {
    Users.getUser({ userName: $window.localStorage.userName }).then(function(data) {
      $scope.playlists = data[0].playlists.map(item => ({ name: item }));
      for (let playlist of $scope.playlists) {
        Comments.getComments(playlist.name, $scope.username)
        .then((comments) => {
          playlist.comments = comments;
        });
      }
      if (!data.length) {
        $window.localStorage.removeItem('userName');
      } else {
        if ($window.localStorage.compareSession !== data[0].session) {
          $window.localStorage.removeItem('userName');
          location.reload();
        } else {
          Weather.getWeatherByCity(data[0].lastLocation);
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
    Route.route('/');
  };
}]);
