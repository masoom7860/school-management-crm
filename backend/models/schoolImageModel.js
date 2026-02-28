const mongoose = require("mongoose");

const schoolImageSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        "organizationLogo",
        "profilePhoto",
        "certificateBackground",
        "mohar",
        "boardLogo",
        "staffCard",
        "studentCard",
        "marksheetBackground",
      ],
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Ensure uniqueness per school + type
schoolImageSchema.index({ schoolId: 1, type: 1 }, { unique: true });

const SchoolImage = mongoose.model("SchoolImage", schoolImageSchema);
module.exports = SchoolImage;
