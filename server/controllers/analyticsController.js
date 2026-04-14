const Room = require('../models/Room');
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const Complaint = require('../models/Complaint');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
    try {
        // 1. Room Occupancy
        const rooms = await Room.find();
        const totalCapacity = rooms.reduce((sum, room) => sum + room.totalCapacity, 0);
        const currentOccupancy = rooms.reduce((sum, room) => sum + room.currentOccupancy, 0);

        // 2. Revenue (Last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const totalRevenue = await Payment.aggregate([
            { $match: { paymentStatus: 'Paid', paymentDate: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // 3. Complaint Trends
        const complaintStats = await Complaint.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 4. Pending Payments
        const pendingPaymentsCount = await Payment.countDocuments({ paymentStatus: 'Pending' });

        res.json({
            occupancy: {
                totalCapacity,
                currentOccupancy,
                percentage: (currentOccupancy / totalCapacity) * 100 || 0
            },
            revenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
            complaints: complaintStats,
            pendingPayments: pendingPaymentsCount,
            totalRooms: rooms.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
