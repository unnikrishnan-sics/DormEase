const Room = require('../models/Room');

// @desc    Get all rooms
// @route   GET /api/rooms
// @access  Private
exports.getRooms = async (req, res) => {
    try {
        const rooms = await Room.find();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new room
// @route   POST /api/rooms
// @access  Private/Admin
exports.addRoom = async (req, res) => {
    try {
        const { roomNumber, totalCapacity, pricePerMonth, facilities, floor } = req.body;

        const roomExists = await Room.findOne({ roomNumber });

        if (roomExists) {
            return res.status(400).json({ message: 'Room already exists' });
        }

        const room = await Room.create({
            roomNumber,
            totalCapacity,
            pricePerMonth,
            facilities,
            floor
        });

        res.status(201).json(room);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update room details
// @route   PUT /api/rooms/:id
// @access  Private/Admin
exports.updateRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (room) {
            room.roomNumber = req.body.roomNumber || room.roomNumber;
            room.totalCapacity = req.body.totalCapacity || room.totalCapacity;
            room.pricePerMonth = req.body.pricePerMonth || room.pricePerMonth;
            room.facilities = req.body.facilities || room.facilities;
            room.floor = req.body.floor || room.floor;
            room.status = req.body.status || room.status;

            const updatedRoom = await room.save();
            res.json(updatedRoom);
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a room
// @route   DELETE /api/rooms/:id
// @access  Private/Admin
exports.deleteRoom = async (req, res) => {
    try {
        const room = await Room.findById(req.params.id);

        if (room) {
            await room.deleteOne();
            res.json({ message: 'Room removed' });
        } else {
            res.status(404).json({ message: 'Room not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
