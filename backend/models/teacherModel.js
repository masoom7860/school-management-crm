const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  // Personal Details
  name: { type: String, required: true },
  gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
  dob: { type: Date, required: true },
  photo: { type: String }, // store URL or path to image
  nationalId: { type: String }, // Aadhaar, SSN, etc.

  // Contact Details
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zip: String
  },

  // Emergency Contact
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },

  // Professional Details
  qualification: { type: String, required: true },
  experience: { type: Number, default: 0 }, // in years
  designation: { type: String }, // No longer required - using school-scoped designations
  employeeId: { type: String, required: true }, // Removed unique constraint - will handle uniqueness in controller
  joiningDate: { type: Date, required: true },
  subjects: [{ type: String }],
  classesAssigned: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],

  // System & Auth
  password: { type: String, required: true },
  role: { type: String, default: 'teacher' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },

  // School Association
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }

}, { timestamps: true });

module.exports = mongoose.model('Teacher', teacherSchema);
