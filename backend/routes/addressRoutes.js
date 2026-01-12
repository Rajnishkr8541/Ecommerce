const express = require("express");
const router = express.Router();

const {protect} = require("../middleware/authMiddleware")

const{
    addAddress,
    getMyAddresses,
    setDefaultAddress
} = require("../controllers/addressController")

router.post("/add", protect, addAddress);
router.get("/", protect, getMyAddresses);
router.patch("/:id/default", protect, setDefaultAddress);

module.exports = router;