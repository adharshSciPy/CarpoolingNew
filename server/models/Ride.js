  const mongoose = require('mongoose');

  const RideSchema = new mongoose.Schema({
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Driver',
      required: true,
    },
    passengers: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      pickupLocation: String,
      dropoffLocation: String,
      fare: Number,
      status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending',
      },
    }],
    startLocation: {
      type: String,
      required: true,
    },
    endLocation: {
      type: String,
      required: true,
    },
    departureTime: {
      type: Date,
      required: true,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
  payPerKm: {
    type: Number,
    required: [true, "Please provide payment per kilometer"],
    min: 0,
  },
    status: {
      type: String,
      enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  });
  // 👇 Prevent OverwriteModelError or cached model issues
mongoose.models.Ride && delete mongoose.models.Ride;
  
  module.exports = mongoose.model('Ride', RideSchema);