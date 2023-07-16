const mongoose = require('mongoose');

const dpSchema = new mongoose.Schema({
    dpId:{
        type: String,
        required: true,
    },
    dpName:{
        type: String,
        required: true,
    },
    dpPassword:{
        type: String,
        required: true,
    },
    dpContact:{
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('deliveryperson',dpSchema);