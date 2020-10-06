const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const favoriteSchema = new Schema({
    dishes: [
        {
            type: Schema.Types.ObjectId,
            required: true,
            unique: true,
            ref: 'Dish'
        }
    ],
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
},
    {
        timestamps: true

    })

var Favorites = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorites;