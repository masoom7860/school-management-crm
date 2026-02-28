import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: String,
  maxMarks: Number,
  minMarks: Number,
  obtainedMarks: Number,
});

const marksheetSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" },
  examName: String,
  remarks: String,
  subjects: [subjectSchema],
  totalMarks: Number,
  percentage: Number,
  grade: String,
  status: String,
});

export default mongoose.model("Marksheet", marksheetSchema);
