const mongoose = require('mongoose')

const fooditemSchema = new mongoose.Schema({
    foodCounterId:{
        type: String,
        required: true,
    },
    itemId:{
        type: String,
        required: true,
    },
    itemName:{
        type: String,
        required: true,
    },
    itemPrice:{
        type: Number,
        required: true,
    },
    itemDesc:{
        type: String,
        required: true,
    },
    itemImg:{
        type: String,
        required: true,
    },
});

module.exports = mongoose.model('foodItems',fooditemSchema)