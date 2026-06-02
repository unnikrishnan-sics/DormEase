const mongoose = require('mongoose');

const RoomRequestSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    currentRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    requestedRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Pending'
    },
    adminComment: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model('RoomRequest', RoomRequestSchema);
