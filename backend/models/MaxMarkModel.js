const mongoose = require("mongoose");

// Schema for storing Max Marks data specific to a Class, Section, AND Subject
const maxMarkSchema = new mongoose.Schema({
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
  subject: { 
    type: String, 
    required: true,
    trim: true 
  },
  Term1: {
    i: { type: Number, default: 0 },
    ii: { type: Number, default: 0 },
    iii: { type: Number, default: 0 },
    iv: { type: Number, default: 0 },
    v: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  Term2: {
    i: { type: Number, default: 0 },
    ii: { type: Number, default: 0 },
    iii: { type: Number, default: 0 },
    iv: { type: Number, default: 0 },
    v: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  Term3: {
    i: { type: Number, default: 0 },
    ii: { type: Number, default: 0 },
    iii: { type: Number, default: 0 },
    iv: { type: Number, default: 0 },
    v: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
}, { timestamps: true });

// Unique per School+Class+Section+Subject for new docs; allow legacy docs without schoolId
maxMarkSchema.index(
  { schoolId: 1, className: 1, section: 1, subject: 1 },
  { unique: true, partialFilterExpression: { schoolId: { $exists: true } } }
);

module.exports = mongoose.model("MaxMark", maxMarkSchema);