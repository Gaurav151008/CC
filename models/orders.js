const mongoose = require('mongoose');

const orderSchema  = new mongoose.Schema({

    orderId:{
        type: String,
        required: true,
    },
    foodCounterId:{
        type: String,
        required: true,
    },
    customerId:{
        type: String,
        required: true,
    },
    orderAmount:{
        type: Number,
        required: true,
    },
    orderDeliberyCharge:{
        type: Number,
        required: true,
    },
    orderTotalAmount:{
        type: Number,
        required: true,
    },
    deliveryAddress:{
        type: String,
        required: true,
    },
    paymentStatus:{
        type: String,
        required: true,
    },
    orderDateTime:{
        type: String,
        required: true,
    },
    
});

module.exports = mongoose.model('orders',orderSchema);