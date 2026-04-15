const express = require('express');
const router = express.Router();
const { 
    getRooms, 
    addRoom, 
    updateRoom, 
    deleteRoom 
} = require('../controllers/roomController');
const { getRoomOccupants } = require('../controllers/studentController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect, getRooms)
    .post(protect, authorize('Admin'), addRoom);

router.get('/:id/occupants', protect, authorize('Admin', 'Staff'), getRoomOccupants);

router.route('/:id')
    .put(protect, authorize('Admin'), updateRoom)
    .delete(protect, authorize('Admin'), deleteRoom);

module.exports = router;
