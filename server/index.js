const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');

const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dormease')
    .then(async () => {
        console.log('MongoDB connected successfully');
        
        // Auto-seed Admin if not exists
        try {
            const adminExists = await User.findOne({ role: 'Admin' });
            if (!adminExists) {
                console.log('No Admin found, auto-seeding default admin...');
                await User.create({
                    name: 'System Admin',
                    email: 'admin@gmail.com',
                    password: 'admin@123',
                    role: 'Admin',
                    isFirstLogin: false
                });
                console.log('✅ Default Admin created: admin@gmail.com / admin@123');
            }
        } catch (err) {
            console.error('Auto-seeding error:', err);
        }
    })
    .catch((err) => console.error('MongoDB connection error:', err));


// Basic Route
app.get('/', (req, res) => {
    res.send('DormEase API is running...');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const studentRoutes = require('./routes/studentRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const messRoutes = require('./routes/messRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const roomRequestRoutes = require('./routes/roomRequestRoutes');
const fineRoutes = require('./routes/fineRoutes');

// Use Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/room-requests', roomRequestRoutes);
app.use('/api/fines', fineRoutes);



// -----------------------------------------------------------------------------
// Startup Hooks (Migrations)
// -----------------------------------------------------------------------------
const Student = require('./models/Student');
const Settings = require('./models/Settings');

const initializeStudentIds = async () => {
    try {
        const studentsWithoutId = await Student.find({ $or: [{ studentId: { $exists: false } }, { studentId: null }] });
        if (studentsWithoutId.length > 0) {
            console.log(`[STARTUP] Found ${studentsWithoutId.length} students without IDs. Generating...`);
            let settings = await Settings.findOne();
            if (!settings) settings = await Settings.create({});

            for (const student of studentsWithoutId) {
                const nextId = settings.lastStudentIdSeq + 1;
                student.studentId = `DES${nextId}`;
                settings.lastStudentIdSeq = nextId;
                await student.save();
            }
            await settings.save();
            console.log(`[STARTUP] Successfully generated IDs for legacy records.`);
        }
    } catch (err) {
        console.error('[STARTUP] Error initializing IDs:', err);
    }
};

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    initializeStudentIds();
});
