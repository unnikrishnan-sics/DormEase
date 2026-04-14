const Booking = require('../models/Booking');
const Room = require('../models/Room');
const Student = require('../models/Student');

// @desc    Create a new booking/allocation
// @route   POST /api/bookings
// @access  Private/Admin
exports.createBooking = async (req, res) => {
    try {
        const { studentId, roomId, startDate, endDate, totalAmount } = req.body;

        // Check room availability
        const room = await Room.findById(roomId);
        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.currentOccupancy >= room.totalCapacity) {
            return res.status(400).json({ message: 'Room is at full capacity' });
        }

        // Create booking
        const booking = await Booking.create({
            studentId,
            roomId,
            startDate,
            endDate,
            totalAmount,
            status: 'Confirmed'
        });

        // Update room occupancy
        room.currentOccupancy += 1;
        if (room.currentOccupancy === room.totalCapacity) {
            room.status = 'Full';
        }
        await room.save();

        // Update student record
        const student = await Student.findOne({ userId: studentId });
        if (student) {
            student.currentRoomId = roomId;
            student.bookingStatus = 'Allocated';
            await student.save();
        }

        res.status(201).json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin/Staff
exports.getBookings = async (req, res) => {
    try {
        const bookings = await Booking.find().populate('studentId', 'name email').populate('roomId', 'roomNumber');
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private/Admin
exports.cancelBooking = async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        if (booking.status === 'Cancelled') {
            return res.status(400).json({ message: 'Booking is already cancelled' });
        }

        booking.status = 'Cancelled';
        await booking.save();

        // Update room occupancy
        const room = await Room.findById(booking.roomId);
        if (room) {
            room.currentOccupancy -= 1;
            if (room.currentOccupancy < room.totalCapacity) {
                room.status = 'Available';
            }
            await room.save();
        }

        // Update student record
        const student = await Student.findOne({ userId: booking.studentId });
        if (student) {
            student.bookingStatus = 'Pending';
            student.currentRoomId = null;
            await student.save();
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
