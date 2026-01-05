const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");


const {
  addToCart,
  updateCartItem,
  removeFromCart,
  getCart,
  getCartSummary
} = require("../controllers/cartController");

router.get("/", protect, getCart);
router.patch("/update", protect, updateCartItem)
router.post("/add", protect, addToCart);
router.patch("/update/:productId", protect, updateCartItem);
router.delete("/remove/:productId", protect, removeFromCart);
router.get("/summary", protect, getCartSummary);

module.exports = router;