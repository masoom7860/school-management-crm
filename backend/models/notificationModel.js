
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  targetRoles: [{
    type: String, // e.g., 'admin', 'teacher', 'student', 'parent'
  }],
  targetUserIds: [{
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'targetRoles', // optional: dynamic ref based on role
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin', // or other role
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isReadBy: [{
    userId: mongoose.Schema.Types.ObjectId,
    role: String,
    readAt: Date,
  }],
});

module.exports = mongoose.model('Notification', notificationSchema);
