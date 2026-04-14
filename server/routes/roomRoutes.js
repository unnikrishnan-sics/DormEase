const express = require('express');
const router = express.Router();
const { getRooms, addRoom, updateRoom, deleteRoom } = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
    .get(protect, getRooms)
    .post(protect, authorize('Admin'), addRoom);

router.route('/:id')
    .put(protect, authorize('Admin'), updateRoom)
    .delete(protect, authorize('Admin'), deleteRoom);

module.exports = router;
