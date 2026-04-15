const express = require('express');
const router = express.Router();
const { getStudents, addStudent, updateStudent, deleteStudent, getMySummary, updateMyProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.get('/me/summary', protect, getMySummary);
router.put('/me', protect, updateMyProfile);

router.route('/')
    .get(protect, authorize('Admin', 'Staff'), getStudents)
    .post(protect, authorize('Admin'), addStudent);

router.route('/:id')
    .put(protect, updateStudent)
    .delete(protect, authorize('Admin'), deleteStudent);

module.exports = router;
