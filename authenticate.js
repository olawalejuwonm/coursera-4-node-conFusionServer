var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/users');

exports.local = passport.use(new LocalStrategy(User.authenticate()))//authenticate will be passed in by passpot-local-mongoose.
//this will be called as passport.authenticate("local")
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())//Registers a function used to deserialize user objects out of the session