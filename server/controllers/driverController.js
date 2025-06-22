const Driver = require('../models/Driver');
const User = require('../models/User');

exports.getDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find().populate({
      path: 'user',
      select: 'name email phone',
    });

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers,
    });
  } catch (err) {
    next(err);
  }
};

exports.getDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id).populate({
      path: 'user',
      select: 'name email phone',
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: `No driver found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate({
      path: 'user',
      select: 'name email phone',
    });

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (err) {
    next(err);
  }
};

exports.approveDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      {
        new: true,
        runValidators: true,
      }
    ).populate({
      path: 'user',
      select: 'name email phone',
    });

    res.status(200).json({
      success: true,
      data: driver,
    });
  } catch (err) {
    next(err);
  }
};
exports.toggleDriverApproval = async (req, res) => {
  const { driverId } = req.params;

  try {
    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: "Driver not found",
      });
    }

    driver.approved = !driver.approved;
    await driver.save();

    return res.status(200).json({
      success: true,
      message: `Driver ${driver.approved ? 'enabled' : 'disabled'} successfully`,
      driver,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
exports.getDriverByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const driver = await Driver.findOne({ user: userId });
    if (!driver) {
      return res.status(404).json({ success: false, message: 'Driver not found' });
    }
    res.status(200).json({ success: true, data: driver });
  } catch (error) {
    console.error("Error getting driver by user:", error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
exports.addDriverReview = async (req, res) => {
  const { driverId } = req.params;
  const { rating, feedback, rideId } = req.body;

  try {
    const driver = await Driver.findById(driverId);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    driver.reviews.push({
      user: req.user.id,
      ride: rideId,
      rating,
      feedback,
    });

    await driver.save();

    res.status(200).json({ success: true, message: "Review added" });
  } catch (err) {
    res.status(500).json({ message: "Error submitting review" });
  }
};
