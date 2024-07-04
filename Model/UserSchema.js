const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
    isVerify: {
        type: Boolean,
        default: false
    },

})

module.exports = mongoose.model("User", userSchema)