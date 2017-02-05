var express = require('express');
var morgan = require('morgan'); // logs server interactions
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var routes = require('./db/routes');
var encrypt = require('letsencrypt-express');


mongoose.connect('mongodb://localhost/rainSong');

var db = mongoose.connection;

var app = express();


app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/../client'));
app.use('/api', routes);

db.once('open', function() {

  require('letsencrypt-express').create({
 
  server: 'staging',
 
  email: 'sawyer.schumacher@gmail.com',

  agreeTos: true,
 
  approveDomains: [ 'cloudysongs.com' ,'www.cloudysongs.com'],
 
  app:app,
    
  }).listen(80,443);
 
});
