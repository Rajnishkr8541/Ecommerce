const mongoose = require("mongoose");


const orderItemSchema = new mongoose.Schema({
    product:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
    },
    quantity:{
        type: Number,
        required: true

    },
    priceAtPurchase:{
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items:[orderItemSchema ],

    subtotal: {
        type: Number,
        required: true
    },
    discount: {
        type: Number,
        default: 0
    },
    deliveryCharge: {
        type: Number,
        required: true
    },
    grandTotal: {
        type: Number,
        required: true
    },
    coupon:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Coupon",
        default: null
    },
    couponCode:{
        type: String
    },
    couponDiscount:{
        type: Number,
        default: 0
    },
    status:{
        type: String,
        enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    }

}, {timestamps: true});

module.exports = mongoose.model("Order", orderSchema)