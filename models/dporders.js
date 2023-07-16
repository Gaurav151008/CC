const mongoose = require('mongoose');

const dpordersSchema = new mongoose.Schema({
    dpId:{
        type: String,
        required: true,
    },
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
    orderTotalAmount:{
        type: Number,
        required: true,
    },
    deliveryAddress:{
        type: String,
        required: true,
    },
    orderInsentive:{
        type: Number,
        required: true,
        default: 5,
    },
    orderDateTime:{
        type: Date,
        required: true,
    },
    deliveryStatus:{
        type: String,
        require: true,
        default: "panding",
    }
})

module.exports = mongoose.model('dporders',dpordersSchema);