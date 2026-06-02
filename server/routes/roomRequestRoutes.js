const express = require('express');
const router = express.Router();
const { 
    createRoomRequest, 
    getAllRoomRequests, 
    getMyRoomRequests, 
    updateRoomRequestStatus 
} = require('../controllers/roomRequestController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .post(protect, createRoomRequest)
    .get(protect, authorize('Admin'), getAllRoomRequests);

router.get('/my', protect, getMyRoomRequests);

router.put('/:id', protect, authorize('Admin'), updateRoomRequestStatus);

module.exports = router;
