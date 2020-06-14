var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');

exports.local = passport.use(new LocalStrategy(User.authenticate()))//authenticate will be passed in by passpot-loc-mon.
passport.serializeUser(User.serializeUser());//Registers a function used to deserialize user objects out of the session
passport.deserializeUser(User.deserializeUser())