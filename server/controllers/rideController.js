const Ride = require("../models/Ride");
const Driver = require("../models/Driver");
const AdminWallet=require("../models/adminWallet");
const getRoutePolyline = require("../utility");


exports.getRides = async (req, res, next) => {
  try {
    let query;

    const reqQuery = { ...req.query };
    const removeFields = ["select", "sort", "page", "limit", "onlyUpcoming"];
    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

    const parsedQuery = JSON.parse(queryStr);

    // ✅ Filter for upcoming rides only
    if (req.query.onlyUpcoming === 'true') {
      parsedQuery.departureTime = { $gte: new Date() };
    }

    query = Ride.find(parsedQuery)
      .populate({
        path: "driver",
        populate: [
          {
            path: "user",
            select: "name email phone",
          },
          {
            path: "reviews.user",
            select: "name",
          },
        ],
      })
      .populate({
        path: "passengers.user",
        select: "name phone",
      });

    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const total = await Ride.countDocuments(
      req.query.onlyUpcoming === 'true' ? { departureTime: { $gte: new Date() } } : {}
    );

    query = query.skip(startIndex).limit(limit);

    const rides = await query;

    // ✅ Add average rating for each ride's driver
    const ridesWithRatings = rides.map((ride) => {
      const driver = ride.driver;
      let averageRating = 0;

      if (driver && Array.isArray(driver.reviews) && driver.reviews.length > 0) {
        const total = driver.reviews.reduce((sum, r) => sum + (r.rating || 0), 0);
        averageRating = parseFloat((total / driver.reviews.length).toFixed(1));
      }

      // Add averageRating field to ride
      return {
        ...ride.toObject(),
        averageRating,
      };
    });

    const pagination = {};
    if (endIndex < total) {
      pagination.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
      pagination.prev = { page: page - 1, limit };
    }

    res.status(200).json({
      success: true,
      count: ridesWithRatings.length,
      pagination,
      data: ridesWithRatings,
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
    const { startLocation, endLocation } = req.body;
    const userId = req.user._id; // ✅ from token

    const driver = await Driver.findOne({ user: userId });

    if (!driver || !driver.approved) {
      console.error("Driver not found or not approved:", userId);
      return res.status(403).json({
        success: false,
        message: "Driver not found or not approved",
      });
    }

    req.body.driver = driver._id;

    const routePolyline = await getRoutePolyline(startLocation, endLocation);
    req.body.routePolyline = routePolyline;

    const ride = await Ride.create(req.body);

    res.status(201).json({
      success: true,
      data: ride,
    });
  } catch (err) {
    console.error("❌ Ride Creation Failed:", err.message);
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
    const { rideId, userId } = req.params;
    const { pickupLocation, dropoffLocation, fare, seatCount } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({
        success: false,
        message: `No ride found with id ${rideId}`,
      });
    }

    const seatsToBook = parseInt(seatCount, 10);
    if (isNaN(seatsToBook) || seatsToBook < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid seat count",
      });
    }

    if (ride.availableSeats < seatsToBook) {
      return res.status(400).json({
        success: false,
        message: `Only ${ride.availableSeats} seat(s) available`,
      });
    }

    const numericFare = parseFloat(fare);
    if (isNaN(numericFare)) {
      return res.status(400).json({
        success: false,
        message: "Invalid fare value",
      });
    }

    const totalFare = +(numericFare * seatsToBook).toFixed(2);
    const adminCommission = +(totalFare * 0.002).toFixed(2); // 0.2%
    const userFare = +(totalFare - adminCommission).toFixed(2);

    // Add a single passenger object with seat count
    ride.passengers.push({
      user: userId,
      pickupLocation,
      dropoffLocation,
      fare: totalFare,
      seatCount: seatsToBook,
      status: "completed",
    });

    ride.availableSeats -= seatsToBook;
    await ride.save();

    const adminShare = new AdminWallet({
      rideId,
      userId,
      share: adminCommission,
    });
    await adminShare.save();

    res.status(200).json({
      success: true,
      message: `${seatsToBook} seat(s) booked successfully`,
      data: ride,
    });
  } catch (err) {
    console.error("Book Ride Error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
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
