import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: String,
  rollNo: String,
  className: String,
  section: String,
  session: String,
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }
});

export default mongoose.model("Student", studentSchema);
