const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    paymentDate: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['UPI', 'Bank Transfer', 'Cash', 'Card'],
        default: 'Card'
    },
    paymentStatus: {
        type: String,
        enum: ['Paid', 'Pending', 'Failed'],
        default: 'Pending'
    },
    stripeSessionId: String,
    invoiceUrl: String,
    packageType: {
        type: String,
        enum: ['Monthly', '6 Months', '12 Months', '24 Months'],
        default: 'Monthly'
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
