const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    emergencyContact: {
        name: String,
        phone: String,
        relation: String
    },
    parentGuardianName: String,
    permanentAddress: String,
    currentRoomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room'
    },
    bookingStatus: {
        type: String,
        enum: ['Pending', 'Allocated', 'Vacated'],
        default: 'Pending'
    },
    documents: [String] // URLs to documents
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
