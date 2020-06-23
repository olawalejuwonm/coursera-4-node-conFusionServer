const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const favoriteSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        unique: true
    },
    dishes: [{
        type: Schema.Types.ObjectId,
        ref: "Dish"
    }]
},
{
    timestamps: true
})


Favorites = mongoose.model("Favorite", favoriteSchema);

module.exports = Favorites;