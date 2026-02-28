const mongoose = require("mongoose");

// Schema for storing Open Days data specific to a Class and Section
const termOpenDaySchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true
  },
  className: { 
    type: String, 
    required: true,
    trim: true 
  },
  section: { 
    type: String, 
    required: true,
    trim: true 
  },
  // Open Days fields - no duplication across subjects
  term1OpenDays: { type: Number, default: 0 },
  term2OpenDays: { type: Number, default: 0 },
  term3OpenDays: { type: Number, default: 0 },
}, { timestamps: true });

// Ensures that only one document exists per combination of School, Class and Section
termOpenDaySchema.index({ schoolId: 1, className: 1, section: 1 }, { unique: true, partialFilterExpression: { schoolId: { $exists: true } } });

module.exports = mongoose.model("TermOpenDay", termOpenDaySchema);