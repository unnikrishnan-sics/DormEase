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
    idProof: {
        type: String, // URL/Path to Aadhaar or other ID
    },
    packageType: {
        type: String,
        enum: ['Monthly', '6 Months', '12 Months', '24 Months'],
        default: 'Monthly'
    },
    subscriptionEndDate: Date,
    studentId: {
        type: String,
        unique: true
    },
    lastStatus: {
        type: String,
        enum: ['IN', 'OUT'],
        default: 'IN'
    },
    allergies: [String],
    dietaryPreference: {
        type: String,
        enum: ['Veg', 'Non-Veg', 'Vegan'],
        default: 'Non-Veg'
    },
    preferredPaymentMethod: {
        type: String,
        enum: ['UPI', 'Bank Transfer', 'Cash', 'Card'],
        default: 'Card'
    }
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
