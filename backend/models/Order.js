const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    items:[
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true
            },
            quantity: {
                type: Number,
                required: true,
            },
            priceAtPurchase:{
                type: Number,
                required: true
            },
        }
    ],

    subtotal:{ 
        type:Number,
        required: true
    },
    discount:{ 
        type: Number,
        default: 0
    },
    deliveryCharge:{
        type: Number,
        default: 55
    },
    grandTotal: {
        type: Number,
        required: true
    },

    status:{
        type: String,
        enum: ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"],
        default: "Pending"
    }
}, {timestamps: true});

module.exports = mongoose.model("Order", orderSchema)