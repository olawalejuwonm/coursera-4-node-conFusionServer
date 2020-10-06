var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');
var JwtStrategy = require('passport-jwt').Strategy;//used for declaring passport jwt
var ExtractJwt = require('passport-jwt').ExtractJwt; //used for extracting jwt
var jwt = require('jsonwebtoken'); //used to create, sign and verify tokens
const FacebookTokenStrategy = require('passport-facebook-token');
//all passport strategy pass in the details of user in req.user
const config = require('./config.js');
// require('dotenv').config();

exports.local = passport.use(new LocalStrategy(User.authenticate()))//authenticate will be passed in by passpot-local-mongoose.
//this will also have req.user passed in, so it will expect the username and password to be in json format in the request
//this will be called as passport.authenticate("local")
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())//Registers a function used to deserialize user objects out of the session

exports.getToken = function (user) {
    return jwt.sign(user, config.secretKey,  //sign takes in payload,scretkey and options
        { expiresIn: 3600 });
};

const opts = {}; //options
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); //this will extract the bearer token
opts.secretOrKey = config.secretKey;
// const jwtOptions = {
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     secretOrkey: process.env.SECRET
// }

//jwt strategy is same thing as local except that it help us extract the token and verify it
//if we are using local you must be passing in username and password everytime you are sending a request
exports.jwtPassport = passport.use(new JwtStrategy(opts, //strategy for passport takes options and verify functions 
    (jwt_payload, done) => { //the callback will not be called if the options are not valid.passport will pass in done 
        // console.log("in jwt")
        console.log("JWT payload: ", jwt_payload); //jwt_payload wil be the extracted token extracted by opts.jwtFromRequest
        // having (_id, iat, exp) which can be checked at jwt.io also
        User.findOne({ _id: jwt_payload._id }, (err, user) => { //instaed of using .then callback was used here
            if (err) {
                // console.log('Jwt Strategy Error: ' + err)
                return done(err, false) //takes three paramater err, user, info.user and info are optional.  False means user does not exist

            }
            else if (user) {
                // console.log('Jwt Strategy User: ' + user)
                return done(null, user); //no error and user exists
            }
            else {
                // console.log('Jwt Neither None ')
                return done(null, false, "not registerd"); //no error and user dosent exists. So you can create a user account here 
            }
        });
    }));

exports.verifyUser = passport.authenticate('local', { session: false }); //session not needed for token based authentication, first params is the strategy
exports.verifyAdmin = (req, res, next) => {
    // console.log(req.user);
    if (req.user.admin) {
        return next();
    }
    const err = new Error("Unauthorized To Perform " + req.method + " Operation")
    err.status = 403;
    next(err);
}


exports.facebookPassport = passport.use(new FacebookTokenStrategy({ //this will except an access token when authenticating via it.passport.authenticate("facebook-token")
    clientID: config.facebook.clientId,
    clientSecret: config.facebook.clientSecret
}, (accessToken, refreshToken, profile, done) => {
    console.log("accestoken for facebook is", accessToken)
    console.log("refresh token for facebook is", refreshToken)
    User.findOne({ facebookId: profile.id }, (err, user) => {
        if (err) {
            return done(err, false);
        }
        else if (!err && user !== null) {
            return done(null, user)
        }
        else {
            console.log("User Facebook Profile", profile)
            user = new User({
                username:
                    profile.displayName
            });
            user.facebookId = profile.id;
            user.firstname = profile.name.givenName;
            user.lastname = profile.name.familyName;
            user.save((err, user) => {
                if (err) {
                    return done(err, false);
                }
                else {
                    return done(null, user);
                }
            })
        }
    })
})) 

exports.verifyFacebook = passport.authenticate('facebook-token')