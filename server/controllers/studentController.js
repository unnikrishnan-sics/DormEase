const Student = require('../models/Student');
const User = require('../models/User');
const Room = require('../models/Room');
const Payment = require('../models/Payment');
const { sendCredentialsEmail } = require('../utils/emailService');
const crypto = require('crypto');

// @desc    Get all students
// @route   GET /api/students
// @access  Private/Admin/Staff
exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find().populate('userId', 'name email contactDetails').populate('currentRoomId', 'roomNumber');
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
        const { 
            name, email, phone, permanentAddress, emergencyContact, 
            parentGuardianName, currentRoomId, packageType 
        } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Check room capacity if a room is provided
        let room = null;
        if (currentRoomId) {
            room = await Room.findById(currentRoomId);
            if (!room) {
                return res.status(404).json({ message: 'Selected room not found' });
            }
            if (room.currentOccupancy >= room.totalCapacity) {
                return res.status(400).json({ message: 'Selected room is full' });
            }
        }

        // 2. Generate random password
        const tempPassword = crypto.randomBytes(6).toString('hex'); // 12 chars
        console.log(`[AUTH] Generated password for ${email}: ${tempPassword}`);

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
        let months = 1;
        if (packageType === '6 Months') months = 6;
        else if (packageType === '12 Months') months = 12;
        else if (packageType === '24 Months') months = 24;

        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + months);

        const student = await Student.create({
            userId: user._id,
            emergencyContact,
            parentGuardianName,
            permanentAddress,
            currentRoomId,
            packageType: packageType || 'Monthly',
            subscriptionEndDate: currentRoomId ? endDate : null,
            bookingStatus: currentRoomId ? 'Allocated' : 'Pending'
        });

        // 4.5. Update Room Occupancy
        if (room) {
            room.currentOccupancy += 1;
            if (room.currentOccupancy >= room.totalCapacity) {
                room.status = 'Full';
            }
            await room.save();

            // 4.6. Create Initial Invoice (Move-in Rent / Package)
            let finalAmount = room.pricePerMonth;
            if (packageType === '6 Months') finalAmount = room.price6Months || (room.pricePerMonth * 6);
            else if (packageType === '12 Months') finalAmount = room.price12Months || (room.pricePerMonth * 12);
            else if (packageType === '24 Months') finalAmount = room.price24Months || (room.pricePerMonth * 24);

            await Payment.create({
                userId: user._id,
                amount: finalAmount,
                paymentStatus: 'Pending',
                paymentMethod: 'Card' 
            });
        }

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

            const oldRoomId = student.currentRoomId?.toString();
            const newRoomId = req.body.currentRoomId;

            // Handle Room Transfer if room changed
            if (newRoomId && newRoomId !== oldRoomId) {
                // 1. Check if new room exists and has capacity
                const newRoom = await Room.findById(newRoomId);
                if (!newRoom) {
                    return res.status(404).json({ message: 'Selected new room not found' });
                }
                if (newRoom.currentOccupancy >= newRoom.totalCapacity) {
                    return res.status(400).json({ message: 'Selected new room is full' });
                }

                // 2. Decrement old room occupancy
                if (oldRoomId) {
                    const oldRoom = await Room.findById(oldRoomId);
                    if (oldRoom) {
                        oldRoom.currentOccupancy = Math.max(0, oldRoom.currentOccupancy - 1);
                        if (oldRoom.currentOccupancy < oldRoom.totalCapacity && oldRoom.status === 'Full') {
                            oldRoom.status = 'Available';
                        }
                        await oldRoom.save();
                    }
                }

                // 3. Increment new room occupancy
                newRoom.currentOccupancy += 1;
                if (newRoom.currentOccupancy >= newRoom.totalCapacity) {
                    newRoom.status = 'Full';
                }
                await newRoom.save();
                
                student.currentRoomId = newRoomId;
                student.bookingStatus = 'Allocated';
            } else if (newRoomId === '' && oldRoomId) {
                // If moving from a room to unassigned (waitlist)
                const oldRoom = await Room.findById(oldRoomId);
                if (oldRoom) {
                    oldRoom.currentOccupancy = Math.max(0, oldRoom.currentOccupancy - 1);
                    if (oldRoom.currentOccupancy < oldRoom.totalCapacity && oldRoom.status === 'Full') {
                        oldRoom.status = 'Available';
                    }
                    await oldRoom.save();
                }
                student.currentRoomId = null;
                student.bookingStatus = 'Pending';
            }

            student.emergencyContact = req.body.emergencyContact || student.emergencyContact;
            student.parentGuardianName = req.body.parentGuardianName || student.parentGuardianName;
            student.permanentAddress = req.body.permanentAddress || student.permanentAddress;
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
            if (student.currentRoomId) {
                const room = await Room.findById(student.currentRoomId);
                if (room) {
                    room.currentOccupancy = Math.max(0, room.currentOccupancy - 1);
                    if (room.currentOccupancy < room.totalCapacity && room.status === 'Full') {
                        room.status = 'Available';
                    }
                    await room.save();
                }
            }

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

