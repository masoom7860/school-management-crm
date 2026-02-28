const express = require('express');
const router = express.Router();
const Section = require('../models/section');
const { verifyAdminOrStaff, allowRoles } = require('../middlewares/authMiddleware');

// Create section
router.post('/', verifyAdminOrStaff, async (req, res) => {
  const { name, classId, schoolId } = req.body;
  if (!name || !classId || !schoolId) return res.status(400).json({ message: 'name, classId, and schoolId are required' });
  try {
    const existingSection = await Section.findOne({ name, classId, schoolId });
    if (existingSection) {
      return res.status(400).json({ message: 'A section with this name already exists for this class.' });
    }
    const section = await Section.create({ name, classId, schoolId });
    res.status(201).json(section);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A section with this name already exists for this class.' });
    }
    res.status(500).json({ message: 'Error creating section', error: error.message });
  }
});

// Update section
router.put('/:id', verifyAdminOrStaff, async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: 'name is required' });
  try {
    const section = await Section.findByIdAndUpdate(id, { name }, { new: true });
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.status(200).json(section);
  } catch (error) {
    res.status(500).json({ message: 'Error updating section', error: error.message });
  }
});

// Delete section
router.delete('/:id', verifyAdminOrStaff, async (req, res) => {
  const { id } = req.params;
  try {
    const section = await Section.findByIdAndDelete(id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.status(200).json({ message: 'Section deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting section', error: error.message });
  }
});

// Get sections by classId and schoolId
router.get('/', allowRoles('admin', 'staff', 'subadmin', 'teacher'), async (req, res) => {
  const { classId, schoolId } = req.query;
  if (!classId || !schoolId) return res.status(400).json({ message: 'classId and schoolId are required' });
  try {
    const sections = await Section.find({ classId, schoolId });
    res.status(200).json(sections);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching sections', error: error.message });
  }
});

module.exports = router; 