const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId:{
        type: String,
        required: true,
    },
    userName:{
        type: String,
        required: true,
    },
    userEmail:{
        type: String,
        required: true,
    },
    userPassword:{
        type: String,
        required: true,
    },
    userContact:{
        type: String,
        required: true,
    },
})

module.exports = mongoose.model('user',userSchema);