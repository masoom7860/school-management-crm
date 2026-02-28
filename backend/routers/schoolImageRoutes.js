const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  uploadImage,
  getImages,
  deleteImage,
} = require("../controllers/schoolImageController");

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Upload / Update
router.post("/:schoolId/:type", upload.single("image"), uploadImage);

// Get all Images
router.get("/:schoolId", getImages);

// Delete image
router.delete("/:schoolId/:type", deleteImage);

module.exports = router;
