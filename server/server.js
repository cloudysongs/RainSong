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
  console.log('Connected to MongoDB');

//  var port = process.env.PORT || 80;
//  app.listen(port, function() {
//    console.log('I am listening to port:', port);
//    console.log('keys: ', 'AIzaSyBlZwWqIXAU8clA4CZOjo94dTe5HJol1ag', '3b12ada7c114c8c07bea47797cf3ab0a');

  require('letsencrypt-express').create({
 
  server: 'https://acme-v01.api.letsencrypt.org/directory',
 
  email: 'sawyer.schumacher@gmail.com',

  agreeTos: true,
 
  approveDomains: [ 'cloudysongs.com' ,'www.cloudysongs.com'],
 
  app:app,
    
  }).listen(80,443);
 
})
