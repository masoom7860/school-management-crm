const mongoose = require("mongoose");
const Designation = require("../models/designationModel");

// Create
const createDesignation = async (req, res) => {
  try {
    const { name } = req.body;
    const schoolId = req.headers["school-id"] || req.body.schoolId;

    if (!name) return res.status(400).json({ message: "Name is required" });
    if (!schoolId) return res.status(400).json({ message: "School-ID header is required" });
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: "Invalid School-ID" });
    }

    // Ensure indexes are in sync (drop legacy unique index on name if present)
    try { await Designation.syncIndexes(); } catch (_) {}

    const exists = await Designation.findOne({ schoolId, name });
    if (exists) return res.status(400).json({ message: "Already exists for this school" });

    const designation = new Designation({ schoolId, name });
    await designation.save();
    res.status(201).json(designation);
  } catch (error) {
    // Handle duplicate key errors gracefully
    if (error?.code === 11000) {
      return res.status(400).json({ message: "Designation already exists for this school" });
    }
    res.status(500).json({ message: error.message });
  }
};

// Read All
const getDesignations = async (req, res) => {
  try {
    const schoolId = req.headers["school-id"] || req.query.schoolId;
    if (!schoolId) return res.status(400).json({ message: "School-ID header is required" });
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: "Invalid School-ID" });
    }
    const designations = await Designation.find({ schoolId }).sort({ createdAt: 1 });
    res.json(designations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete
const deleteDesignation = async (req, res) => {
  try {
    const schoolId = req.headers["school-id"] || req.query.schoolId;
    if (!schoolId) return res.status(400).json({ message: "School-ID header is required" });
    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({ message: "Invalid School-ID" });
    }
    const { id } = req.params;
    const designation = await Designation.findOneAndDelete({ _id: id, schoolId });
    if (!designation) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createDesignation,
  getDesignations,
  deleteDesignation,
};
