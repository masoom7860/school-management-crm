const mongoose = require("mongoose");

const certificateSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student",
    required: true,
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true,
  },
  type: {
    type: String,
    required: true,
    enum: [
      "Bonafide",
      "Transfer",
      "Completion",
      "Character",
      "Fee Payment",
      "Sports",
      "Award",
      "Other",
    ],
  },
  issueDate: {
    type: Date,
    default: Date.now,
  },
  validTill: {
    type: Date,
  },
  course: {
    type: String,
  },
  className: {
    type: String,
  },
  description: {
    type: String,
  },
  // Optional structured fields for Award certificates and similar
  year: { type: String },
  eventName: { type: String },
  awardTitle: { type: String },
  eventCoordinator: { type: String },
  colorHouse: { type: String },
  certificateNumber: {
    type: String,
    required: true,
    unique: true,
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin",
  },
  remarks: {
    type: String,
  },
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Session",
  },
  reason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Certificate", certificateSchema);
