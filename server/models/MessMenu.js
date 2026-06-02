const mongoose = require('mongoose');

const MessMenuSchema = new mongoose.Schema({
    dayOfWeek: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        required: true,
        unique: true
    },
    breakfast: {
        items: [{
            name: String,
            allergens: [String],
            type: { type: String, enum: ['Veg', 'Non-Veg', 'Egg'], default: 'Veg' }
        }],
        time: String
    },
    lunch: {
        items: [{
            name: String,
            allergens: [String],
            type: { type: String, enum: ['Veg', 'Non-Veg', 'Egg'], default: 'Veg' }
        }],
        time: String
    },
    snacks: {
        items: [{
            name: String,
            allergens: [String],
            type: { type: String, enum: ['Veg', 'Non-Veg', 'Egg'], default: 'Veg' }
        }],
        time: String
    },
    dinner: {
        items: [{
            name: String,
            allergens: [String],
            type: { type: String, enum: ['Veg', 'Non-Veg', 'Egg'], default: 'Veg' }
        }],
        time: String
    },
    specialNote: String
}, { timestamps: true });

module.exports = mongoose.model('MessMenu', MessMenuSchema);
