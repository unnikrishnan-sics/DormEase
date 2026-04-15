const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    emergencyContact: String,
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
    documents: [String], // URLs to documents
    packageType: {
        type: String,
        enum: ['Monthly', '6 Months', '12 Months', '24 Months'],
        default: 'Monthly'
    },
    subscriptionEndDate: Date
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
