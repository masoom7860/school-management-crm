const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam'
  },
  obtainedMarks: Number,
  grade: String,
  remarks: String,
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher'
  }
});

module.exports = mongoose.model('Report', reportSchema);
