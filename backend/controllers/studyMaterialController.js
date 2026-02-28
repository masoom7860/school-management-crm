// controllers/studyMaterialController.js
const StudyMaterial = require('../models/StudyMaterial');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Teacher = require('../models/teacherModel');
const Student = require('../models/studentModel');

const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here_make_it_long_and_secure');
};

const createStudyMaterial = async (req, res) => {
  const { title, description, subject, classId, sectionId, type, dueDate, targetStudentId } = req.body;
  const file = req.file;

  const decoded = req.decodedToken || (req.headers.authorization ? verifyToken(req.headers.authorization.split(' ')[1]) : null);
  if (!decoded) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const schoolId = decoded.schoolId || req.header('School-ID');
  if (!title || !subject || !file || !schoolId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    let doc = {
      title,
      description: description || '',
      file: file.path,
      schoolId,
      subject,
    };

    if (classId && mongoose.Types.ObjectId.isValid(classId)) {
      doc.classId = classId;
    } else if (req.body.class) {
      doc.class = req.body.class; // legacy support
    }
    if (sectionId && mongoose.Types.ObjectId.isValid(sectionId)) {
      doc.sectionId = sectionId;
    }

    // If targeting a single student, validate and normalize class/section
    if (targetStudentId && mongoose.Types.ObjectId.isValid(targetStudentId)) {
      const student = await Student.findById(targetStudentId);
      if (!student) {
        return res.status(400).json({ message: 'Target student not found' });
      }
      if (String(student.schoolId) !== String(schoolId)) {
        return res.status(403).json({ message: 'Student belongs to a different school' });
      }
      // If class/section not provided, infer from student
      if (!doc.classId) doc.classId = student.classId;
      if (!doc.sectionId && student.sectionId) doc.sectionId = student.sectionId;
      doc.targetStudentId = student._id;
    }

    if (decoded.role === 'teacher') {
      const teacher = await Teacher.findById(decoded.id);
      if (!teacher || teacher.schoolId.toString() !== String(schoolId)) {
        return res.status(403).json({ message: 'Unauthorized teacher or school mismatch' });
      }
      if (doc.classId) {
        const assigned = (teacher.classesAssigned || []).map(id => String(id));
        if (!assigned.includes(String(doc.classId))) {
          return res.status(403).json({ message: 'You are not assigned to this class' });
        }
      }
      doc.teacherId = teacher._id;
    } else if (decoded.role === 'admin' || decoded.role === 'subadmin') {
      doc.createdBy = decoded.id || decoded.adminId;
    }

    // Optional fields
    if (type && ['material', 'homework', 'task'].includes(type)) {
      doc.type = type;
    }
    if (dueDate) {
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) doc.dueDate = d;
    }

    const studyMaterial = new StudyMaterial(doc);
    await studyMaterial.save();
    res.status(201).json({ message: 'Study material created successfully', studyMaterial });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create study material' });
  }
};

const getStudyMaterials = async (req, res) => {
  const { schoolId, className } = req.params;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    verifyToken(token);
    const materials = await StudyMaterial.find({ schoolId, class: className });
    res.status(200).json({ materials });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch materials' });
  }
};

const listByClass = async (req, res) => {
  try {
    const decoded = req.decodedToken;
    const schoolId = decoded?.schoolId || req.header('School-ID');
    const { classId, sectionId } = req.query;
    if (!schoolId || !classId) {
      return res.status(400).json({ message: 'schoolId and classId are required' });
    }

    const filter = { schoolId, classId };
    if (sectionId) filter.sectionId = sectionId;

    if (decoded?.role === 'teacher') {
      const teacher = await Teacher.findById(decoded.id);
      const assigned = (teacher?.classesAssigned || []).map(id => String(id));
      if (!assigned.includes(String(classId))) {
        return res.status(403).json({ message: 'Not permitted for this class' });
      }
    }

    const materials = await StudyMaterial.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (err) {
    console.error('listByClass error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch materials' });
  }
};

const listTeacherMaterials = async (req, res) => {
  try {
    const decoded = req.decodedToken;
    if (decoded?.role !== 'teacher') {
      return res.status(403).json({ message: 'Teacher access only' });
    }
    const schoolId = decoded.schoolId;
    const materials = await StudyMaterial.find({ schoolId, teacherId: decoded.id }).sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (err) {
    console.error('listTeacherMaterials error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch materials' });
  }
};

