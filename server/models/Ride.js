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
  pricePerSeat: {
    type: Number,
    required: true,
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

module.exports = mongoose.model('Ride', RideSchema);