const dotenv = require("dotenv");
const connectDB = require("../config/db");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const productsData = require("./dev-data/productsData");
const usersData = require("./dev-data/usersData");

dotenv.config({ path: "../config.env" });

connectDB();

const deleteData = async () => {
  try {
    await Product.deleteMany();
    await User.deleteMany();
    console.log("Data deleted successfully");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

const importData = async () => {
  try {
    await Product.create(productsData, { validateBeforeSave: false });
    await User.create(usersData, { validateBeforeSave: false });
    console.log("Data loaded successfully");
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === "--import") {
  importData();
} else if (process.argv[2] === "--delete") {
  deleteData();
}
