const express = require('express');
const router = express.Router();
const { submitComplaint, getComplaints, updateComplaintStatus } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect, getComplaints)
    .post(protect, submitComplaint);

router.put('/:id', protect, authorize('Admin', 'Staff'), updateComplaintStatus);

module.exports = router;
