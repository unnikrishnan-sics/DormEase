const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['IN', 'OUT'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    isAuthorized: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['Present', 'Late Entry', 'Late Check-out', 'Unauthorized'],
        default: 'Present'
    }
}, { timestamps: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
