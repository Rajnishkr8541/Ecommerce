const express = require("express");
const router = express.Router();

const {protect} = require("../middleware/authMiddleware")
const {adminOnly} = require("../middleware/authMiddleware");
const {placeOrder, getMyOrders,getAllOrders,updateOrderStatus,cancelOrder } = require("../controllers/orderController")

router.post("/place", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.patch("/:orderId/status", protect, adminOnly, updateOrderStatus);
router.patch("/:orderId/cancel", protect, cancelOrder);

module.exports = router;