const express = require('express');
const {
  getDrivers,
  getDriver,
  updateDriver,
  approveDriver,
  toggleDriverApproval,
} = require('../controllers/driverController');
// const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// router.use(protect);

router.get('/', getDrivers);
router.get('/:id', getDriver);
router.put('/:id', updateDriver);
// router.put('/:id/approve', authorize('admin'), approveDriver);
router.put('/:id/approve', approveDriver);
router.put('/:driverId/approval', toggleDriverApproval);


module.exports = router;