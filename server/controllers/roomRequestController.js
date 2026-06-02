const RoomRequest = require('../models/RoomRequest');
const Student = require('../models/Student');
const Room = require('../models/Room');

// @desc    Create a room change request
// @route   POST /api/room-requests
// @access  Private (Student)
exports.createRoomRequest = async (req, res) => {
    try {
        const { requestedRoomId, reason } = req.body;

        // Find the student record associated with the user
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student record not found' });
        }

        if (!student.currentRoomId) {
            return res.status(400).json({ message: 'You must have an allocated room to request a change' });
        }

        // Check if target room exists and has capacity
        const targetRoom = await Room.findById(requestedRoomId);
        if (!targetRoom) {
            return res.status(404).json({ message: 'Requested room not found' });
        }

        if (targetRoom.currentOccupancy >= targetRoom.totalCapacity) {
            return res.status(400).json({ message: 'Requested room is already full' });
        }

        // Create the request
        const request = await RoomRequest.create({
            studentId: student._id,
            currentRoomId: student.currentRoomId,
            requestedRoomId,
            reason
        });

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all room change requests (for admin)
// @route   GET /api/room-requests
// @access  Private (Admin)
exports.getAllRoomRequests = async (req, res) => {
    try {
        const requests = await RoomRequest.find()
            .populate({
                path: 'studentId',
                populate: { path: 'userId', select: 'name email' }
            })
            .populate('currentRoomId', 'roomNumber')
            .populate('requestedRoomId', 'roomNumber')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get student's own requests
// @route   GET /api/room-requests/my
// @access  Private (Student)
exports.getMyRoomRequests = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        if (!student) {
            return res.status(404).json({ message: 'Student record not found' });
        }

        const requests = await RoomRequest.find({ studentId: student._id })
            .populate('currentRoomId', 'roomNumber')
            .populate('requestedRoomId', 'roomNumber')
            .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update request status (Approve/Reject)
// @route   PUT /api/room-requests/:id
// @access  Private (Admin)
exports.updateRoomRequestStatus = async (req, res) => {
    try {
        const { status, adminComment } = req.body;
        const request = await RoomRequest.findById(req.params.id);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'Pending') {
            return res.status(400).json({ message: 'Request already processed' });
        }

        if (status === 'Approved') {
            // Re-verify capacity
            const targetRoom = await Room.findById(request.requestedRoomId);
            if (targetRoom.currentOccupancy >= targetRoom.totalCapacity) {
                return res.status(400).json({ message: 'Requested room is now full' });
            }

            // 1. Update old room occupancy
            await Room.findByIdAndUpdate(request.currentRoomId, {
                $inc: { currentOccupancy: -1 },
                status: 'Available' // Ensure it's marked available if it was full
            });

            // 2. Update new room occupancy
            const updatedTargetRoom = await Room.findByIdAndUpdate(request.requestedRoomId, {
                $inc: { currentOccupancy: 1 }
            }, { new: true });

            if (updatedTargetRoom.currentOccupancy >= updatedTargetRoom.totalCapacity) {
                updatedTargetRoom.status = 'Full';
                await updatedTargetRoom.save();
            }

            // 3. Update student's room
            await Student.findByIdAndUpdate(request.studentId, {
                currentRoomId: request.requestedRoomId
            });
        }

        request.status = status;
        request.adminComment = adminComment;
        await request.save();

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
