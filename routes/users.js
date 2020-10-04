var express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/users');
const passport = require('passport')

var router = express.Router();
router.use(bodyParser.json())
/* GET users listing. */
router.get('/', (req, res, next) => {
  User.remove({})
    .then((users) => 
    res.json(users))
  // res.send('respond with a resource');
});

// router.post('/signup', (req, res, next) => {
//   User.findOne({username: req.body.username})
//   .then((user) => {
//     if (user != null) { //if the user find is something or found in the database.Then the user already exist
//       var err = new Error('User ' + req.body.username + ' already exists');
//       err.status = 403;
//       next(err);
//     }
//     else {
//       return User.create({username: req.body.username,
//       password: req.body.password})
//     }
//   })
//   .then((user) => {
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'app/json');
//     res.json({status: 'Registration Successful!', user: user})
//   }, (err) => next(err))
//   .catch((err) => next(err))
// })

router.post('/signup', (req, res, next) => {
  User.register(new User({username: req.body.username}),  //register passed in by the plugin passport-local-mongoose. takes user, password, callback
  req.body.password, (err, user) => {
    if (err) { 
      res.statusCode = 500;
      res.setHeader('Content-Type', 'app/json');
      res.json({err: err});
    }
    else {
      console.log("sign up", user);
      if (user.username === req.body.username) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'app/json');
        res.json({success: true, status: 'Registration Successful!'})
      }
      // passport.authenticate('local')(req, res, () => { //this will send cookie immediately
      //   console.log(user)
      //   res.statusCode = 200;
      //   res.setHeader('Content-Type', 'app/json');
      //   res.json({success: true, status: 'Registration Successful!'})
      // });
    }
  });
});


// router.post('/login', (req, res, next) => {
//   if (!req.session.user) { //if no signed cookies called user
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
//     User.findOne({username: username})
//     .then((user) => {
//       if (user === null ) {
//         var err = new Error("User " + username + ' does not exist');
//         err.status = 403;
//         return next(err);
//       }
//       else if (user.password !== password) {
//         var err = new Error("Your password is incorrect!");
//         err.status = 403;
//         return next(err);
//       }

//       else if (user.username === username && user.password === password) {
//         req.session.user = "authenticated" //note this as req and not res and takes name, value , option
//         res.statusCode = 200;
//         res.setHeader('Content-Type', 'text/plain');
//         res.end("You are authenticated!.")
//       }
    
     
//     })
//     .catch((err) => next(err))
//   }
//   else {// if there is signed cookies user is already logged in
//     res.statusCode = 200;
//     res.setHeader('Content-Type', 'text/plain');
//     res.end("You are already authenticated!")
    
//   }
// });
const CheckLogin = (req, res, next) => {
  console.log(req.body)
  // console.log(req.session);
  // console.log(req.user);
  const username  = req.user ? req.user.username : null;

  if (req.body.username === username) {
    return res.json({success: false, message: "You are logged in already"});
  }
  else {
    // console.log("nexting..")
    next();
  }
}


router.post('/login', CheckLogin, 
passport.authenticate('local'), //passport.authenticate('local') will authenticate using Local Str
(req, res, next) => { //the third function will only be called if those succeed
  res.statusCode = 200;
  req.session.cookie.expires = Date.now() + 200;
  req.session.userDetails = req.user;
  res.setHeader('Content-Type', 'app/json');
  res.json({success: true, status: 'You are Successfully login!'})  
}
);


router.get('/logout', (req, res, next) => {
  console.log("logging out", req.session)
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
