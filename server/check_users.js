const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/dormease')
    .then(async () => {
        const counts = await User.aggregate([
            { $group: { _id: '$role', count: { $sum: 1 } } }
        ]);
        console.log('User role counts:', JSON.stringify(counts));
        process.exit(0);
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
