const mongoose = require("mongoose");

const couponSchema  = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    discountPercent:{
        type: Number,
        default: 0
    },
    flatDiscount : {
        type : Number,
        default: 0
    },
    minOrderAmount: {
        type : Number,
        default : 0
    },
    expiresAt : {
        type : Date,
        required : true
    },
    isActive : {
        type : Boolean,
        default : true
    }
}, {timestamps : true});

module.exports = mongoose.model("Coupon", couponSchema)
