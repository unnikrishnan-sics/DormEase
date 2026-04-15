const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomNumber: {
        type: String,
        required: true,
        unique: true
    },
    totalCapacity: {
        type: Number,
        required: true
    },
    currentOccupancy: {
        type: Number,
        default: 0
    },
    pricePerMonth: {
        type: Number,
        required: true
    },
    facilities: [String],
    status: {
        type: String,
        enum: ['Available', 'Full', 'Maintenance'],
        default: 'Available'
    },
    floor: Number,
    price6Months: Number,
    price12Months: Number,
    price24Months: Number
}, { timestamps: true });

module.exports = mongoose.model('Room', RoomSchema);
