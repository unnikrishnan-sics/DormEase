const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, changePassword, getAllStaff, deleteUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.put('/change-password', protect, changePassword);

// Admin only
router.get('/staff', protect, authorize('Admin'), getAllStaff);
router.delete('/users/:id', protect, authorize('Admin'), deleteUser);

module.exports = router;
