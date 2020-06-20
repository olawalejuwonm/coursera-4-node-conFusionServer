var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    firstname: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    // username: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },                       //the username and password(in form of hash and salt not visible to public) will be inserted by the plugin
    // password: {
    //     type: String,
    //     required: true
    // },
    facebookId: {
        type: String
    },
    admin: {
        type: Boolean,
        default: false
    }
    
})

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);