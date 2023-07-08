const mongoose = require('mongoose');
const { schema } = require('./vendors');

const cartschema = new mongoose.Schema({
    
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
    itemQuntity:{
        type: Number,
        required: true,
    },
    customerId:{
        type: String,
        required: true,
    },
    status:{
        type: String,
        required: true,
        default: "pending",
    },
});

module.exports = mongoose.model('cart', cartschema);