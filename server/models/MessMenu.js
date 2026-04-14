const mongoose = require('mongoose');

const MessMenuSchema = new mongoose.Schema({
    dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
        unique: true
    },
    breakfast: {
        items: [String],
        time: String
    },
    lunch: {
        items: [String],
        time: String
    },
    snacks: {
        items: [String],
        time: String
    },
    dinner: {
        items: [String],
        time: String
    },
    specialNote: String
}, { timestamps: true });

module.exports = mongoose.model('MessMenu', MessMenuSchema);
