const mongoose = require("mongoose");

module.exports = connectDB = () => {
  mongoose
    .connect(process.env.LOCAL_DATABASE, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then((con) => {
      console.log("Connected to database successfully");
    })
    .catch((err) => {
      console.log(`Error : ${err.message}`);
      process.exit(1);
    });
};