const listStudentMaterials = async (req, res) => {
  try {
    const decoded = req.decodedToken;
    if (decoded?.role !== 'student') {
      return res.status(403).json({ message: 'Student access only' });
    }
    const student = await Student.findById(decoded.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Build query to include:
    // - Materials for the student's school and class
    // - If student has a sectionId: materials for that section OR class-wide (no sectionId)
    // - If student has no sectionId: only class-wide materials (no sectionId)
    // - Targeted materials (targetStudentId == student._id) regardless of section presence
    const sectionOr = student.sectionId
      ? [{ sectionId: student.sectionId }, { sectionId: { $exists: false } }, { sectionId: null }]
      : [{ sectionId: { $exists: false } }, { sectionId: null }];

    const query = {
      schoolId: student.schoolId,
      classId: student.classId,
      $and: [
        { $or: sectionOr },
        {
          $or: [
            { targetStudentId: { $exists: false } },
            { targetStudentId: null },
            { targetStudentId: student._id }
          ]
        }
      ]
    };

    const materials = await StudyMaterial.find(query).sort({ createdAt: -1 });
    res.json({ success: true, materials });
  } catch (err) {
    console.error('listStudentMaterials error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch materials' });
  }
};

const updateStudyMaterial = async (req, res) => {
  const { id } = req.params;
  const { title, description, classId, sectionId, subject, className, type, dueDate } = req.body;
  const file = req.file;
  const decoded = req.decodedToken || (req.headers.authorization ? verifyToken(req.headers.authorization.split(' ')[1]) : null);
  if (!decoded) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const studyMaterial = await StudyMaterial.findById(id);
    if (!studyMaterial) {
      return res.status(404).json({ message: 'Study material not found' });
    }
    if (decoded.role === 'teacher') {
      if (!studyMaterial.teacherId || String(studyMaterial.teacherId) !== String(decoded.id)) {
        return res.status(403).json({ message: 'You do not have permission to update this material' });
      }
    }

    if (title) studyMaterial.title = title;
    if (description) studyMaterial.description = description;
    if (subject) studyMaterial.subject = subject;
    if (classId && mongoose.Types.ObjectId.isValid(classId)) studyMaterial.classId = classId;
    if (sectionId && mongoose.Types.ObjectId.isValid(sectionId)) studyMaterial.sectionId = sectionId;
    if (className) studyMaterial.class = className; // legacy support update
    if (type && ['material', 'homework', 'task'].includes(type)) studyMaterial.type = type;
    if (dueDate) {
      const d = new Date(dueDate);
      if (!isNaN(d.getTime())) studyMaterial.dueDate = d;
    }

    if (file) {
      try {
        if (studyMaterial.file && fs.existsSync(path.join(__dirname, '../', studyMaterial.file))) {
          fs.unlinkSync(path.join(__dirname, '../', studyMaterial.file));
        }
      } catch (e) {}
      studyMaterial.file = file.path;
    }

    await studyMaterial.save();
    res.status(200).json({ message: 'Study material updated successfully', studyMaterial });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update study material' });
  }
};

const deleteStudyMaterial = async (req, res) => {
  const { id } = req.params;
  const decoded = req.decodedToken || (req.headers.authorization ? verifyToken(req.headers.authorization.split(' ')[1]) : null);
  if (!decoded) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const studyMaterial = await StudyMaterial.findById(id);
    if (!studyMaterial) {
      return res.status(404).json({ message: 'Study material not found' });
    }
    if (decoded.role === 'teacher') {
      if (!studyMaterial.teacherId || String(studyMaterial.teacherId) !== String(decoded.id)) {
        return res.status(403).json({ message: 'You do not have permission to delete this material' });
      }
    }
    try {
      if (studyMaterial.file && fs.existsSync(path.join(__dirname, '../', studyMaterial.file))) {
        fs.unlinkSync(path.join(__dirname, '../', studyMaterial.file));
      }
    } catch (e) {}
    await studyMaterial.deleteOne();
    res.status(200).json({ message: 'Study material deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete study material' });
  }
};

module.exports = {
  createStudyMaterial,
  getStudyMaterials,
  listByClass,
  listTeacherMaterials,
  listStudentMaterials,
  updateStudyMaterial,
  deleteStudyMaterial,
};
