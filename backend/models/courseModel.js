const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: String,
  code: { type: String, unique: true },
  description: String,
  class: String,
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  duration: String,
  schedule: {
    days: [String], // e.g., ["Monday", "Wednesday"]
    time: String    // e.g., "10:00 AM - 11:00 AM"
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('Course', courseSchema);
