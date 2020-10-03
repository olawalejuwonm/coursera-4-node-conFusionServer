const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    comment: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,//an object id need to be gotten same as object id of the ref
         //this will add(populate) all entries(that are public) in the model defined below
        ref: 'User' //model name     //this will make author required //if mistaken it will give an error that
        //Schema hasn't been registered for model
    },
    dish: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Dish"
    }
    
},
{
    timestamps: true
}
);

var Comments = mongoose.model('Comment', commentSchema)

module.exports = Comments;