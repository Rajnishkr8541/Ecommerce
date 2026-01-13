const express = require("express");
const router = express.Router();

const {protect} = require("../middleware/authMiddleware")

const{
    addAddress,
    getMyAddresses,
    setDefaultAddress
} = require("../controllers/addressController")

router.post("/add", protect, addAddress);
router.get("/my", protect, getMyAddresses);
router.patch("/set-default/:id", protect, setDefaultAddress);

module.exports = router;