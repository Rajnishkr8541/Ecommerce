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
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Address",
        requires: true
    },
    status:{
        type: String,
        enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    },
    shippingAddress:{
        name: String,
        phone: String,
        addressLine: String,
        city: String,
        State: String,
        pincode: String,
    },
    paymentMethod: {
        type: String,
        enum: ["COD", "ONLINE"],
        default: "COD"
    },
    paymentStatus:{
        type: String,
        enum: ["Pending", "Paid", "failed"],
        default: "Pending"
    }




}, {timestamps: true});

module.exports = mongoose.model("Order", orderSchema)