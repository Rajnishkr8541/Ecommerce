const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    description: String,
    price: {
      type: Number,
      required: true
    },
    stock: {
      type: Number,
      default: 0
    },
    inStock: {
      type: Boolean,
      default: false
    },
    category: {
      type: String,
      required: true
    },
    image: String,
    discount: {
      type: Number,
      default: 0
    },
    finalPrice: Number,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

productSchema.pre("save", function () {
  this.inStock = this.stock > 0;

  if (this.discount > 0) {
    this.finalPrice =
      this.price - (this.price * this.discount) / 100;
  } else {
    this.finalPrice = this.price;
  }
});

module.exports = mongoose.model("Product", productSchema);
