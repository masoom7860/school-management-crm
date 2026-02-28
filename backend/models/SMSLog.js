const mongoose = require('mongoose');

const SMSLogSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  templateId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Sent', 'Failed', 'Pending'],
    default: 'Pending'
  },
  messageId: String,
  error: String,
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  attendanceDate: {
    type: Date,
    required: true
  },
  apiResponse: mongoose.Schema.Types.Mixed,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SMSLog', SMSLogSchema);