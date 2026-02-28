const Report = require('../models/reportModel');

const createReport = async (req, res) => {
  const { studentId, examId, obtainedMarks, grade, remarks, schoolId, createdBy } = req.body;

  try {
    const report = new Report({
      studentId, examId, obtainedMarks, grade, remarks, schoolId, createdBy
    });

    await report.save();
    res.status(201).json({ message: 'Report created', report });
  } catch (error) {
    res.status(500).json({ message: 'Error creating report', error: error.message });
  }
};

const getReportsBySchool = async (req, res) => {
  const { schoolId } = req.params;

  try {
    const reports = await Report.find({ schoolId }).populate('studentId examId');
    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching reports', error: error.message });
  }
};

module.exports = { createReport, getReportsBySchool };
