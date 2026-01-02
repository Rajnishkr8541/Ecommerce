const Cart = require("../models/Cart");
const Product = require("../models/Product");

//  GET USER CART
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product");

    res.json(cart || { items: [] });
  } catch (error) {
    console.error("GET CART ERROR:", error.message);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

//ADD / UPDATE CART
exports.addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    //safety checks
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authorized" });
    }

    if (!productId || !quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Not enough stock",
        availableStock: product.stock
      });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      // create cart
      cart = new Cart({
        user: req.user._id,
        items: [{ product: productId, quantity }]
      });
    } else {
      const index = cart.items.findIndex(
        (item) => item.product.toString() === productId
      );

      if (index > -1) {
        const newQty = cart.items[index].quantity + quantity;

        if (newQty > product.stock) {
          return res.status(400).json({
            message: "Stock limit exceeded",
            availableStock: product.stock
          });
        }

        cart.items[index].quantity = newQty;
      } else {
        cart.items.push({ product: productId, quantity });
      }
    }

    await cart.save();
    res.json(cart);

  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    res.status(500).json({ message: "Failed to add to cart" });
  }
};

//REMOVE FROM CART
exports.removeFromCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();
    res.json(cart);
  } catch (error) {
    console.error("REMOVE CART ERROR:", error.message);
    res.status(500).json({ message: "Failed to remove item" });
  }
};
