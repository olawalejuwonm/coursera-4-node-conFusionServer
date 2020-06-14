var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');



var User = new Schema({
    // username: {
    //     type: String,
    //     required: true,
    //     unique: true
    // },                       //the username and password will be insrted by the plugin
    // password: {
    //     type: String,
    //     required: true
    // },
    admin: {
        type: Boolean,
        default: false
    }
})

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);