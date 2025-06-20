const Ride = require("../models/Ride");
const Driver = require("../models/Driver");

exports.getRides = async (req, res, next) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // Finding resource
    query = Ride.find(JSON.parse(queryStr)).populate({
      path: "driver",
      populate: {
        path: "user",
        select: "name email phone",
      },
    });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Ride.countDocuments();

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const rides = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(200).json({
      success: true,
      count: rides.length,
      pagination,
      data: rides,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate({
        path: "driver", // populate driver from Driver collection
        populate: {
          // then populate user inside driver
          path: "user",
          select: "name email phone", // user fields
        },
        select: "carModel carColor plateNumber user", // driver fields to select
      })
      .populate({
        path: "passengers.user", // passengers user info
        select: "name phone",
      });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: "Ride not found",
      });
    }

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (error) {
    next(error);
  }
};

exports.createRide = async (req, res, next) => {
  try {
    // Find driver by user ID
    const driver = await Driver.findOne({ user: req.body.driver });

    if (!driver || !driver.approved) {
      return res.status(400).json({
        success: false,
        message: "Driver not found or not approved",
      });
    }

    // Replace the user ID with the actual driver ID in the ride payload
    req.body.driver = driver._id;

    // Create ride
    const ride = await Ride.create(req.body);

    res.status(201).json({
      success: true,
      data: ride,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateRide = async (req, res, next) => {
  try {
    const ride = await Ride.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: `No ride found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteRide = async (req, res, next) => {
  try {
    const ride = await Ride.findByIdAndDelete(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: `No ride found with id ${req.params.id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    next(err);
  }
};

exports.bookRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: `No ride found with id ${req.params.id}`,
      });
    }

    if (ride.availableSeats < 1) {
      return res.status(400).json({
        success: false,
        message: "No available seats",
      });
    }

    // Add passenger to ride
    ride.passengers.push({
      user: req.user.id,
      pickupLocation: req.body.pickupLocation,
      dropoffLocation: req.body.dropoffLocation,
      fare: ride.pricePerSeat,
      status: "pending",
    });
    console.log(req.body.dropoffLocation);
    // Decrease available seats
    ride.availableSeats -= 1;

    await ride.save();

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (err) {
    next(err);
  }
};

exports.completeRide = async (req, res, next) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({
        success: false,
        message: `No ride found with id ${req.params.id}`,
      });
    }

    // Check if the requesting user is the driver
    const driver = await Driver.findOne({ user: req.user.id });
    if (!driver || ride.driver.toString() !== driver._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to complete this ride",
      });
    }

    // Update ride status
    ride.status = "completed";
    ride.passengers.forEach((passenger) => {
      if (passenger.status === "confirmed") {
        passenger.status = "completed";
      }
    });

    // Update driver's trips completed
    driver.tripsCompleted += 1;
    await driver.save();

    await ride.save();

    res.status(200).json({
      success: true,
      data: ride,
    });
  } catch (err) {
    next(err);
  }
};
