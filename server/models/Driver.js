const mongoose = require("mongoose");

const DriverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  licenseNumber: {
    type: String,
    required: [true, "Please provide license number"],
  },
  carModel: {
    type: String,
    required: [true, "Please provide car model"],
  },
  carColor: {
    type: String,
    required: [true, "Please provide car color"],
  },
  plateNumber: {
    type: String,
    required: [true, "Please provide car plate number"],
  },
  carCapacity: {
    type: String,
    required: [true, "Please provide car capacity"],
    min: 1,
  },
  approved: {
    type: Boolean,
    default: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  tripsCompleted: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("Driver", DriverSchema);
