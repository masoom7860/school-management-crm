const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'staff',
    enum: ['staff'],
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
  },

  // ✅ Extended fields
  photoUrl: {
    type: String,
    default: '',
  },
  identityType: {
    type: String,
    enum: ['Aadhar Card', 'Passport', 'Driving License', 'PAN Card', 'Other'],
    default: 'Aadhar Card',
  },
  identityNumber: {
    type: String,
    default: '',
  },
  identityDocumentUrl: {
    type: String,
    default: '',
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  dob: {
    type: Date,
  },
  // Updated address to be a nested object
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String },
  },
  designation: {
    type: String,
  },
  // Updated emergencyContact to be a nested object
  emergencyContact: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String },
  }

}, {
  timestamps: true,
});

module.exports = mongoose.model('Staff', staffSchema);
