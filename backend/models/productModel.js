const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "Please enter product name"],
      minLength: [5, "Product name must be minimum 5 characters long"],
      maxLength: [50, "Product name must be maximum 50 characters long"],
    },
    price: {
      type: Number,
      required: [true, "Please enter product price"],
      min: [99, "Minimum price of a product is 99"],
    },
    image: {
      type: String,
      required: [true, "Please upload product image"],
    },
    description: {
      type: String,
      trim: true,
      required: [true, "Please add product description"],
    },
    brand: {
      type: String,
      trim: true,
      required: [true, "Please add product brand"],
    },
    category: {
      type: String,
      trim: true,
      required: [true, "Please add product Catagory"],
    },
    rating: {
      type: Number,
      default: 0,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    countInStock: {
      type: Number,
      default: 0,
    },
    // addedBy: {
    //   type: mongoose.Schema.ObjectId,
    //   required: true,
    //   ref: "USer",
    // },
  },
  {
    timeStamps: true,
  }
);

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
