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

        // 2. Revenue Trends (Last 6 months)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1); // Start of month

        const revenueTrends = await Payment.aggregate([
            { 
                $match: { 
                    paymentStatus: 'Paid', 
                    paymentDate: { $gte: sixMonthsAgo } 
                } 
            },
            {
                $group: {
                    _id: { 
                        month: { $month: "$paymentDate" }, 
                        year: { $year: "$paymentDate" } 
                    },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } }
        ]);

        // 3. Overall Revenue (Last 30 days - for card)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentRevenue = await Payment.aggregate([
            { $match: { paymentStatus: 'Paid', paymentDate: { $gte: thirtyDaysAgo } } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);

        // 4. Complaint Trends
        const complaintStats = await Complaint.aggregate([
            { $group: { _id: '$status', count: { $sum: 1 } } }
        ]);

        // 5. Total Students Count
        const Student = require('../models/Student');
        const totalStudents = await Student.countDocuments();

        // 6. Pending Payments
        const pendingPaymentsCount = await Payment.countDocuments({ paymentStatus: 'Pending' });

        res.json({
            occupancy: {
                totalCapacity,
                currentOccupancy,
                percentage: (currentOccupancy / totalCapacity) * 100 || 0,
                available: totalCapacity - currentOccupancy
            },
            revenue: {
                recent: recentRevenue.length > 0 ? recentRevenue[0].total : 0,
                trends: revenueTrends
            },
            complaints: {
                total: complaintStats.reduce((sum, s) => sum + s.count, 0),
                active: complaintStats.filter(s => s._id !== 'Resolved' && s._id !== 'Closed').reduce((sum, s) => sum + s.count, 0),
                breakdown: complaintStats
            },
            totalStudents,
            pendingPayments: pendingPaymentsCount,
            totalRooms: rooms.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
