const express = require('express');
const router = express.Router();
const { createBooking, getBookings, cancelBooking } = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect, authorize('Admin', 'Staff'), getBookings)
    .post(protect, authorize('Admin'), createBooking);

router.put('/:id/cancel', protect, authorize('Admin'), cancelBooking);

module.exports = router;
