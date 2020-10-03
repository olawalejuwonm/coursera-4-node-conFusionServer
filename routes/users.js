var express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/users');


var router = express.Router();
router.use(bodyParser.json())
/* GET users listing. */
router.get('/', (req, res, next) => {
  // console.log(req.session, req.signedCookies)

  User.find({})
  .then((users) => {
    res.json(users)
    User.remove({}).then((res) => console.log(res))
  })
  .catch((err) => {
    // res.send(err);
    next(err);
  })
  // res.send('respond with a resource');
});

router.post('/signup', (req, res, next) => {
  User.findOne({username: req.body.username})
  .then((user) => {
    if (user != null) { //if the user find is something or found in the database.Then the user already exist
      var err = new Error('User ' + req.body.username + 'already exists');
      err.status = 403;
      next(err);
    }
    else {
      return User.create({username: req.body.username,
      password: req.body.password})
    }
  })
  .then((user) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({status: 'Registration Successful!', user: user})
  }, (err) => next(err))
  .catch((err) => next(err))
})

router.post('/login', (req, res, next) => {
  if (!req.session.user) { //if no signed cookies called user
    var authHeader = req.headers.authorization; //this will prompt auth
  
    if (!authHeader) { //no auth is entered
      var err = new Error("You are not authenticated!Kindly Enter Auth Keys");
      res.setHeader('WWW-Authenticate', 'Basic');
      err.status = 401;
     return next(err)
    };
  
   
  
    var auth = new Buffer.from(authHeader.split(' ')[1], 'base64').toString().split(":")
    var username = auth[0];
    var password = auth[1];
    User.findOne({username: username})
    .then((user) => {
      if (user === null ) {
        var err = new Error("User " + username + ' does not exist');
        err.status = 403;
        return next(err);
      }
      else if (user.password !== password) {
        var err = new Error("Your password is incorrect!");
        err.status = 403;
        return next(err);
      }

      else if (user.username === username && user.password === password) {
        req.session.user = "authenticated" //note this as req and not res and takes name, value , option
        req.session.name = user.username;
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.end("You are authenticated!.")
      }
    
     
    })
    .catch((err) => next(err))
  }
  else {// if there is signed cookies user is already logged in
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end("You are already authenticated!")
    
  }
});

router.get('/logout', (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error("You are not logged in")
    err.status = 403;
    next(err)
  }
})

module.exports = router;
