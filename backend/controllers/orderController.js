const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { calculateCartTotals } = require("../utils/calculateTotal");

exports.placeOrder = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product")
      .populate("coupon");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // Calculate totals
    const { subtotal, discount, deliveryCharge, grandTotal } =
      calculateCartTotals(cart.items, cart.coupon);

    // Prepare order items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
      priceAtPurchase: item.priceAtAdd,
    }));

    //coupon discount only
    const couponDiscount = cart.coupon
      ? cart.coupon.discountPercent
        ? (subtotal * cart.coupon.discountPercent) / 100
        : cart.coupon.flatDiscount || 0
      : 0;

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      discount,
      deliveryCharge,
      grandTotal,
      coupon: cart.coupon ? cart.coupon._id : null,
      couponCode: cart.coupon ? cart.coupon.code : null,
      couponDiscount
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
    cart.coupon = null;
    await cart.save();

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("PLACE ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
};

// Users orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });

    const formattedOrders = orders.map(order => ({
      orderId: order._id,
      status: order.status,
      orderDate: order.createdAt,

      items: order.items.map(item => ({
        productId: item.product?._id,
        name: item.product?.name,
        price: item.priceAtPurchase,
        quantity: item.quantity,
        itemTotal: item.priceAtPurchase * item.quantity
      })),

      priceSummary: {
        subtotal: order.subtotal,
        discount: order.discount,
        couponCode: order.couponCode || null,
        couponDiscount: order.couponDiscount || 0,
        deliveryCharge: order.deliveryCharge,
        grandTotal: order.grandTotal
      }
    }));

    res.json({
      totalOrders: formattedOrders.length,
      orders: formattedOrders
    });

  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

//Admin get All orders
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name price")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

//Admin update order status
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "Order status updated", order });
  } catch (error) {
    console.error("Update status error:", error);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

//CANCEL ORDERS by user
exports.cancelOrder = async (req, res) => {
  try {

    const {orderId} = req.params; 

    const order = await Order.findById(orderId).populate(
      "items.product"
    );

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    //user permission check
    if(order.user.toString() !== req.user._id.toString()){
      return res.status(403).json({
        message: "You are not allowed to cancel this order"
      });
    }

    //Stock Rollback
    for(const item of order.items){
      const product = await Product.findById(item.product._id);

      if(product){
        product.stock += item.quantity;
        product.isOutOfStock = false;
        await product.save()
      }
    }

    //cancel order
    order.status = "Cancelled";
    await order.save();

    res.json({
      message: "Order Cancelled Successfully",
      orderId: order._id,
      status: order.status
    })

    
  } catch (error) {
    console.error("Cancel order error:", error);
    res.status(500).json({ message: "Failed to cancel order" });
  }
};
