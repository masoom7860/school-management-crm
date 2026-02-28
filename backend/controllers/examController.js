const mongoose = require('mongoose');
const Exam = require('../models/examModel');

// Create/Upsert Exam
const createExam = async (req, res) => {
  try {
    const {
      title,
      description,
      class: className,
      sectionId,
      subject,
      totalMarks,
      passingMarks,
      date,
      duration,
      term,
      academicYear,
      examType,
    } = req.body;

    // Get schoolId and createdBy from token/body
    const schoolId = req.decodedToken?.schoolId || req.body.schoolId;
    const createdBy =
      req.decodedToken?.id ||
      req.decodedToken?.adminId ||
      req.decodedToken?.staffId ||
      req.decodedToken?.subadminId ||
      req.decodedToken?.teacherId ||
      req.body.createdBy;

    if (!schoolId) {
      return res.status(400).json({ success: false, message: 'School ID is required' });
    }

    const schoolIdObj = mongoose.Types.ObjectId.isValid(schoolId)
      ? new mongoose.Types.ObjectId(schoolId)
      : null;

    if (!schoolIdObj) {
      return res.status(400).json({ success: false, message: 'Invalid School ID' });
    }

    const hasSection = typeof sectionId === 'string' && mongoose.Types.ObjectId.isValid(sectionId);
    const sectionIdObj = hasSection ? new mongoose.Types.ObjectId(sectionId) : undefined;

    const filter = {
      schoolId: schoolIdObj,
      class: className || '',
      academicYear: academicYear || '',
      examType: examType || 'General',
    };

    // Try to find existing first to avoid findAndModify upsert issues
    let existing = await Exam.findOne(filter).populate('sectionId');
    if (existing) {
      // Optionally update non-identity fields if provided
      const updates = {};
      if (title) updates.title = title;
      if (description) updates.description = description;
      if (subject) updates.subject = subject;
      if (typeof totalMarks === 'number') updates.totalMarks = totalMarks;
      if (typeof passingMarks === 'number') updates.passingMarks = passingMarks;
      if (date) updates.date = date;
      if (typeof duration === 'number') updates.duration = duration;
      if (createdBy) updates.createdBy = createdBy;

      if (Object.keys(updates).length > 0) {
        existing = await Exam.findByIdAndUpdate(existing._id, { $set: updates }, { new: true }).populate('sectionId');
      }
      return res.status(200).json({ success: true, message: 'Exam created/updated', exam: existing });
    }

    // Create new if not found
    const doc = {
      title: title || `${term || 'Exam'} - ${className || ''}`,
      description: description || '',
      class: className || '',
      ...(hasSection ? { sectionId: sectionIdObj } : {}),
      subject: subject || '',
      totalMarks: totalMarks || 0,
      passingMarks: passingMarks || 0,
      date: date || new Date(),
      duration: duration || 0,
      academicYear: academicYear || '',
      term: term || '',
      examType: examType || 'General',
      schoolId: schoolIdObj,
      createdBy: createdBy || null,
    };

    try {
      let created = await Exam.create(doc);
      created = await Exam.findById(created._id).populate('sectionId');
      return res.status(200).json({ success: true, message: 'Exam created/updated', exam: created });
    } catch (err) {
      // Handle duplicate key by fetching existing
      if (err && err.code === 11000) {
        const dup = await Exam.findOne(filter).populate('sectionId');
        if (dup) {
          return res.status(200).json({ success: true, message: 'Exam exists', exam: dup });
        }
      }
      throw err;
    }
  } catch (error) {
    console.error('Error creating exam:', error);
    res.status(500).json({ success: false, message: 'Error creating exam', error: error.message });
  }
};

// Get Exams by School
const getExamsBySchool = async (req, res) => {
  const schoolId = req.decodedToken?.schoolId || req.user?.schoolId || req.params?.schoolId;
  const { class: classId, term, sectionId, academicYear, examType, subject } = req.query;
  
  if (!schoolId) {
    return res.status(400).json({ message: 'School ID not found in token' });
  }
  
  try {
    const schoolIdObj = mongoose.Types.ObjectId.isValid(schoolId)
      ? new mongoose.Types.ObjectId(schoolId)
      : schoolId;
    let query = { schoolId: schoolIdObj };
    if (classId) query.class = classId;
    if (term) query.term = term;
    if (sectionId) {
      if (mongoose.Types.ObjectId.isValid(sectionId)) {
        query.sectionId = new mongoose.Types.ObjectId(sectionId);
      } else {
        query.sectionId = null; // treat invalid as null
      }
    }
    if (academicYear) query.academicYear = academicYear;
    if (examType) query.examType = examType;
    if (subject) query.subject = subject;
    
    let exams = await Exam.find(query).populate('sectionId');
    if ((!exams || exams.length === 0) && term) {
      const { term: _ignore, ...noTermQuery } = query;
      exams = await Exam.find(noTermQuery).populate('sectionId');
    }
    res.status(200).json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching exams', error: error.message });
  }
};

// Delete Exam
const deleteExam = async (req, res) => {
  const { examId } = req.params;
  try {
    await Exam.findByIdAndDelete(examId);
    res.status(200).json({ message: 'Exam deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting exam', error: error.message });
  }
};

module.exports = { createExam, getExamsBySchool, deleteExam };
