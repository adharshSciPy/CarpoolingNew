const express = require('express');
const router = express.Router();
const { registerAdmin, loginAdmin } = require('../controllers/adminController.js');

// POST /api/admin/register
router.post('/register', registerAdmin);

// POST /api/admin/login
router.post('/login', loginAdmin);

module.exports = router;
