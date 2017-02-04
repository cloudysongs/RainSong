var mongoose = require('mongoose');
mongoose.Promise = global.Promise;

var CommentSchema = new mongoose.Schema({
  userName: String,
  text: String,
  playlistName: String
});

var UserSchema = new mongoose.Schema({
  userName: String,
  password: String,
  session: String,
  lastLocation: String,
  playlists: Array
});

var PlaylistSchema = new mongoose.Schema({
  name: String,
  comments: Array,
  videos: Array
});

module.exports = {
  Comment: mongoose.model('Comment', CommentSchema),
  User: mongoose.model('User', UserSchema),
  Playlist: mongoose.model('Playlist', PlaylistSchema)
};
