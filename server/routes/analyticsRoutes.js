const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('Admin', 'Staff'), getDashboardStats);

module.exports = router;
