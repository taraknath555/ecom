const crypto = require("crypto");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = async (id) => {
  return await promisify(jwt.sign)({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = async (user, statusCode, res) => {
  const token = await signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV.trim() === "PRODUCTION",
  };
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    user,
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const { name, email, role, profilePic, password, passwordConfirm } = req.body;
  const newUser = await User.create({
    name,
    email,
    role,
    profilePic,
    password,
    passwordConfirm,
  });

  await createSendToken(newUser, 201, res);
});

exports.signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please provide email and password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.checkPassword(user.password, password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  await createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //check Bearer token exist or not
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(new AppError("You are not Logged in, Please Login first", 401));
  }

  //check user belonging to the token(if there) is now exist or not
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const currentUser = await User.findById(decoded.id).select(
    "+passwordChangedAt"
  );
  if (!currentUser) {
    return next(
      new AppError("User belonging to this token no longer exist", 401)
    );
  }

  //Check password of the user changed recently or not(after token issued)
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError(
        "You Changed your password recently, Please login again",
        401
      )
    );
  }

  //Add user to request object
  req.user = currentUser;
  next();
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  if (!req.body.email) {
    return next(new AppError("Please provide your email", 400));
  }
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new AppError("There is no user exist with this email address", 404)
    );
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forget your password? Submit a patch request with your 
  new password and passwordConfirm to: ${resetUrl}
  If you don't forget your password please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token (valid for 10 min minutes)",
      text: message,
    });
    res.status(200).json({
      status: "success",
      message: "Password reset token send to email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        "There was an error sending the email, Please try again later",
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetTokenExpire: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return next(new AppError("Token Invalid or has expired", 400));
  }

  if (await user.checkPassword(user.password, req.body.password)) {
    return next(
      new AppError(
        "Your new password must be different from current password",
        400
      )
    );
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenExpire = undefined;
  await user.save();

  await createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  if (!req.body.currentPassword) {
    return next(new AppError("Please provide your current password", 400));
  }
  const user = await User.findById(req.user._id).select("+password");

  if (!(await user.checkPassword(user.password, req.body.currentPassword))) {
    return next(new AppError("Your current password is wrong", 401));
  }

  if (await user.checkPassword(user.password, req.body.newPassword)) {
    return next(
      new AppError(
        "Your new password must be different from current password",
        400
      )
    );
  }

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;
  await user.save();
  await createSendToken(user, 200, res);
});
