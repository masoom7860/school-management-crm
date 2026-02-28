const express = require("express");
const router = express.Router();
const { getMarksEntryData, setStudentMarks } = require("../controllers/StudentMarkController");

// Route to get all data needed for the Marks Entry grid (Max Marks, Open Days, Existing Marks)
router.get("/entrydata", getMarksEntryData); 

// Route to set or update the obtained marks for a student
router.post("/set", setStudentMarks);

module.exports = router;