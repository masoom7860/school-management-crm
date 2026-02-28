const mongoose = require("mongoose");

const termMarksSchema = new mongoose.Schema({ 
  max: { type: Number, default: 0 },
  obtained: { type: Number, default: 0 }
}, { _id: false });

const subjectSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
  subjectName: { type: String, required: true, trim: true },
  Term1: termMarksSchema,
  Term2: termMarksSchema,
  Term3: termMarksSchema,
  totalMaxMarks: { type: Number, min: 0, required: true },
  passingMarks: { type: Number, min: 0, required: true },
  marksObtained: { type: Number, min: 0, required: true },
  grade: { type: String, required: true },
});

const marksheetSchema = new mongoose.Schema(
  {
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School", required: true },
    session: { type: String, required: true },
    classId: { type: mongoose.Schema.Types.ObjectId, ref: "Class", required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true },
    examId: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    subjects: [subjectSchema],
    totalMaxMarks: { type: Number, min: 0, required: true },
    totalObtained: { type: Number, min: 0, required: true },
    percentage: { type: Number, min: 0, max: 100, required: true },
    grade: { type: String, required: true },
    remarks: { type: String, trim: true, maxlength: 500 },
    status: { type: String, enum: ["PASS", "FAIL"], required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher", required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Marksheet", marksheetSchema);