// @desc    Get current student's dashboard summary
// @route   GET /api/students/me/summary
// @access  Private/Student
exports.getMySummary = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id })
            .populate('currentRoomId')
            .populate('userId', 'name email contactDetails');
        
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        // 1. Get Roommates
        let roommates = [];
        if (student.currentRoomId) {
            roommates = await Student.find({ 
                currentRoomId: student.currentRoomId._id,
                userId: { $ne: req.user._id } 
            }).populate('userId', 'name');
        }

        // 2. Get Payments / Dues
        const Payment = require('../models/Payment');
        const payments = await Payment.find({ userId: req.user._id });
        const pendingAmount = payments
            .filter(p => p.paymentStatus === 'Pending')
            .reduce((sum, p) => sum + p.amount, 0);

        // 3. Get Recent Complaint
        const Complaint = require('../models/Complaint');
        const latestComplaint = await Complaint.findOne({ userId: req.user._id })
            .sort({ createdAt: -1 });

        // 4. Get Today's Mess Menu
        const MessMenu = require('../models/MessMenu');
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = days[new Date().getDay()];
        const menu = await MessMenu.findOne({ dayOfWeek: today });

        res.json({
            profile: student,
            room: student.currentRoomId,
            roommates: roommates.map(r => r.userId.name),
            financials: {
                pendingAmount,
                lastPayment: payments.sort((a,b) => b.updatedAt - a.updatedAt)[0] || null
            },
            latestComplaint,
            todayMenu: menu
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get occupants for a specific room
// @route   GET /api/rooms/:id/occupants
// @access  Private/Admin/Staff
exports.getRoomOccupants = async (req, res) => {
    try {
        const students = await Student.find({ currentRoomId: req.params.id })
            .populate('userId', 'name email contactDetails');
        
        const occupants = students.map(s => ({
            _id: s._id,
            name: s.userId.name,
            email: s.userId.email,
            phone: s.userId.contactDetails?.phone
        }));

        res.json(occupants);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update current student's profile info
// @route   PUT /api/students/me
// @access  Private/Student
exports.updateMyProfile = async (req, res) => {
    try {
        const student = await Student.findOne({ userId: req.user._id });
        
        if (!student) {
            return res.status(404).json({ message: 'Student profile not found' });
        }

        const { phone, emergencyContact, permanentAddress, parentGuardianName } = req.body;

        // Update Student model fields
        student.emergencyContact = emergencyContact || student.emergencyContact;
        student.permanentAddress = permanentAddress || student.permanentAddress;
        student.parentGuardianName = parentGuardianName || student.parentGuardianName;

        // Update User model contact details (phone)
        if (phone) {
            const user = await User.findById(req.user._id);
            if (user) {
                user.contactDetails = { ...user.contactDetails, phone };
                await user.save();
            }
        }

        await student.save();
        res.json({ message: 'Profile updated successfully', student });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
