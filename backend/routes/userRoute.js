const express = require("express");
const {
  signup,
  signin,
  protect,
  forgotPassword,
  resetPassword,
  updatePassword,
} = require("../controllers/authController");

const {
  getMe,
  getUser,
  updateMe,
  deleteMe,
} = require("../controllers/userController");

const router = express.Router();

router.route("/signup").post(signup);
router.route("/signin").post(signin);

router.route("/forgotPassword").post(forgotPassword);
router.route("/resetPassword/:resetToken").patch(resetPassword);

//protect all routes after this middleware
router.use(protect);

router.route("/updatePassword").patch(updatePassword);
router.route("/me").get(getMe, getUser);
router.route("/updateMe").patch(updateMe);
router.route("/deleteMe").delete(deleteMe);

module.exports = router;
