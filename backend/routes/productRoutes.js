const express = require("express");
const router = express.Router();


const {
  createProduct,
  updateProduct,
  deleteProduct,
  toggleProductStatus,
  getProducts,
  getProductById,
  reduceStock,
  updateProductDiscount
} = require("../controllers/productController");

const { protect, adminOnly } = require("../middleware/authMiddleware");

// 🌍 PUBLIC
router.get("/", getProducts);
router.get("/:id", getProductById)
router.patch("/:id/reduce-stock", protect, adminOnly,reduceStock)

// 🔒 ADMIN ONLY
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);
router.patch("/:id/toggle", protect, adminOnly, toggleProductStatus);
router.patch("/:id/discount",protect, adminOnly, updateProductDiscount)

module.exports = router;
