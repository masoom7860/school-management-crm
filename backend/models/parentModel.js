const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const parentSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin' },

  father: {
    name: { type: String },
    photo: { type: String },
    email: { type: String },
    mobile: { type: String },
    bloodGroup: { type: String },
    occupation: { type: String },
    maritalStatus: { type: String },
    department: { type: String },
    organization: { type: String },
    designation: { type: String },
    annualIncome: { type: String },
    itrFiled: { type: Boolean },
    itrSince: { type: String },
    education: {
      doctorate: { type: String },
      pg: { type: String },
      graduate: { type: String },
      highSchool: { type: String }
    }
  },

  mother: {
    name: { type: String },
    photo: { type: String },
    email: { type: String },
    mobile: { type: String },
    bloodGroup: { type: String },
    occupation: { type: String },
    maritalStatus: { type: String },
    department: { type: String },
    organization: { type: String },
    designation: { type: String },
    annualIncome: { type: String },
    itrFiled: { type: Boolean },
    itrSince: { type: String },
    education: {
      doctorate: { type: String },
      pg: { type: String },
      graduate: { type: String },
      highSchool: { type: String }
    }
  },

  guardian: {
    name: { type: String },
    photo: { type: String },
    relation: { type: String },
    email: { type: String },
    mobile: { type: String },
    bloodGroup: { type: String },
    occupation: { type: String },
    maritalStatus: { type: String },
    department: { type: String },
    organization: { type: String },
    designation: { type: String },
    annualIncome: { type: String },
    itrFiled: { type: Boolean },
    itrSince: { type: String },
    education: {
      doctorate: { type: String },
      pg: { type: String },
      graduate: { type: String },
      highSchool: { type: String }
    }
  },

  emergencyContact: {
    name: { type: String },
    relation: { type: String },
    phone: { type: String }
  },

  password: { type: String, required: true, minlength: 8 },
  role: { type: String, default: 'parent' },
  loginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  lockUntil: { type: Date },
  lastLogin: { type: Date }
}, { timestamps: true });

// Password encryption
parentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password.trim(), salt);
    next();
  } catch (err) {
    next(err);
  }
});

parentSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword.trim(), this.password);
};

module.exports = mongoose.model('Parent', parentSchema);
