const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true }
});

sectionSchema.index({ name: 1, classId: 1, schoolId: 1 }, { unique: true });

module.exports = mongoose.model('Section', sectionSchema); 