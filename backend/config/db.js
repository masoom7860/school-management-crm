const mongoose = require('mongoose');

const connectDB = async () => {
    const uri = process.env.MONGO_URI || process.env.MONGO_SRV_URI;
    const dbName = process.env.MONGO_DB_NAME;

    if (!uri) {
        console.error("❌ MONGO_URI not set. Please create backend/.env and define MONGO_URI or MONGO_SRV_URI.");
        process.exit(1);
    }

    try {
        console.log(`Attempting MongoDB connection (db: ${dbName || '(default)'}; mongoose v${mongoose.version})`);
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 20000,
            socketTimeoutMS: 45000,
            dbName: dbName || undefined,
        });
        console.log("🚀 MongoDB Connected Successfully ✅");
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error?.message || error);
        process.exit(1);
    }

    mongoose.connection.on('error', (err) => {
        console.error('MongoDB connection error:', err?.message || err);
    });
    mongoose.connection.on('disconnected', () => {
        console.warn('MongoDB disconnected.');
    });
};

module.exports = connectDB;
