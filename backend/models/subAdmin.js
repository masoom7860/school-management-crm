const mongoose = require('mongoose');

const subadminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true },
  role: { type: String, default: 'subadmin' },

  // 📸 PHOTO & IDENTITY
  photoUrl: { type: String }, // URL or file path
  identityType: { type: String, enum: ['Aadhar', 'PAN', 'Driving License', 'Passport'], default: 'Aadhar' },
  identityNumber: { type: String },
  identityDocumentUrl: { type: String }, // Optional file/image URL

  // 🧑 PERSONAL DETAILS
  gender: { type: String, enum: ['Male', 'Female', 'Other'] },
  dob: { type: Date },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    pincode: { type: String },
    country: { type: String, default: 'India' }
  },

  // 🧾 SCHOOL POSITION
  designation: { type: String, default: 'Sub Admin' },

  // ✅ STATUS
  isActive: { type: Boolean, default: true },

  // ☎️ EMERGENCY CONTACT
  emergencyContact: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String }
  },

  // 🔗 LINKS
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true }

}, { timestamps: true });

module.exports = mongoose.model('Subadmin', subadminSchema);
