const mongoose = require('mongoose');
const MembershipPlan = require('./MembershipPlan');


const SchoolSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  branchName: { type: String }, // Optional branch identifier for receipts
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true, unique: true },
  alternatePhone: { type: String },
  website: { type: String },
  establishmentYear: { type: Number },
  affiliation: { type: String }, // e.g., CBSE, ICSE, IB, State Board
  schoolCode: { type: String, unique: true },
  logoUrl: { type: String }, // Cloudinary or S3 image link
  principalName: { type: String },
  totalStudents: { type: Number, default: 0 },
  totalStaff: { type: Number, default: 0 },
  lastApplicationNumber: { type: Number, default: 0 }, // Added for sequential student application numbers

  businessDetails: {
    gstNumber: { type: String },
    panNumber: { type: String },
    licenseNumber: { type: String },
    registrationCertificateUrl: { type: String },
    accountHolderName: { type: String },
    bankName: { type: String },
    accountNumber: { type: String },
    ifscCode: { type: String },
    upiId: { type: String },
  },

  adminDetails: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    role: { type: String, default: 'Admin' },
    identityType: { type: String, enum: ['Aadhar', 'PAN', 'Driving License', 'Passport'] },
    identityNumber: { type: String },
    identityDocumentUrl: { type: String }, // uploaded proof image
  },

  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },

  // School status: 'active' or 'inactive'
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },

  /*
  subscription: {
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'MembershipPlan' },
    paymentStatus: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
    trialEndDate: { type: Date },
    subscribedAt: { type: Date },
    expiresAt: { type: Date }
  },
  */

  createdAt: { type: Date, default: Date.now },

  // Added Razorpay configuration fields
  razorpay: {
    key_id: { type: String },
    key_secret: { type: String },
  }
}, { timestamps: true });

module.exports = mongoose.model('School', SchoolSchema);
