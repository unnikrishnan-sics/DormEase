const mongoose = require('mongoose');

const FineSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    type: {
        type: String,
        enum: ['Late Payment', 'Damages', 'Rule Violation', 'Other'],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Unpaid', 'Paid'],
        default: 'Unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'Bank Transfer', 'Cash', 'Card'],
        default: 'Card'
    },
    issuedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    issuedAt: {
        type: Date,
        default: Date.now
    },
    paidAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Fine', FineSchema);
