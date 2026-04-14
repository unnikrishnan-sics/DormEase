const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        enum: ['Room', 'Food', 'Electricity', 'Plumbing', 'Cleaning', 'Other'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['Logged', 'In Progress', 'Resolved', 'Closed'],
        default: 'Logged'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    aiAnalysis: {
        sentiment: String,
        suggestedResponse: String,
        summary: String
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User' // Staff member
    },
    resolutionDetails: String
}, { timestamps: true });

module.exports = mongoose.model('Complaint', ComplaintSchema);
