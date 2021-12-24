const Product = require("../models/productModel");
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");

exports.getAllProducts = async (req, res, next) => {
  const products = await Product.find();
  res.status(200).json({
    status: "success",
    result: products.length,
    products,
  });
};

exports.createProduct = catchAsync(async (req, res, next) => {
  const newProduct = await Product.create(req.body);
  res.status(201).json({
    status: "success",
    product: newProduct,
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    return next(
      new AppError(`Product with id : ${req.params.id} does not exist`)
    );
  }
  res.status(200).json({
    status: "success",
    product,
  });
});
