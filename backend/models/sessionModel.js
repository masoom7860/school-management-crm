const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true
  },
  yearRange: {
    type: String,
    required: true,
    trim: true,
    // unique per school via compound index below
  },
  isActive: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 200
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  }
}, {
  timestamps: true
});

// Compound index for school and year range
sessionSchema.index({ schoolId: 1, yearRange: 1 }, { unique: true });

// Index for active sessions
sessionSchema.index({ schoolId: 1, isActive: 1 });

module.exports = mongoose.model('Session', sessionSchema); 