const mongoose = require('mongoose');

const SettingsSchema = new mongoose.Schema({
    gateOpenTime: {
        type: String,
        default: '06:00' // 24hr format for logic, display can be 12hr
    },
    gateCloseTime: {
        type: String,
        default: '21:00'
    },
    lastStudentIdSeq: {
        type: Number,
        default: 100 
    },
    messPrices: {
        extraEgg: { type: Number, default: 10 },
        extraChicken: { type: Number, default: 50 },
        guestMeal: { type: Number, default: 80 }
    },
    messItems: [{
        name: { type: String, required: true },
        price: { type: Number, required: true },
        available: { type: Boolean, default: true }
    }],
    extrasDailyLimit: {
        type: Number,
        default: 9
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', SettingsSchema);
