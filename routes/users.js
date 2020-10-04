var express = require('express');
const bodyParser = require('body-parser');
const User = require('../models/users');
const passport = require('passport')
var authenticate = require('../authenticate.js');
const config = require('../config');


var router = express.Router();
router.use(bodyParser.json())
/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
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
  User.register(new User({username: req.body.username}),  //register passed in by the plugin passport-local-mongoose
  req.body.password, (err, user) => { //req.body.password will be password stored as hash&alt, while username is added 
    //to the database object keys
    if (err) {   //error like if user already exist  //if err is not null
      res.statusCode = 500;
      res.setHeader('Content-Type', 'app/json');
      res.json({err: err,});
    }
    else {
      // console.log(err) --> null
      passport.authenticate('local')(req, res, () => { //if passport.authenticate('local') is not in-place it will take 
      //long time before loading without any response, and the database will have a new User details. So that's weird
        res.statusCode = 200;
        res.setHeader('Content-Type', 'app/json');
        res.json({success: true, status: 'Registration Successful!', user: user})
      });
      //The code below works as the one above in a better way without passport.authenticate('local')
      // res.statusCode = 200;
      // res.setHeader('Content-Type', 'app/json');
      // res.json({success: true, status: 'Registration Successful!', user: user})
    }
  }); //when dere is post to sign up new User process will begin but if the User exists it will be handled by 
  //error in the  callback. Passport Local Mongoose Impose a Schema on the model.
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



// router.post('/login', passport.authenticate('local'), //passport.authenticate('local') will authenticate using exports.local 
// //defined in authenticate file using passport-local-mongoose to check automatically req.body and username if they exists
// //it expect username and password in json or else it gives bad request(400 status code)//so it handles error itself
// (req, res, next) => {
//   res.statusCode = 200;
//   res.setHeader('Content-Type', 'app/json');
//   res.json({success: true, status: 'You are Successfully login!'})  
// });
// const CheckLogin = (req, res, next) => { //checklogin for session
//   // console.log(req.body);
//   // console.log(req.session);
//   // console.log(req.user);
//   const username  = req.user ? req.user.username : null;

//   if (req.body.username === username) {
//     return res.json({success: false, message: "You are logged in already"});
//   }
//   else {
//     console.log("nexting..")
//     next();
//   }
// }

// const CheckLogin = (req, res, next) => { //for cookie
//   // console.log(req.body);
//   // console.log(req.signedCookies)
//   // console.log(req.session);
//   // console.log(req.user);
//   const username  = Object.keys(req.signedCookies).length ? req.signedCookies.user : null;

//   if (req.body.username === username) {
//     return res.json({success: false, message: "You are logged in already"});
//   }
//   else {
//     console.log("nexting..")
//     next();
//   }
// }

const CheckLogin = (req, res, next) => { //for jwt
  // console.log(req.body);
  // console.log(req.signedCookies)
  // console.log(req.session);
  // console.log(req.user);
  const username  = req.user ? req.user.username : null;

  if (req.body.username === username) {
    return res.json({success: false, message: "You are logged in already"});
  }
  else {
    console.log("nexting..")
    next();
  }
}
router.post('/login', CheckLogin, passport.authenticate('local'), (req, //passport.authenticate('local') will check if user already exists or not
  res, next) => {
    // console.log(req.user);
    var token = authenticate.getToken({_id: req.user._id});  //passport.authenticate('local') will pass in req.user
    res.statusCode = 200;
    //res.cookie('user', req.user.username, { signed: true, expires: config.cookieExpiry}) //for cookies
    res.setHeader('Content-Type', 'app/json');
    res.json({success: true, token: token, 
      status: 'You are Successfully login!'})  
});

router.get('/logout', (req, res, next) => {
  
  // console.log("logging out",Object.keys(req.signedCookies).length, req.session)
  if (Object.keys(req.signedCookies).length !== 0 || req.session) { //for cookie
    res.clearCookie('user');
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error("You are not logged in");
    err.status = 403;
    next(err);
  }
})

router.delete('/logout', passport.authenticate('local'), (req, res, next) => {
  User.remove({}) //remove all the dish
  .then((resp) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(resp);
  }, (err) => next(err))
  .catch((err) => next(err));
})
module.exports = router;
