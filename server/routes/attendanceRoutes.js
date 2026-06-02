const express = require('express');
const router = express.Router();
const { 
    processScan, 
    getAttendanceHistory, 
    getAttendanceStats, 
    updateSettings,
    getSettings
} = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

router.post('/scan', protect, authorize('Admin', 'Staff'), processScan);
router.get('/history', protect, getAttendanceHistory);
router.get('/stats', protect, authorize('Admin', 'Staff'), getAttendanceStats);
router.get('/settings', protect, getSettings);
router.put('/settings', protect, authorize('Admin'), updateSettings);

module.exports = router;
