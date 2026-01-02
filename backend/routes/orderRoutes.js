const express = require("express");
const router = express.Router();

const {placeOrder} = require("../controllers/orderController")
const {protect} = require("../middleware/authMiddleware")
const {getMyOrders} = require("../controllers/orderController") 
const {adminOnly} = require("../middleware/authMiddleware");
const {getAllOrders,updateOrderStatus} = require("../controllers/orderController")

router.post("/place", protect, placeOrder);
router.get("/my", protect, getMyOrders);
router.get("/", protect, adminOnly, getAllOrders);
router.patch("/:orderId/status", protect, adminOnly, updateOrderStatus);

module.exports = router;