const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

dotenv.config();

const seedUsers = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dormease');
        console.log('Connected to MongoDB for seeding...');

        // Clear existing users
        await User.deleteMany();
        console.log('Existing users cleared.');

        // Create Admin
        const admin = await User.create({
            name: 'System Admin',
            email: 'admin@gmail.com',
            password: 'admin@123',
            role: 'Admin'
        });
        console.log('Admin created: admin@gmail.com / admin@123');

        // Create Student
        const student = await User.create({
            name: 'John Student',
            email: 'student@example.com',
            password: 'password123',
            role: 'Student'
        });
        console.log('Student created: student@example.com / password123');

        mongoose.connection.close();
        console.log('Seeding completed successfully.');
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seedUsers();
