const express = require("express");
const morgan = require("morgan");
const productRouter = require("./routes/productRoute");
const userRouter = require("./routes/userRoute");
const globalErrorHandler = require("./middleware/errorMiddleware");

const app = express();

//Development Logger
if (process.env.NODE_ENV === "DEVELOPMENT") {
  app.use(morgan("dev"));
}

//Body Parser
app.use(express.json());

//Route Middlewares
app.use("/api/v1/products", productRouter);
app.use("/api/v1/users", userRouter);

//Global error handler middleware
app.use(globalErrorHandler);

module.exports = app;
