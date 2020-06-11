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
        type: String,
        required: true
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
    comments: [ commentSchema ] //storing all documents about the dish in an array. Sub-document
},{
   timestamps: true 

});

var Dishes = mongoose.model('Dish', dishSchema); //this will be transformed and mapped into a collection of the plural form dishes in mangodb database

module.exports = Dishes;