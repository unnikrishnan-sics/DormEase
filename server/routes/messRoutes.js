const express = require('express');
const router = express.Router();
const { 
    getMessMenu, updateMessMenu, suggestMenu,
    requestExtra, getMessRequests, updateRequestStatus, getMyRequests
} = require('../controllers/messController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getMessMenu);
router.post('/request', protect, authorize('Student'), requestExtra);
router.get('/requests', protect, authorize('Admin', 'Staff'), getMessRequests);
router.get('/requests/my', protect, getMyRequests);
router.put('/requests/:id', protect, authorize('Admin', 'Staff'), updateRequestStatus);
router.put('/:day', protect, authorize('Admin', 'Staff'), updateMessMenu);
router.post('/suggest', protect, authorize('Admin', 'Staff'), suggestMenu);

module.exports = router;
