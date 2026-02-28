const mongoose = require('mongoose');

const maxMarksConfigSchema = new mongoose.Schema({
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'School',
    required: true,
    index: true
  },
  examId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exam',
    required: true,
    index: true
  },
  classId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class',
    required: true,
    index: true
  },
  sectionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
    required: false,
    index: true
  },
  subjects: [{
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    Term1: { 
      i: { type: Number, default: 0 },
      ii: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    Term2: { 
      i: { type: Number, default: 0 },
      ii: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    Term3: { 
      i: { type: Number, default: 0 },
      ii: { type: Number, default: 0 },
      max: { type: Number, default: 0 }
    },
    passingMarks: {
      type: Number,
      required: true,
      min: 0
    },
  }],
}, {
  timestamps: true
});

maxMarksConfigSchema.index(
  { schoolId: 1, examId: 1, classId: 1, sectionId: 1 },
  { unique: true }
);

module.exports = mongoose.model('MaxMarksConfig', maxMarksConfigSchema);
