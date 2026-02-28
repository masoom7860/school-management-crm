const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  title: String,
  description: String,
  class: String,
  sectionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  subject: String,
  totalMarks: Number,
  passingMarks: Number,
  date: Date,
  duration: Number, // in minutes
  academicYear: { type: String },
  term: { type: String },
  examType: { type: String },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

module.exports = mongoose.model('Exam', examSchema);
