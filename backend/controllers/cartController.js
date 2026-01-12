const Cart = require("../models/Cart");
const Product = require("../models/Product");
const {calculateCartTotals} = require("../utils/calculateTotal")
const Coupon = require("../models/Coupon")

//  GET USER CART
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id })
      .populate("items.product", "name price stock");

    res.json(cart || { items: [] });
  } catch (error) {
    console.error("GET CART ERROR:", error.message);
    res.status(500).json({ message: "Failed to fetch cart" });
  }
};

//ADD item in CART
exports.addToCart = async (req,res) => {
  try {
    const { productId, quantity} = req.body;

    //product check
    const product = await Product.findById(productId);

    if(!product){
      return res.status(404).json({message: "Product not found"});  
    }

    //out of stock check
    if(product.isOutOfStock || product.stock === 0){
      return res.status(400).json({message: "Product is out of stock"});
    }

    if(quantity > product.stock){
      return res.status(400).json({message: `Only ${product.stock} items available`});
    }

    //find cart
    let cart = await Cart.findOne({user:req.user._id});

    if(!cart){
      cart = new Cart({user: req.user._id, items: []});
    }

    //check id item alredy in stock
    const existingItem = cart.items.find(item => item.product.toString() === productId.toString());

    if(existingItem){
      existingItem.quantity += quantity;
      existingItem.priceAtAdd = product.price;
    }else{
      cart.items.push({product: productId, quantity, priceAtAdd: product.price}); //price freeze
    }

    await cart.save();

    res.status(200).json({message: "Item added to cart successfully", cart});


  } catch (error) {
    console.error("ADD TO CART ERROR:", error.message);
    res.status(500).json({ message: "Failed to add item to cart"});
  }
}

//REMOVE FROM CART
exports.removeFromCart = async (req, res) => {
  try {
    const {productId} =req.params;

    const cart = await Cart.findOne({user: req.user._id});

    if(!cart){
      return res.status(404).json({message: "Cart not found"});
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);

    await cart.save();

    res.json({message: "Item removed from cart", cart});


  } catch (error) {
    console.error("REMOVE FROM CART ERROR:", error);
    res.status(500).json({message: "Failed to remove item from cart"})
  }
};

//UPDATE CART ITEM
exports.updateCartItem = async (req,res) => {
  try {
    const {productId, quantity} = req.body;

    if(quantity < 1){
      return res.status(400).json({message: " Quantity must be at least 1"});
    }

    const cart = await Cart.findOne({user: req.user._id}).populate("items.product");

    if(!cart){
      return res.status(404).json({message: "Cart not found"});
    }

    const item = cart.items.find(i => i.product._id.toString() === productId);

    if(!item){
      return res.status(404).json({message: "Item not found in cart"});
    }

    //check stock
    if(quantity > item.product.stock){
      return res.status(400).json({message: `Only ${item.product.stock} items available`});
    }

    item.quantity = quantity;
    await cart.save();

    res.json({message: "Cart item updated successfully", cart})
    
  } catch (error) {
    console.error("UPDATE CART ITEM ERROR:", error.message);
    res.status(500).json({message: "failed to update cart item"});
  }
}

//Cart summary 
exports.getCartSummary = async (req,res)=>{
  try {
    const cart = await Cart.findOne({user: req.user._id}).populate("items.product").populate("coupon");

    if(!cart || cart.items.length === 0){
      return res.json({
        items: [],
        subtotal: 0,
        discount: 0,
        deliveryCharge: 0,
        grandTotal: 0
      });
    } 

    const totals = calculateCartTotals(cart.items, cart.coupon);

    const items = cart.items.map(item => ({
      product: {
        _id: item.product._id,
        name: item.product.name,
        price: item.priceAtAdd
      },
      quantity: item.quantity,
      itemTotal: item.priceAtAdd* item.quantity
    }));

    res.json({
      items,
      coupon:cart.coupon?{
        code: cart.coupon.code,
        discountPercent: cart.coupon.discountPercent,
        flatDiscount: cart.coupon.flatDiscount
      }: null,
      ...totals
    });

  } catch (error) {
    console.error("CART SUMMARY ERROR:", error.message);
    res.status(500).json({message: "Failed to calculate cart summary"})
    
  }
}


// Apply coupon to cart

exports.applyCoupon = async (req, res) => {
  try {
    const {code} = req.body;

    const coupon = await Coupon.findOne({
      code : code.toUpperCase(),
      isActive : true,
      expiresAt : {$gte: new Date()}
    });

    if(!coupon){
      return res.status(400).json({message: " Invalid or Expired coupon"});
    }

    const cart = await Cart.findOne({user: req.user._id}).populate("items.product");

    if(!cart || cart.items.length === 0){
      return res.status(400).json({message: "Cart is empty"})
    }

    //subtotal

    let subtotal = 0;
    cart.items.forEach(item =>{
      subtotal += item.priceAtAdd* item.quantity; 
    });

    if (subtotal < coupon.minOrderAmount) {
      return res.status(400).json({
        message:`Minimum order ₹${coupon.minOrderAmount} required`
      });
    }

    cart.coupon = coupon._id;
    await cart.save();

    //calculate total with coupon
    const totals = calculateCartTotals(cart.items, coupon)

    res.json({message: "Coupon applied successfully", coupon, totals});

  }catch(error){
    console.error("APPLY COUPON ERROR:", error);
    res.status(500).json({message: "Failed to apply coupon"});
  }
};
