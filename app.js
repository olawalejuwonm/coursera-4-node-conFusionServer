var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
var passport = require('passport');
var authenticate = require('./authenticate'); //this imported the local strategy
var config = require('./config');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var dishRouter = require('./routes/dishRouter');
var promoRouter = require('./routes/promoRouter');
var leaderRouter = require('./routes/leaderRouter');
var uploadRouter = require('./routes/uploadRouter');
const favoriteRouter = require('./routes/favoriteRouter');
const commentRouter = require('./routes/commentRouter');

const mongoose = require('mongoose');

const Dishes = require('./models/dishes');

// const url = 'mongodb://localhost:27017/conFusion';
const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then((db) => {
  console.log('Connected correctly to the server');
}, (err) => { console.log(err) });


var app = express();


app.all('*', (req, res, next) => { //* means for all request
  if (req.secure) { //if it's coming to secure port
    return next()
  }
  else {
    res.redirect(307, 'https://' + req.hostname + ':' + app.get('secPort') + req.url)
    //req.url will contain actual path on the server
    //307 status code here represents that the target resource resides temporarily under different url 
    //and user agent must not change the request method if it perform a redirect
  }
})

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser('12345-67890-09876-54321'));


// function auth(req, res, next) {
//   console.log(req.headers);

//   var authHeader = req.headers.authorization;
//   //console.log(authHeader) //Basic YWRtaW46cGFzc3dvcmQ=
//   if (!authHeader) {
//     var err = new Error("You are not authenticated!");
//     res.setHeader('WWW-Authenticate', 'Basic');
//     err.status = 401;
//    return next(err)
//   };

//   var atest = new Buffer(authHeader.split(' ')[1], 'base64').toString();
//   //console.log("check", atest); //admin:password

//   var auth = new Buffer(authHeader.split(' ')[1], 'base64').toString().split(":") //Buffer enables splitting of value, 
//   //the other params is base64 encoding. when it turns into an array the second element is where the auth
//   // -username and password is located.
//   var username = auth[0];
//   var password = auth[1];

//   if (username === 'admin' && password === 'password') {
//     next(); //this will proceed
//   }

//   else {
//     var err = new Error("You are not authenticated!");

//     res.setHeader('WWW-Authenticate', 'Basic');
//     err.status = 401;
//    return next(err)    
//   }
// }


// function auth(req, res, next) {
//   console.log(req.signedCookies);

//   if (!req.signedCookies.user) { //if no signed cookies called user
//     var authHeader = req.headers.authorization; //this will prompt auth
  
//     if (!authHeader) { //no auth is entered
//       var err = new Error("You are not authenticated!Kindly Enter Auth Keys");
//       res.setHeader('WWW-Authenticate', 'Basic');
//       err.status = 401;
//      return next(err)
//     };
  
   
  
//     var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(":")
//     var username = auth[0];
//     var password = auth[1];
  
//     if (username === 'admin' && password === 'password') {
//       res.cookie('user', 'admin', { signed: true })   //set cookies and takes name, value , option
//       next();
//     }
  
//     else {
//       var err = new Error("You are not authenticated! Incorrect Keys");
  
//       res.setHeader('WWW-Authenticate', 'Basic');
//       err.status = 401;
//      return next(err)    
//     }

//   }
//   else {// if there is signed cookies
//     if (req.signedCookies.user === 'admin') {
//       next();
//     }
//     else {
//       var err = new Error("You are not authenticated! Incorrect Keys");
//       err.status = 401;
//       return next(err) 
//     }
//   }
 
// }


// app.use(session({
//   name: 'session-id',
//   secret: '12345-6789-09876-54321',
//   saveUninitialized: false,
//   resave: false,
//   store: new FileStore() //this will create a folder named session in my working directory
// }));

app.use(passport.initialize());//start passport
// app.use(passport.session()); //will serialize user information and store it in the session //this let passport use session for authentication

app.use('/', indexRouter);
app.use('/users', usersRouter);


// function auth(req, res, next) {
//   console.log(req.session);

//   if (!req.user) { //req.user will be loaded by passport session middleware automatically
//     var err = new Error("You are not authenticated!Kindly Login");
//     err.status = 403;
//     return next(err)
//   }
//   else {
//       next();
//   }

// }


// function auth(req, res, next) {
//   console.log(req.session);

//   if (!req.session.user) { //if no signed cookies called user
//     // var authHeader = req.headers.authorization; //this will prompt auth
  
//     // if (!authHeader) { //no auth is entered
//       // var err = new Error("You are not authenticated!Kindly Enter Auth Keys");
//       var err = new Error("You are not authenticated!Kindly Signup");
//       // res.setHeader('WWW-Authenticate', 'Basic');
//       err.status = 401;
//      return next(err)
//    // };
  
   
  
//     // var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(":")
//     // var username = auth[0];
//     // var password = auth[1];
  
//     // if (username === 'admin' && password === 'password') {
//     //   req.session.user = 'admin' //note this as req and not res and takes name, value , option
//     //   next();
//     // }
  
//     // else {
//     //   var err = new Error("You are not authenticated! Incorrect Keys");
  
//     //   res.setHeader('WWW-Authenticate', 'Basic');
//     //   err.status = 401;
//     //  return next(err)    
//     // }

//   }
//   else {// if there is signed cookies
//     if (req.session.user === 'authenticated') {
//       next();
//     }
//     else {
//       var err = new Error("You are not authenticated! Kindly Login");
//       err.status = 403;
//       return next(err) 
//     }
//   }
 
// }

// app.use(auth);

app.use(express.static(path.join(__dirname, 'public')));


app.use('/dishes', dishRouter);
app.use('/promotions', promoRouter);
app.use('/leaders', leaderRouter);
app.use('/imageUpload', uploadRouter);
app.use('/favorites', favoriteRouter);
app.use('/comments', commentRouter);
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
