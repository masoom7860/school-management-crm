const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    logoUrl: String,
    address: String,

    // Selected template (prebuilt)
    marksheetTemplate: {
      type: String,
      enum: ["default", "cbse-modern", "fancy", "bordered", "simple", "custom"],
      default: "default",
    },

    // For completely custom HTML templates
    customTemplateHtml: { type: String, default: "" },

    // Custom CSS
    customStyles: { type: String, default: "" },

    // Assets for template
    assets: {
      headerImage: { type: String },
      footerImage: { type: String },
      signaturePrincipal: { type: String },
      signatureDirector: { type: String },
      backgroundFrame: { type: String },
      stampImage: { type: String }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.School || mongoose.model("School", schoolSchema);
