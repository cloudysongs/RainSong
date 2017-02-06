var Models = require('./models');
var Comment = Models.Comment;
var User = Models.User;
var Playlist = Models.Playlist;
var request = require('request');

module.exports = {
  comment: {
    get: function(req, res) {
      console.log("get", req.query);
      Comment.find(req.query).then(function(resp) {
        res.json(resp);
      });
    },

    post: function(req, res) {
      console.log(req.body)
      var params = {
        userName: req.body.userName,
        text: req.body.text,
        playlistName: req.body.playlistName
      };
      Comment.create(params).then(function(resp) {
        res.sendStatus(201);
      });
    }
  },

  user: {
    getUser: function(req, res) {
      User.find(req.query).then(function(resp) {
        res.json(resp);
      });
    },

    createUser: function(req, res) {
      User.create(req.body).then(function(resp) {
        res.sendStatus(201);
      });
    },

    updateUser: function(req, res) {
      var val = req.body.value;
      User.findByIdAndUpdate(req.body._id, {
        [req.body.method]: { [req.body.property]: val }
      }).then(function(resp) {
        res.json(resp);
      });
    }
  },

  playlist: {
    getPlaylist: function(req, res) {
      Playlist.find({name: req.query.name}).then(function(resp) {
        res.json(resp);
      })
    },

    createPlaylist: function(req, res) {
      var playlist = req.body;
      new Playlist(playlist).save(function(err) {
        if (err) throw err;
        else {
          res.sendStatus(201);
        }
      })
    },

    updatePlaylist: function(req, res) {
      if (req.body.method === '$pull') {
        Playlist.findById(req.body._id, function(err, data) {
          if (err) throw err;
          for (var i = 0; i < data.videos.length; i++) {
            if (data.videos[i].etag === req.body.value.etag) {
              data.videos.splice(i, 1);
            }
          }
          data.save(function(err, playlist) {
            if (err) {
              res.status(500).send(err);
            } else {
              res.send(data);
            }
          });
        })
      } else {
        Playlist.findByIdAndUpdate(req.body._id, {
          [req.body.method]: {[req.body.property]: req.body.value}
        }).then(function(resp) {
          res.json(resp);
        })
      }
    }
  },

  lat: function(req, res) {
    var url = 'http://api.openweathermap.org/data/2.5/weather?lat=' + req.query.lat + '&lon=' + req.query.lon + '&appid=' + "3b12ada7c114c8c07bea47797cf3ab0a";
    request(url, function(err, response, body) {
      if (err) { throw err; }
      res.send(response);
    });
  },
  city: function (req, res) {
    var url = 'http://api.openweathermap.org/data/2.5/forecast/daily?q=' + req.query.city + '&appid=' + '3b12ada7c114c8c07bea47797cf3ab0a';
    request(url, function(err, response, body) {
      if (err) { throw err; }
      res.send(response);
    });
  },
  keys: function(req, res) {
    res.send('AIzaSyBlZwWqIXAU8clA4CZOjo94dTe5HJol1ag');
  }

};