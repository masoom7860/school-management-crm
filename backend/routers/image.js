const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware');
const { uploadImage } = require('../controllers/image');

// POST /api/images/upload
router.post('/upload', upload.schoolUpload.single('image'), uploadImage);

module.exports = router;
