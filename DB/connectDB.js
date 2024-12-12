const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGODB_URI; // Ensure this matches your environment variable name
    if (!uri) {
        throw new Error('MongoDB URI is not defined');
    }
    try {
        await mongoose.connect(uri);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;
