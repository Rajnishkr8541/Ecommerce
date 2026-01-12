const express = require("express");
const router = express.Router();

const {protect} = require("../middleware/authMiddleware")
const {adminOnly} = require("../middleware/authMiddleware");
const {placeOrder, getMyOrders,getAllOrders,updateOrderStatus,cancelOrder, getOrderDetails } = require("../controllers/orderController")

router.post("/place", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.patch("/status/:orderId", protect, adminOnly, updateOrderStatus);
router.patch("/cancel/:orderId", protect, cancelOrder);
router.get("/:orderId", protect, getOrderDetails);
module.exports = router;