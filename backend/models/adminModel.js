const mongoose = require('mongoose');

const AdminSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },  // Make phone optional
    password: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Admin', AdminSchema);
