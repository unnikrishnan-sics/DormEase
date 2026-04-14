const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    roomId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Room',
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: Date,
    status: {
        type: String,
        enum: ['Confirmed', 'Cancelled', 'Completed', 'Pending'],
        default: 'Pending'
    },
    totalAmount: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
