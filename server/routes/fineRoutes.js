const express = require('express');
const router = express.Router();
const { 
    issueFine, 
    getFines, 
    getStudentFines, 
    updateFineStatus, 
    deleteFine,
    getMyFines,
    payFine,
    verifyFinePayment
} = require('../controllers/fineController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .post(protect, authorize('Admin', 'Staff'), issueFine)
    .get(protect, authorize('Admin', 'Staff'), getFines);

router.get('/me', protect, authorize('Student'), getMyFines);
router.get('/student/:id', protect, authorize('Admin', 'Staff'), getStudentFines);
router.post('/:id/pay', protect, authorize('Student'), payFine);
router.get('/verify/:sessionId', protect, verifyFinePayment);

router.route('/:id')
    .put(protect, authorize('Admin', 'Staff'), updateFineStatus)
    .delete(protect, authorize('Admin'), deleteFine);

module.exports = router;
