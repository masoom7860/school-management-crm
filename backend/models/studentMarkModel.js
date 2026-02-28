const mongoose = require("mongoose");

// Schema for storing the actual marks obtained by a student
const studentMarkSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    index: true
  },
  studentId: {
    type: String,
    required: true,
    trim: true,
  },
  className: {
    type: String,
    required: true,
    trim: true,
  },
  section: {
    type: String,
    required: true,
    trim: true,
  },
  subject: {
    type: String,
    required: true,
    trim: true,
  },
  // We store marks and the daysPresent once per student-subject combination
  marks: {
    Term1: {
      i: { type: Number, default: 0, min: 0 },
      ii: { type: Number, default: 0, min: 0 },
      iii: { type: Number, default: 0, min: 0 },
      iv: { type: Number, default: 0, min: 0 },
      v: { type: Number, default: 0, min: 0 },
      daysPresent: { type: Number, default: 0, min: 0 }
    },
    Term2: {
      i: { type: Number, default: 0, min: 0 },
      ii: { type: Number, default: 0, min: 0 },
      iii: { type: Number, default: 0, min: 0 },
      iv: { type: Number, default: 0, min: 0 },
      v: { type: Number, default: 0, min: 0 },
      daysPresent: { type: Number, default: 0, min: 0 }
    },
    Term3: {
      i: { type: Number, default: 0, min: 0 },
      ii: { type: Number, default: 0, min: 0 },
      iii: { type: Number, default: 0, min: 0 },
      iv: { type: Number, default: 0, min: 0 },
      v: { type: Number, default: 0, min: 0 },
      daysPresent: { type: Number, default: 0, min: 0 }
    },
    // daysPresent should only be relevant once per student, but is stored here for retrieval simplicity
    daysPresent: { type: Number, default: 0, min: 0 } 
  }
}, { timestamps: true });

// Ensures only one document per student, class, section, and subject
studentMarkSchema.index({ studentId: 1, className: 1, section: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model("StudentMark", studentMarkSchema);