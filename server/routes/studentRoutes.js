const express = require('express');
const router = express.Router();
const { getStudents, addStudent, updateStudent, deleteStudent, getMySummary, updateMyProfile } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/fileUpload');

router.get('/me/summary', protect, getMySummary);
router.put('/me', protect, updateMyProfile);

router.route('/')
    .get(protect, authorize('Admin', 'Staff'), getStudents)
    .post(protect, authorize('Admin', 'Staff'), upload.single('idProof'), addStudent);

router.route('/:id')
    .put(protect, authorize('Admin', 'Staff'), updateStudent)
    .delete(protect, authorize('Admin', 'Staff'), deleteStudent);

module.exports = router;
