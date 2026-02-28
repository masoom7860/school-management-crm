const mongoose = require('mongoose');

const membershipPlanSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    price: { type: Number, required: true },
    durationInMonths: { type: Number, required: true },
    features: [String],
    isActive: { type: Boolean, default: true }
  }, { timestamps: true, strict: true });
  

module.exports = mongoose.model('MembershipPlan', membershipPlanSchema);
