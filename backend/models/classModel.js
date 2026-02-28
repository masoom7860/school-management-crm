const mongoose = require("mongoose");

const classSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    className: { type: String, required: true, trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

// Ensure class names are unique per school
classSchema.index({ schoolId: 1, className: 1 }, { unique: true });

module.exports = mongoose.model("Class", classSchema);
