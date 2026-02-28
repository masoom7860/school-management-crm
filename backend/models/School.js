import mongoose from "mongoose";

const schoolSchema = new mongoose.Schema({
  name: String,
  logoUrl: String,
  address: String,

  // Prebuilt template names
  marksheetTemplate: {
    type: String,
    default: 'default' // cbse, modern, minimal etc.
  },

  // For custom templates (full HTML)
  customTemplateHtml: { type: String, default: "" },

  // Custom CSS
  customStyles: { type: String, default: "" },

  // School-specific images (optional)
  assets: {
    headerImage: String,
    footerImage: String,
    signatureImage: String,
    stampImage: String
  }
}, { timestamps: true });

export default mongoose.model("School", schoolSchema);
