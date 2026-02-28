const express = require('express');
const router = express.Router();
const School = require('../models/schoolModel');
const { allowRoles } = require('../middlewares/authMiddleware');


// GET school with template settings
router.get('/:id', allowRoles('admin','staff','subadmin','teacher'), async (req, res) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school)
      return res.status(404).json({ success: false, message: "School not found" });

    res.json({ success: true, data: school });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// UPDATE Template (HTML / CSS / Images / Template Name)
router.patch('/:id/template', allowRoles('admin','staff'), async (req, res) => {
  try {
    const {
      marksheetTemplate,
      customTemplateHtml,
      customStyles,
      assets
    } = req.body;

    const update = {};

    if (marksheetTemplate) update.marksheetTemplate = marksheetTemplate;
    if (customTemplateHtml !== undefined) update.customTemplateHtml = customTemplateHtml;
    if (customStyles !== undefined) update.customStyles = customStyles;

    if (assets) {
      update.assets = { ...assets };
    }

    const school = await School.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );

    if (!school)
      return res.status(404).json({ success: false, message: 'School not found' });

    res.json({ success: true, data: school });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


module.exports = router;
