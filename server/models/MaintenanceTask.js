const mongoose = require('mongoose');

const MaintenanceTaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        enum: ['Cleaning', 'Repair', 'Electrical', 'Plumbing', 'Furniture', 'Other'],
        default: 'Cleaning'
    },
    location: {
        type: String,
        required: true, // e.g., "Room 101", "Main Lobby"
        trim: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Staff member
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High', 'Urgent'],
        default: 'Medium'
    },
    status: {
        type: String,
        enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
        default: 'Pending'
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    frequency: {
        type: String,
        enum: ['None', 'Daily', 'Weekly', 'Monthly'],
        default: 'None'
    }
}, { timestamps: true });

module.exports = mongoose.model('MaintenanceTask', MaintenanceTaskSchema);
