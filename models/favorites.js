const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const favoriteSchema = new Schema({
    dishes: [
        {
            type: Schema.Types.ObjectId,
            required: true,
            ref: 'Dish',
            // unique: false
        }
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        unique: true,
        required: true
    }
},
    {
        timestamps: true

    })
const Favorites = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorites;