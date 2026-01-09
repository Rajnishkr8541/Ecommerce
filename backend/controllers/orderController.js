const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const {calculateCartTotals} = require("../utils/calculateTotal")

exports.placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate totals
    const {
      subtotal,
      discount,
      totalAmount,
      deliveryCharge,
      grandTotal
    } = calculateCartTotals(cart.items);

    // Prepare order items
    const orderItems = cart.items.map(item => ({
      product: item.product._id,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtAdd,
      deliveryCharge,
      grandTotal
    }));

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      discount,
      deliveryCharge,
      grandTotal
    });

    // Reduce stock
    for (const item of cart.items) {
      const product = await Product.findById(item.product._id);

      product.stock -= item.quantity;
      if (product.stock <= 0) {
        product.stock = 0;
        product.isOutOfStock = true;
      }

      await product.save();
    }

    // Clear cart
    cart.items = [];
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to place order" });
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

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ❌ Already shipped / delivered
    if (["Shipped", "Delivered"].includes(order.status)) {
      return res.status(400).json({
        message: "Order cannot be cancelled after shipping"
      });
    }

    // ✅ STOCK ROLLBACK
    for (let item of order.items) {
      const product = await Product.findById(item.product._id);

      product.stock += item.quantity;
      product.isOutOfStock = false;

      await product.save();
    }

    // ✅ Cancel order
    order.status = "Cancelled";
    await order.save();

    res.json({
      message: "Order cancelled & stock restored successfully",
      order
    });

  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};

