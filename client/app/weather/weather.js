angular.module('rain.weather', [])

.controller('weatherControl', ['$scope', '$sce', '$window', 'Weather', 'Video', 'Comments', 'Users', 'Playlists', 'Route', function($scope, $sce, $window, Weather, Video, Comments, Users, Playlists, Route) {
  $scope.route = Route.route;
  $scope.height = screen.height / 1.2;
  $scope.weather = 'Loading...';
  $scope.list = 'display: none';
  $scope.add = 'display: none';
  $scope.store = 'display: none';
  $scope.remove = 'display: none';
  $scope.error = '';
  $scope.currentPlaylist = $window.localStorage.playlistName;
  var weatherIcons = {
    'Thunderstorm': '/assets/Storm.png',
    'Drizzle': '/assets/Rain-thin.png',
    'Rain': '/assets/Rain.png',
    'Clouds': '/assets/Cloud.png',
    'Snow': '/assets/Snow.png',
    'Clear': '/assets/Sun.png',
    'Extreme': '/assets/Tornado.png',
    'Fog': '/assets/Haze.png'
  };
  var video;

  if (!$window.localStorage.userName) {
    $scope.showPlaylist = 'display: none';
  }

  var shuffle = function(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }
    return array;
  };

  var getPlaylist = function(weather) {
    Video.getVid(weather).then(function(data) {
      shuffle(data.items);
      $scope.playlist = data.items;
      var playlist = data.items.map(function(item) {
        return item.id.videoId;
      });
      var firstVid = playlist.shift();
      playlist = playlist.join(',');
      $scope.data = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + firstVid + '?playlist=' + playlist + '&autoplay=1&loop=1&iv_load_policy=3');
    });
  };

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

  $scope.display = function(prop) {
    if (prop === 'list') {
      $scope.store = 'display: none';
    } else {
      $scope.list = 'display: none';
    }

    if ($scope[prop].split(' ').includes('none')) {
      $scope[prop] = 'display: unset';
    } else {
      $scope[prop] = 'display: none';
    }
  };

  $scope.show = function() {
    Users.getUser({
      userName: $window.localStorage.userName
    }).then(function(user) {
      $scope.savedPlaylists = user[0].playlists;
    })

    if ($scope.list === 'display: inline') {
      $scope.list = 'display: none';
    } else {
      $scope.list = 'display: inline';
    }
  }

  $scope.showAdd = function() {
    if ($scope.add === 'display: block') {
      $scope.add = 'display: none';
    } else {
      $scope.add = 'display: block';
    }
  }

  $scope.showRemove = function() {
    if ($scope.remove === 'display: block') {
      $scope.remove = 'display: none';
    } else {
      $scope.remove = 'display: block';
    }
  }

  $scope.getWeatherByInput = function() {
    Weather.getWeatherByCity($scope.city).then(function(data) {
      $scope.weather = 'Weather: ' + data.list[0].weather[0].main;
      $scope.loc = data.city.name + ', ' + data.city.country;
      $scope.location = 'Location: ' + $scope.loc;
      getPlaylist(data.list[0].weather[0].main);
      $scope.icon = weatherIcons[data.list[0].weather[0].main];
    });
    $scope.city = '';
  };

  $scope.getWeatherGeoLocation = function() {
    return new Promise(function(resolve, reject) {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    })
    .then(function(geo) {
      return [geo.coords.latitude, geo.coords.longitude];
    })
    .then(function(loc) {
      Weather.getWeatherByCoords(loc[0], loc[1]).then(function(data) {
        if ($scope.loc !== data.name + ', ' + data.sys.country) {
          $scope.weather = 'Weather: ' + data.weather[0].main;
          $scope.loc = data.name + ', ' + data.sys.country;
          $scope.location = 'Location: ' + $scope.loc;
          getPlaylist(data.weather[0].main);
          $scope.icon = weatherIcons[data.weather[0].main];

          Users.getUser({
            userName: $window.localStorage.userName,
            session: $window.localStorage.compareSession
          }).then(function(data) {
            updateUser(data, 'lastLocation', $scope.loc, '$set');
          });
        }
      });
    });
  };

  $scope.playlistClick = function(item, playlist) {
    video = item;
    var temp = playlist.map(function(item) {
      return item.id.videoId;
    });
    var reorder = temp.slice(temp.indexOf(item.id.videoId) + 1).concat(temp.slice(0, temp.indexOf(item.id.videoId)));
    $scope.data = $sce.trustAsResourceUrl('https://www.youtube.com/embed/' + item.id.videoId + '?playlist=' + reorder + '&autoplay=1&loop=1');
  };

  $scope.newPlaylist = function() {
    var playlistName = $scope.playlistName;
    $window.localStorage.playlistName = playlistName;
    Users.getUser({
      userName: $window.localStorage.userName,
      session: $window.localStorage.compareSession
    }).then(function(user) {
      Playlists.newPlaylist({
        name: playlistName,
        comments: [],
        videos: []
      });
      updateUser(user, 'playlists', playlistName, '$addToSet').then(function() {
        Users.getUser({ userName: $window.localStorage.userName }).then(function(updated) {
          $scope.savedPlaylists = updated[0].playlists;
          $scope.store = 'display: none';
        });
      });
    })
  }

  $scope.usePlaylist = function(playlist) {
    $scope.list = 'display: none';
    $window.localStorage.playlistName = playlist;
    $scope.currentPlaylist = playlist;
    Playlists.getPlaylist({
      name: playlist
    }).then(function(playlist) {
      $scope.playlist = playlist[0].videos;
    });
    displayComments();
  }

  var updateUser = function(data, prop, val, meth) {
    return Users.updateUser({
      _id: data[0]._id,
      property: prop,
      value: val,
      method: meth
    });
  };

  var updatePlaylist = function(data, prop, val, meth) {
    return Playlists.updatePlaylist({
      _id: data[0]._id,
      property: prop,
      value: val,
      method: meth
    });
  };

  $scope.addToPlaylist = function() {
    if (!video) {
      alert('pick a video first')
    } else {
      Playlists.getPlaylist({
        name: $window.localStorage.playlistName
      }).then(function(playlist) {
        updatePlaylist(playlist, 'videos', video, '$addToSet');
      })
    }
    $scope.add = 'display: none';
  }

  $scope.removeFromPlaylist = function() {
    $scope.remove = 'display: none';
    Playlists.getPlaylist({
      name: $window.localStorage.playlistName
    }).then(function(playlist) {
      playlist[0].videos.forEach(function(vid) {
        if (vid.snippet.title === video.snippet.title) {
          updatePlaylist(playlist, 'videos', vid, '$pull')
        }
      })
    })
  }

  displayComments = function() {
    if ($scope.currentPlaylist) {
      Playlists.getPlaylist({
        name: $window.localStorage.playlistName
      }).then(function(playlist) {
        $scope.comments = playlist[0].comments.reverse();
      })
    }
  }

  displayComments();

  $scope.postComment = function() {
    var comment = {
      userName: $window.localStorage.userName || 'Anonymous',
      text: $scope.commentInput,
      playlistName: $window.localStorage.playlistName
    };
    Comments.postComments(comment);
    Playlists.getPlaylist({
      name: $window.localStorage.playlistName
    }).then(function(playlist) {
      updatePlaylist(playlist, 'comments', comment, '$addToSet').then(function() {
          Playlists.getPlaylist({
            name: $window.localStorage.playlistName
          }).then(function(updated) {
            var comments = updated[0].comments;
            var playlist = updated[0].name;
            $scope.comments = comments.reverse();
          })
      })
    })
    $scope.commentInput = '';
  };

  $scope.logOut = function() {
    $window.localStorage.removeItem('userName');
    $window.localStorage.removeItem('session');
    $window.localStorage.removeItem('playlistName');
    location.reload();
  };

  $scope.logIn = function() {
    $scope.showPlaylist = 'display: inline';
    $scope.save = 'display: inline';
    var currentSession = generateSession();
    Users.getUser({ userName: $scope.username }).then(function(data) {
      if (!data.length) {
        var user = {
          userName: $scope.username,
          password: $scope.password,
          session: currentSession,
          lastLocation: $scope.loc
        };

        Users.createUser(user).then(function(data) {
          $scope.currentUser = 'Logged in as - ' + data.config.data.userName;
          $window.localStorage.userName = data.config.data.userName;
          $window.localStorage.compareSession = currentSession;
          $window.localStorage.userId = data.config.data._id;
        });
        $scope.logInButton = 'display: none';
        $scope.logOutButton = '';
        $scope.error = '';
      } else {
        Users.getUser({ userName: $scope.username, password: $scope.password }).then(function(data) {
          if (!data.length) {
            $scope.error = 'Wrong password, try again.';
          } else {
            updateUser(data, 'session', currentSession, '$set').then(function(update) {
              $scope.currentUser = 'Logged in as - ' + update.data.userName;
              $window.localStorage.userName = update.data.userName;
              $window.localStorage.compareSession = update.config.data.value;
              $window.localStorage.userId = update.config.data._id;
            });
            $scope.save = 'display: unset';
            $scope.logInButton = 'display: none';
            $scope.logOutButton = '';
            $scope.error = '';
          }
        });
      }
    });
  };

  $scope.mic = function() {
    if (!annyang.isListening()) {
      annyang.start();
    } else {
      annyang.abort();
    }
  };

  if (annyang) {
    var commands = {
      'Play songs in *location': function(location) {
        Weather.getWeatherByCity(location).then(function(data) {
          $scope.weather = 'Weather: ' + data.list[0].weather[0].main;
          $scope.loc = data.city.name + ', ' + data.city.country;
          $scope.location = 'Location: ' + $scope.loc;
          getPlaylist(data.list[0].weather[0].main);
          $scope.icon = weatherIcons[data.list[0].weather[0].main];
        });
      }
    };
    annyang.addCommands(commands);
  }
  annyang.abort();

}]);
