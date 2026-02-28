// models/StudyMaterial.js
const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  file: { type: String, required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  // Legacy support: some older records may have class name string
  class: { type: String },
  // New fields for proper scoping
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  subject: { type: String, required: true },
  // Optional categorization and scheduling
  type: { type: String, enum: ['material', 'homework', 'task'], default: 'material' },
  dueDate: { type: Date },
  // When created by admin/subadmin
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: false },
  // When created by teacher
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  // Optional: target a single student instead of whole class/section
  targetStudentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }
}, { timestamps: true });

// Helpful index for common queries
studyMaterialSchema.index({ schoolId: 1, classId: 1, sectionId: 1, subject: 1 });

const StudyMaterial = mongoose.model('StudyMaterial', studyMaterialSchema);

module.exports = StudyMaterial;
