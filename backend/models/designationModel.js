const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Ensure uniqueness of designation name within the same school
designationSchema.index({ schoolId: 1, name: 1 }, { unique: true });

const Designation = mongoose.model("Designation", designationSchema);
module.exports = Designation;
