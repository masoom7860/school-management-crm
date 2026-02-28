const mongoose = require('mongoose');

const feeMonthSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId },
    sessionLabel: { type: String },
    academicYear: { type: String },
    name: { type: String, required: true }, // ❌ NOT UNIQUE
    month: { type: String },
    code: { type: String },
    order: { type: Number, required: true },
    dueDate: { type: Date },
    isActive: { type: Boolean, default: true },
    metadata: { type: Object },
    createdBy: { type: mongoose.Schema.Types.ObjectId },
    updatedBy: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

// ✅ ONLY THIS SHOULD BE UNIQUE
feeMonthSchema.index(
  { schoolId: 1, sessionId: 1, order: 1 },
  { unique: true }
);

module.exports = mongoose.model('FeeMonth', feeMonthSchema);
