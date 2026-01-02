const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const {calculateCartTotals} = require("../utils/calculateTotal")

exports.placeOrder = async (req, res) => {
    try{
        //User Cart
        const cart = await Cart.findOne({user: req.user._id}).populate("items.product");
        if(!cart || cart.items.length === 0){
            return res.status(400).json({message: "Cart is empty"})
        }

        //total calculation
        const {subtotal, discount,totalAmount, deliveryCharge, grandTotal} = calculateCartTotals(cart.items);

        //order items prepared
        const orderItems = cart.items.map(item => ({
            product: item.product._id,
            quantity: item.quantity,
            priceAtPurchase: item.product.price
        }));

        
        //create order
        const order = await Order.create({
            user: req.user._id,
            items: orderItems,
            subtotal,
            discount,
            deliveryCharge,
            grandTotal
        });

        // stock reduce

        for(let item of cart.items){
            const product = await Product.findById(item.product._id);

            product.stock -= item.quantity;

            if(product.stock <= 0){
                product.stock = 0;
                product.isOutOfStock = true;
            }

            await product.save();
        }

        //clear cart
        cart.items = [];
        await cart.save();

        //Response
        res.status(201).json({message: "Order placed successfully", order});
        }catch(error){
            console.error("Error placing order:", error);
            res.status(500).json({message: "Internal Server Error"});
        }
};

// Users orders
exports.getMyOrders = async (req,res) => {
    try{
        const orders = await Order.find({user: req.user._id}).populate("items.product","name.price").sort({createdAt: -1});
        res.json(orders);
    }catch(error){
        console.error("Get my orders error:", error);
        res.status(500).json({message: "Failed to fetch orders"})
    }
};

//Admin get All orders
exports.getAllOrders = async (req,res) => {
    try {
        const orders = await Order.find().populate("user","name email").populate("items.product", "name price").sort({createdAt: -1});
        res.json(orders);
        
    } catch (error) {
        console.error("Get all orders error:",error);
        res.status(500).json({message: "Failed to fetch orders"})
    }
}

//Admin update order status
exports.updateOrderStatus = async (req,res) =>{
    try {
        const {status} = req.body;

        const order = await Order.findById(req.params.orderId);

        if(!order){
            return res.status(404).json({message: "Order not found"})
        }
        
        order.status = status;
        await order.save();

        res.json({message: "Order status updated", order});

    } catch (error) {
        console.error("Update status error:",error);
        res.status(500).json({message: "Failed to update order status"});
        
    }
};

// CANCEL ORDER 
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId).populate(items.product);

        if(!order){
            return res.status(404).json({message: "Order not found"});
        }

        // Already shipped or delivered
        if(["Shipped", "Delivered"].includes(order.status)){
            return res.status(400).json({message: "Order cannoot be cancelled after shipping"});
        }

        //Stock rollback

        
    } catch (error) {
        
    }
}