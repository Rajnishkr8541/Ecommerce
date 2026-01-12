const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    name: String,
    phone: String,

    addressLine: String,
    city: String,
    state: String,
    pincode: String,
    country:{
        type: String,
        default: "India"
    },
    isDefault:{
        type: Boolean,
        default: false
    }

}, {timestamps: true});

module.exports = mongoose.model("Address", addressSchema);