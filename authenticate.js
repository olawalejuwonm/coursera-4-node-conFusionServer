var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy;//used for declaring passport jwt
var ExtractJwt = require('passport-jwt').ExtractJwt; //used for extracting jwt
var jwt = require('jsonwebtoken'); //used to create, sign and verify tokens

const config = require('./config.js');
// require('dotenv').config();

exports.local = passport.use(new LocalStrategy(User.authenticate()))//authenticate will be passed in by passpot-local-mongoose.
//this will also have req.user passed in, so it will expect the username and password to be in json format in the request
//this will be called as passport.authenticate("local")
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())//Registers a function used to deserialize user objects out of the session

exports.getToken = function(user) {
    return jwt.sign(user, config.secretKey,  //sign takes in payload,scretkey and options
        {expiresIn: 3600});
};

const opts = {}; //options
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //this will extract the bearer token
opts.secretOrKey = config.secretKey;
// const jwtOptions = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrkey: process.env.SECRET
// }

exports.jwtPassport = passport.use(new JwtStrategy(opts, //strategy for passport takes options and verify functions 
    (jwt_payload, done) => { //passport will pass in done
        console.log("JWT payload: ", jwt_payload); //jwt_payload wil be the extracted token extracted by opts.jwtFromRequest
        // having (_id, iat, exp) which can be checked at jwt.io also
        User.findOne({_id: jwt_payload._id}, (err, user) => { //instaed of using .then callback was used here
            if(err) {
                console.log('Jwt Strategy Error: ' + err)
                return done(err, false) //takes three paramater err, user, info.user and info are optional.  False means user does not exist

            }
            else if(user) {
                console.log('Jwt Strategy User: ' + user)
                return done(null, user); //no error and user exists
            }
            else {
                console.log('Jwt Neither None ')
                return done(null, false, "not registerd"); //no error and user dosent exists. So you can create a user account here 
            }
        });
    }));

exports.verifyUser = passport.authenticate('jwt', {session: false}); //session not needed for token based authentication, first params is the strategy
exports.verifyAdmin = (req, res, next) => {
    const id = req.user._id
    User.findById(id)
        .then((user) => {
            if (user.admin) {
                return next()
            }
            const err = new Error("Unauthorized To Perform " + req.method + " Operation")
            err.status = 403;
            next(err)
        })
}