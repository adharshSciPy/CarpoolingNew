const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, minlength: 3, maxlength: 50 },
  email: {
    type: String,
    unique: true,
    required: true,
    validate: { validator: validator.isEmail, message: 'Invalid email' },
  },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, required: true },
  role: { type: String, enum: ['user', 'driver'], default: 'user' },

  // Driver-specific fields
  carModel: String,
  carColor: String,
  carCapacity: String,
  plateNumber: String,
  licenseNumber: String,

  verified: { type: Boolean, default: false },
});

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
