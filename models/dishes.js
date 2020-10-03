const mongoose = require('mongoose');
const Schema = mongoose.Schema;
require('mongoose-currency').loadType(mongoose); //load currency type into mongoose
const Currency = mongoose.Types.Currency;


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
    
},
{
    timestamps: true
}
);

const dishSchema = new Schema({
    name:{
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category:  {
        type: String,
        required: true
    },
    label:  {
        type: String,
        default: ''
    },
    price: {
        type: Currency,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
   // comments: [ commentSchema ] //storing all documents about the dish in an array. Sub-document
},{
   timestamps: true 

});

var Dishes = mongoose.model('Dish', dishSchema); //this will be transformed and mapped into a collection of the plural form dishes in mangodb database

module.exports = Dishes;