const express = require('express');
const router = express.Router();
const { allowRoles } = require('../middlewares/authMiddleware');
const { schoolUpload } = require('../middlewares/uploadMiddleware');

router.post('/image', allowRoles('admin','staff','subadmin','teacher'), schoolUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });

    const relPath = (req.file.path || '').replace(/\\/g, '/');
    const url = `/${relPath}`;

    return res.status(201).json({ success: true, url });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
