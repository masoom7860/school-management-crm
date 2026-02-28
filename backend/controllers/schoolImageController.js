const fs = require("fs");
const path = require("path");
const SchoolImage = require("../models/schoolImageModel");

// Upload / Update image
exports.uploadImage = async (req, res) => {
  try {
    const { schoolId, type } = req.params;
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    let existing = await SchoolImage.findOne({ schoolId, type });

    if (existing) {
      // remove old file
      const oldPath = path.join(__dirname, "../", existing.imageUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      existing.imageUrl = `uploads/${req.file.filename}`;
      await existing.save();

      return res.json({ success: true, message: "Image updated", data: existing });
    }

    const newImage = await SchoolImage.create({
      schoolId,
      type,
      imageUrl: `uploads/${req.file.filename}`,
    });

    res.json({ success: true, message: "Image uploaded", data: newImage });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all images for school
exports.getImages = async (req, res) => {
  try {
    const images = await SchoolImage.find({ schoolId: req.params.schoolId });
    res.json({ success: true, data: images });
  } catch (err) {
    console.error("❌ Get error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const { schoolId, type } = req.params;
    const image = await SchoolImage.findOne({ schoolId, type });
    if (!image) return res.status(404).json({ success: false, message: "Image not found" });

    // delete file
    const filePath = path.join(__dirname, "../", image.imageUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    await SchoolImage.deleteOne({ _id: image._id });
    res.json({ success: true, message: "Image deleted successfully" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
