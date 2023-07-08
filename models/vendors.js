const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
    vendorId:{
        type: String,
        required: true,
    },
    vendorName:{
        type: String,
        required: true,
    },
    vendorEmail:{
        type: String,
        required: true,
    },
    vendorPassword:{
        type: String,
        required: true,
    },
    vendorContact:{
        type: String,
        required: true,
    },
    foodCounterId:{
        type: String,
        required: true,
    },
    foodCounterName:{
        type: String,
        required: true,
    },
    fdcImg:{
        type: String,
        required: true,
    },
    
});
module.exports =  mongoose.model('Vendor',vendorSchema);