const express = require('express');
const {
  getRides,
  getRide,
  createRide,
  updateRide,
  deleteRide,
  bookRide,
  completeRide,
} = require('../controllers/rideController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getRides);
router.get('/:id', getRide);
router.post('/', createRide);
router.put('/:id', updateRide);
router.delete('/:id', deleteRide);
router.post('/:rideId/book/:userId', bookRide);

router.put('/:id/complete', completeRide);

module.exports = router;