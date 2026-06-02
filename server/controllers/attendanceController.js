const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Settings = require('../models/Settings');
const Room = require('../models/Room');

// @desc    Process QR Code Scan (Toggle IN/OUT)
// @route   POST /api/attendance/scan
// @access  Private (Admin/Staff)
exports.processScan = async (req, res) => {
    try {
        const { studentIdString } = req.body; // The text from QR (e.g., "DES101")

        // 1. Find Student
        const student = await Student.findOne({ studentId: studentIdString })
            .populate('userId', 'name')
            .populate('currentRoomId', 'roomNumber');
        
        if (!student) {
            return res.status(404).json({ message: 'Student not found with this ID' });
        }

        // 1.1 Rate Limit Check (2 Minutes)
        const lastLog = await Attendance.findOne({ studentId: student._id }).sort({ timestamp: -1 });
        if (lastLog) {
            const minutesSinceLastScan = (new Date() - new Date(lastLog.timestamp)) / (1000 * 60);
            if (minutesSinceLastScan < 2) {
                return res.status(429).json({ 
                    message: `Rate limit: Please wait ${Math.ceil(2 - minutesSinceLastScan)} min before scanning again.` 
                });
            }
        }

        // 2. Determine Log Type (Toggle)
        const newType = student.lastStatus === 'IN' ? 'OUT' : 'IN';
        
        // 3. Check Gate Timings
        let settings = await Settings.findOne();
        if (!settings) {
            settings = await Settings.create({});
        }

        const now = new Date();
        const currentTimeString = now.toTimeString().slice(0, 5); // "HH:MM"
        
        let isAuthorized = true;
        let status = 'Present';

        if (currentTimeString < settings.gateOpenTime || currentTimeString > settings.gateCloseTime) {
            isAuthorized = false;
            status = 'Late Entry'; // As requested: "Late Entry/Checkin"
            if (newType === 'OUT') status = 'Late Check-out';
        }

        // 4. Create Attendance Log
        const attendance = await Attendance.create({
            studentId: student._id,
            userId: student.userId._id,
            type: newType,
            timestamp: now,
            isAuthorized,
            status
        });

        // 5. Update Student's Last Status
        student.lastStatus = newType;
        await student.save();

        res.json({
            message: `Check-${newType.toLowerCase()} successful`,
            student: {
                name: student.userId.name,
                studentId: student.studentId,
                roomNumber: student.currentRoomId?.roomNumber || 'Unassigned',
                newStatus: newType
            },
            log: attendance
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get attendance history (Filtered)
// @route   GET /api/attendance
// @access  Private (Admin/Staff/Student)
exports.getAttendanceHistory = async (req, res) => {
    try {
        let query = {};

        // If student, only show their own
        if (req.user.role === 'Student') {
            const student = await Student.findOne({ userId: req.user._id });
            if (!student) return res.status(404).json({ message: 'Student profile not found' });
            query.studentId = student._id;
        }

        // If admin/staff, support filtering by studentId or date
        if (req.user.role !== 'Student' && req.query.studentId) {
            query.studentId = req.query.studentId;
        }

        if (req.query.status) {
            query.status = req.query.status;
        }

        if (req.query.type) {
            query.type = req.query.type;
        }

        const history = await Attendance.find(query)
            .populate({
                path: 'studentId',
                populate: { path: 'userId', select: 'name' }
            })
            .populate({
                path: 'studentId',
                populate: { path: 'currentRoomId', select: 'roomNumber' }
            })
            .sort({ timestamp: -1 });

        res.json(history);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/attendance/stats
// @access  Private (Admin/Staff)
exports.getAttendanceStats = async (req, res) => {
    try {
        const last5Authorized = await Attendance.find({ isAuthorized: true })
            .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
            .sort({ timestamp: -1 })
            .limit(5);

        const last5Unauthorized = await Attendance.find({ isAuthorized: false })
            .populate({ path: 'studentId', populate: { path: 'userId', select: 'name' } })
            .sort({ timestamp: -1 })
            .limit(5);

        res.json({
            authorized: last5Authorized,
            unauthorized: last5Unauthorized
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Gate Settings
// @route   PUT /api/attendance/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = new Settings();

        settings.gateOpenTime = req.body.gateOpenTime || settings.gateOpenTime;
        settings.gateCloseTime = req.body.gateCloseTime || settings.gateCloseTime;
        
        if (req.body.extraEggPrice !== undefined) settings.messPrices.extraEgg = req.body.extraEggPrice;
        if (req.body.extraChickenPrice !== undefined) settings.messPrices.extraChicken = req.body.extraChickenPrice;
        if (req.body.extrasDailyLimit !== undefined) settings.extrasDailyLimit = req.body.extrasDailyLimit;
        
        if (req.body.messItems !== undefined) {
            settings.messItems = req.body.messItems;
        }
        
        await settings.save();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get Gate Settings
// @route   GET /api/attendance/settings
// @access  Private
exports.getSettings = async (req, res) => {
    try {
        let settings = await Settings.findOne();
        if (!settings) settings = await Settings.create({});
        res.json(settings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
