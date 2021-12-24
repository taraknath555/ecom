const dotenv = require("dotenv").config({ path: "./config.env" });

const app = require("./app");
const connectDB = require("./config/db");

const port = process.env.PORT || 5000;

//Database connection
connectDB();

//Starting backend server
const server = app.listen(port, "127.0.0.1", () => {
  console.log(`Server started on port: ${port}`);
});
