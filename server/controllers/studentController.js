const Student = require('../models/Student');
const User = require('../models/User');
const { sendCredentialsEmail } = require('../utils/emailService');
const crypto = require('crypto');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin/Staff
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('userId', 'name email').populate('currentRoomId', 'roomNumber');
        res.json(students);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new student (Admin only - creates User + Student + Sends Email)
// @route   POST /api/students
// @access  Private/Admin
exports.addStudent = async (req, res) => {
    try {
        const { name, email, phone, permanentAddress, emergencyContact, parentGuardianName, currentRoomId } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // 2. Generate random password
        const tempPassword = crypto.randomBytes(6).toString('hex'); // 12 chars

        // 3. Create User account
        const user = await User.create({
            name,
            email,
            password: tempPassword, // Will be hashed by User model pre-save hook
            role: 'Student',
            contactDetails: { phone, address: permanentAddress },
            isFirstLogin: true
        });

        // 4. Create Student profile
        const student = await Student.create({
            userId: user._id,
            emergencyContact,
            parentGuardianName,
            permanentAddress,
            currentRoomId
        });

        // 5. Send Email with Credentials
        const emailSent = await sendCredentialsEmail(email, name, tempPassword);

        res.status(201).json({
            message: 'Student created successfully',
            student,
            emailStatus: emailSent ? 'Sent' : 'Failed to send'
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Private
exports.updateStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            // Check if user is the student or admin
            if (req.user.role !== 'Admin' && student.userId.toString() !== req.user._id.toString()) {
                return res.status(401).json({ message: 'Not authorized' });
            }

            student.emergencyContact = req.body.emergencyContact || student.emergencyContact;
            student.parentGuardianName = req.body.parentGuardianName || student.parentGuardianName;
            student.permanentAddress = req.body.permanentAddress || student.permanentAddress;
            student.currentRoomId = req.body.currentRoomId || student.currentRoomId;
            student.bookingStatus = req.body.bookingStatus || student.bookingStatus;

            const updatedStudent = await student.save();
            res.json(updatedStudent);
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete student
// @route   DELETE /api/students/:id
// @access  Private/Admin
exports.deleteStudent = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);

        if (student) {
            // Also delete associated User
            await User.findByIdAndDelete(student.userId);
            await student.deleteOne();
            res.json({ message: 'Student and associated user account removed' });
        } else {
            res.status(404).json({ message: 'Student not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
