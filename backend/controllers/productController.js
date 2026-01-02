const Product = require("../models/Product");

// ➕ ADD PRODUCT (ADMIN ONLY)
exports.createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body); // 👈 now works
    res.status(201).json(product);
  } catch (error) {
    console.error("CREATE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Product creation failed" });
  }
};


// ✏️ UPDATE PRODUCT (ADMIN ONLY)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Product update failed" });
  }
};

// ❌ DELETE PRODUCT (ADMIN ONLY)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json({ message: "Product deleted" });
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Product deletion failed" });
  }
};

// 👁️ TOGGLE PRODUCT VISIBILITY (ADMIN ONLY)
exports.toggleProductStatus = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.isActive = !product.isActive;
    await product.save();

    res.json({
      message: `Product ${product.isActive ? "activated" : "deactivated"}`,
      product
    });
  } catch (error) {
    console.error("TOGGLE PRODUCT ERROR:", error);
    res.status(500).json({ message: "Status change failed" });
  }
};

// 🌍 PUBLIC: GET ALL ACTIVE PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json(products);
  } catch (error) {
    console.error("GET PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Fetching products failed" });
  }
};

// 🔍 PUBLIC: GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      isActive: true
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("GET PRODUCT ERROR:", error);
    res.status(500).json({ message: "Fetching product failed" });
  }
};

// 📉 ADMIN / ORDER FLOW: REDUCE STOCK
exports.reduceStock = async (req, res) => {
  try {
    const { quantity } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const product = await Product.findById(req.params.id);

    if (!product || !product.isActive) {
      return res.status(404).json({ message: "Product not found" });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: "Not enough stock",
        availableStock: product.stock
      });
    }

    product.stock -= quantity;
    await product.save();

    res.json({
      message: "Stock updated",
      stock: product.stock,
      inStock: product.inStock
    });
  } catch (error) {
    console.error("REDUCE STOCK ERROR:", error);
    res.status(500).json({ message: "Stock update failed" });
  }
};


// Admin Product discount update

exports.updateProductDiscount = async (req, res) => {
  try {
    const { discount } = req.body;

    //Validation
    if(discount < 0 || discount > 70){
      return res.status(400).json({message: "Discount must be between 0 and 70 percent"});
    }
    const product = await Product.findById(req.params.id);

    if(!product){
      return res.status(404).json({message: "Product not found"});
    }
    product.discount = discount;
    await product.save();

    res.json({
      message: "Discount Updated",
      product
    });
  }catch(error){
    console.error("UPDATE DISCOUNT ERROR:", error);
    res.status(500).json({message: "faild to update discount"})
  }
};