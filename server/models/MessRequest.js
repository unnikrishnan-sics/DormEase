const mongoose = require('mongoose');

const MessRequestSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true
    },
    date: {
        type: String, // Format: YYYY-MM-DD
        required: true
    },
    mealType: {
        type: String,
        enum: ['Breakfast', 'Lunch', 'Snacks', 'Dinner'],
        required: true
    },
    item: {
        type: String, // e.g., 'extraEgg', 'extraChicken'
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Ready', 'Collected', 'Cancelled'],
        default: 'Pending'
    },
    paymentStatus: {
        type: String,
        enum: ['Unpaid', 'Paid'],
        default: 'Unpaid'
    },
    paymentMethod: {
        type: String,
        enum: ['Card', 'Cash', 'UPI'],
        default: 'Card'
    },
    stripeSessionId: String
}, { timestamps: true });

module.exports = mongoose.model('MessRequest', MessRequestSchema);
