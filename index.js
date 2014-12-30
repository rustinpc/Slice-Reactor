var express = require('express');
var passport = require('passport');
var SliceStrategy = require('passport-slice').Strategy;
var util = require('util');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var methodOverride = require('method-override');
var crypto = require('crypto');
var https = require('https');

require('dotenv').load();

var app = express();

  app.use(morgan('combined', {skip: function (req, res) {return res.statusCode < 400}}));
  app.use(cookieParser());
  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());
  app.use(methodOverride());
  app.use(session({secret: 'aloo cat', cookie: {maxAge: 86400000}, resave: false, saveUninitialized: true}));
  app.use(passport.initialize());
  app.use(passport.session());

var port = process.env.PORT || 3000;

app.listen(port);
console.log('Listening on port', port);

// serialize and deserialize
passport.serializeUser(function(user, done) {
  // console.log('userEmail: ', user.userEmail);
  done(null, user.userEmail);
});
passport.deserializeUser(function(obj, done) {
  // console.log('logout obj: ', obj);
  done(null, obj);
});

// use the slice authentication strategy for passport
passport.use(new SliceStrategy({
    clientID: process.env.SLICE_CLIENT_ID,
    clientSecret: process.env.SLICE_CLIENT_SECRET,
    callbackURL: "https://566f1d8c.ngrok.com/auth/slice/callback",
    passReqToCallback: true
  },
  function(req, accessToken, refreshToken, profile, done) {
    var cipher = crypto.createCipher(process.env.CIPHER_ALGORITHM, process.env.CIPHER_KEY);  
    req.session.accessToken = cipher.update(accessToken, 'utf8', 'hex') + cipher.final('hex');
    // console.log('aT: ', accessToken);
    process.nextTick(function () {
      return done(null, profile);
    });
  }
));

// Redirect the user to Slice for authentication.
app.get('/auth/slice', passport.authenticate('slice'));

// Slice has redirected the user back to the application.
// Attempt to obtain an access token. If authorization granted,
// the user is logged in. Otherwise, authentication has failed.
app.get('/auth/slice/callback', 
  passport.authenticate('slice', {
    successRedirect: '/account', failureRedirect: '/login'
  }));

app.get('/', function(req, res){
  // console.log(crypto.getCiphers());
  res.send('<a href="/auth/slice">Log In with Slice</a>');
});

app.get('/login', function(req, res){
  res.send('You still need to log in with Slice');
});

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

// make api call for items to Slice
var sliceGetRequest = function(resourceType, accessToken, callback, parameter) {
  var apiPath = "/api/v1/" + resourceType;
  if (parameter) {
    apiPath += "/?";
    for (var key in parameter) {
      apiPath += key + "=" + parameter[key];
    }
  }
  var options = {
    host: "api.slice.com",
    path: apiPath,
    headers: {
      "Authorization": "Bearer " + accessToken
    }
  };
  var req = https.request(options, function(res) {
    // console.log("statusCode: ", res.statusCode);
    // console.log("headers: ", res.headers);
    var body = '';
    res.on('data', function(chunk) {
      body += chunk;
      // process.stdout.write(data);
    });
    res.on('end', function() {
      callback(body);
    });
  });
  req.end();

  req.on('error', function(e) {
    console.error(e);
  });
};

var getUserItems = function(req, res, next) {
  var decipher = crypto.createDecipher(process.env.CIPHER_ALGORITHM, process.env.CIPHER_KEY);
  var decrypted = decipher.update(req.session.accessToken, 'hex', 'utf8') + decipher.final('utf8');

  sliceGetRequest('items', decrypted, function(data) { console.log(data) }, {limit: 10}); 

  return next();
};

// test if user is authenticated
var ensureAuthenticated = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

app.get('/account', ensureAuthenticated, getUserItems, function(req, res) {
  // console.log("session: ", req.session, "decrypted: ");
  res.send('Congrats on logging in with Slice!');
});
