const AppError = require("../utils/appError");

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

const handleValidationErrorDB = (err) => {
  const message = Object.values(err.errors)
    .map((err) => err.properties.message)
    .join(". ");
  return new AppError(message, 400);
};

const handleDublicateFieldDB = (err) => {
  const message = `Record with ${Object.keys(err.keyValue)[0]} '${
    Object.values(err.keyValue)[0]
  }' already exist`;
  return new AppError(message, 400);
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "DEVELOPMENT") {
    sendDevError(err, res);
  } else {
    if (err.name === "ValidationError") err = handleValidationErrorDB(err);
    if (err.code === 11000) err = handleDublicateFieldDB(err);
    sendProdError(err, res);
  }
};
