const User = require("../models/User");
const Driver = require("../models/Driver");
const jwt = require("jsonwebtoken");
const { jwtSecret, jwtExpire } = require("../config/jwt");

exports.register = async (req, res, next) => {
  const {
    name,
    email,
    password,
    phone,
    role,
    licenseNumber,
    carModel,
    carColor,
    plateNumber,
    carCapacity,
  } = req.body;
  console.log(req.body);
  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role,
    });

    // If user is registering as a driver, create driver profile
    if (role === "driver") {
      await Driver.create({
        user: user._id,
        licenseNumber,
        carModel,
        carColor,
        plateNumber,
        carCapacity,
        approved:true,
      });
    }

    sendTokenResponse(user, 201, res);
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials", // Consistent error message
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials", // Same message as above
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    let driverProfile = null;

    if (user.role === "driver") {
      driverProfile = await Driver.findOne({ user: user._id });
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        driverProfile,
      },
    });
  } catch (err) {
    next(err);
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = jwt.sign({ id: user._id }, jwtSecret, {
    expiresIn: jwtExpire,
  });

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    role: user.role,
    id: user._id
  });
};
