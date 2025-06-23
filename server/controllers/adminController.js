const jwt = require('jsonwebtoken');
const Admin = require('../models/adminModel.js');

const generateToken = (id) => {
  return jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Register
exports.registerAdmin = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await Admin.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({ name, email, password });
    res.status(201).json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id)
      }
    });
  } catch (err) {
    console.error('Admin Register Error:', err);
    res.status(500).json({ message: 'Registration failed' });
  }
};

// Login
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({
      success: true,
      data: {
        _id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id)
      }
    });
  } catch (err) {
    console.error('Admin Login Error:', err);
    res.status(500).json({ message: 'Login failed' });
  }
};
