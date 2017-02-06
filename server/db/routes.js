var express = require('express');
var controller = require('./controllers');
var route = express.Router();

var commentController = controller.comment;
var userController = controller.user;
var playlistController = controller.playlist;

route.get('/comments', commentController.get);
route.post('/comments', commentController.post);

route.get('/users', userController.getUser);
route.post('/users', userController.createUser);
route.put('/users', userController.updateUser);

route.get('/playlists', playlistController.getPlaylist);
route.post('/playlists', playlistController.createPlaylist);
route.put('/playlists', playlistController.updatePlaylist);

route.get('/lat', controller.lat);
route.get('/city', controller.city);
route.get('/keys', controller.keys);

module.exports = route;