const Joi = require('joi');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const Marksheet = require('../models/MarksheetModal');
const Student = require('../models/studentModel');
const Class = require('../models/classModel');
const Section = require('../models/section');
const Exam = require('../models/examModel');
const Subject = require('../models/Subject');
const MaxMarksConfig = require('../models/MaxMarksConfigModel');
const School = require('../models/schoolModel');

const {
  calculateGrade,
  determinePassFail,
  calculateTotals,
  calculateSubjectGrade,
  validateSubjectMarks
} = require('../utils/gradeUtils');

// Joi validation schema
const termMarksJoiSchema = Joi.object({
  obtained: Joi.number().min(0).required(),
});

const subjectSchema = Joi.object({
  subjectId: Joi.string().required(),
  subjectName: Joi.string().required(),
  Term1: termMarksJoiSchema,
  Term2: termMarksJoiSchema,
  Term3: termMarksJoiSchema,
});

const marksheetSchema = Joi.object({
  session: Joi.string().required(),
  classId: Joi.string().required(),
  sectionId: Joi.string().required(),
  examId: Joi.string().required(),
  studentId: Joi.string().required(),
  remarks: Joi.string().allow('', null),
  subjects: Joi.array().items(subjectSchema).min(1).required()
});

// Helpers
const buildComputedFields = (subjects) => {
  // Add per-subject grades
  const subjectsWithGrades = subjects.map((s) => ({
    ...s,
    grade: calculateSubjectGrade(s.marksObtained, s.totalMaxMarks)
  }));

  const totals = calculateTotals(subjectsWithGrades);
  const overallGrade = calculateGrade(totals.percentage);
  const status = determinePassFail(totals.percentage);

  return {
    subjectsWithGrades,
    totals,
    overallGrade,
    status
  };
};

exports.createMarksheet = async (req, res) => {
  try {
             
    const { error, value } = marksheetSchema.validate(req.body);
    if (error)
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });

    // Get school & creator info from token/body
    const schoolId = req.decodedToken?.schoolId || req.body.schoolId;
    const createdBy = (
      req.decodedToken?.id ||
      req.decodedToken?.adminId ||
      req.decodedToken?.staffId ||
      req.decodedToken?.subadminId ||
      req.decodedToken?.teacherId ||
      req.body.createdBy ||
      req.decodedToken?.schoolId ||
      null
    );
    if (!schoolId)
      return res
        .status(400)
        .json({ success: false, message: "School ID missing" });

    // Step 1: Fetch Max Marks Configuration
    const maxMarksConfig = await MaxMarksConfig.findOne({
      schoolId,
      examId: value.examId,
      classId: value.classId,
      sectionId: value.sectionId,
    });

    if (!maxMarksConfig) {
      return res.status(404).json({
        success: false,
        message:
          "Max Marks Configuration not found for this class/section/exam.",
      });
    }

    // ✅ Step 2: Process subjects with new Term structure
    const processedSubjects = value.subjects.map((sub) => {
      const config = maxMarksConfig.subjects.find(
        (s) => s.subjectId.toString() === sub.subjectId
      );

      if (!config) {
        throw new Error(
          `No Max Marks configuration found for subject ID: ${sub.subjectId}`
        );
      }

      const marksObtained = (sub.Term1?.obtained || 0) + (sub.Term2?.obtained || 0) + (sub.Term3?.obtained || 0);
      const totalMaxMarks = (config.Term1?.max || 0) + (config.Term2?.max || 0) + (config.Term3?.max || 0);

      return {
        ...sub,
        Term1: { max: config.Term1?.max || 0, obtained: sub.Term1?.obtained || 0 },
        Term2: { max: config.Term2?.max || 0, obtained: sub.Term2?.obtained || 0 },
        Term3: { max: config.Term3?.max || 0, obtained: sub.Term3?.obtained || 0 },
        marksObtained,
        totalMaxMarks,
        passingMarks: config.passingMarks,
      };
    });
    value.subjects = processedSubjects;

    // ✅ Step 3: Validate subject marks with new config
    for (const sub of value.subjects) {
      const { isValid, errors } = validateSubjectMarks(
        sub.marksObtained,
        sub.totalMaxMarks,
        sub.passingMarks
      );
      if (!isValid) {
        return res
          .status(400)
          .json({ success: false, message: `Subject ${sub.subjectName}: ${errors.join(", ")}` });
      }
    }

    // ✅ Step 4: Compute grades, totals, and status
    const { subjectsWithGrades, totals, overallGrade, status } =
      buildComputedFields(value.subjects);

    // ✅ Step 5: Upsert Marksheet (allow admin to change numbers anytime)
    const baseQuery = {
      schoolId,
      session: value.session,
      classId: value.classId,
      sectionId: value.sectionId,
      examId: value.examId,
      studentId: value.studentId,
    };

    const existing = await Marksheet.findOne(baseQuery);
    if (existing) {
      const updated = await Marksheet.findByIdAndUpdate(
        existing._id,
        {
          ...baseQuery,
          totalMaxMarks: totals.totalMaxMarks,
          totalObtained: totals.totalObtained,
          percentage: totals.percentage,
          grade: overallGrade,
          remarks: value.remarks,
          status,
          subjects: subjectsWithGrades,
          updatedBy: createdBy,
        },
        { new: true, runValidators: true }
      );
      return res.status(200).json({ success: true, data: updated, upserted: true });
    } else {
      const marksheet = new Marksheet({
        ...baseQuery,
        totalMaxMarks: totals.totalMaxMarks,
        totalObtained: totals.totalObtained,
        percentage: totals.percentage,
        grade: overallGrade,
        remarks: value.remarks,
        status,
        subjects: subjectsWithGrades,
        createdBy,
      });
      await marksheet.save();
      return res.status(201).json({ success: true, data: marksheet });
    }
  } catch (err) {
    console.error("❌ Error creating marksheet:", err);
    const status = err?.code === 11000 ? 409 : 500;
    return res
      .status(status)
      .json({ success: false, message: err.message || "Server Error" });
  }
};

exports.getMarksheetById = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.decodedToken?.schoolId;
    const doc = await Marksheet.findOne({ _id: id, schoolId })
      .populate('studentId')
      .populate('classId')
      .populate('sectionId')
      .populate('examId');
    if (!doc) return res.status(404).json({ success: false, message: 'Marksheet not found' });
    return res.json({ success: true, data: doc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.listMarksheets = async (req, res) => {
  try {
    const schoolId = req.decodedToken?.schoolId;
    const { classId, studentId, examId, session, page = 1, limit = 20 } = req.query;

    const query = { schoolId };
    if (classId) query.classId = classId;
    if (studentId) query.studentId = studentId;
    if (examId) query.examId = examId;
    if (session) query.session = session;

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Marksheet.find(query)
        .populate('studentId')
        .populate('classId')
        .populate('sectionId')
        .populate('examId')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Marksheet.countDocuments(query)
    ]);

    return res.json({ success: true, data: items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateMarksheet = async (req, res) => {
  try {
    const { id } = req.params;
    const { error, value } = marksheetSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });

    // Recalculate totals and grades using configured max marks to avoid client tampering
    const schoolId = req.decodedToken?.schoolId || req.body.schoolId;
    const maxMarksConfig = await MaxMarksConfig.findOne({
      schoolId,
      examId: value.examId,
      classId: value.classId,
      sectionId: value.sectionId,
    });
    if (!maxMarksConfig) {
      return res.status(404).json({ success: false, message: 'Max Marks Configuration not found for this class/section/exam.' });
    }

    const processedSubjects = value.subjects.map((sub) => {
      const config = maxMarksConfig.subjects.find((s) => s.subjectId.toString() === sub.subjectId);
      if (!config) {
        throw new Error(`No Max Marks configuration found for subject ID: ${sub.subjectId}`);
      }
      const marksObtained = (sub.Term1?.obtained || 0) + (sub.Term2?.obtained || 0) + (sub.Term3?.obtained || 0);
      const totalMaxMarks = (config.Term1?.max || 0) + (config.Term2?.max || 0) + (config.Term3?.max || 0);
      return {
        ...sub,
        Term1: { max: config.Term1?.max || 0, obtained: sub.Term1?.obtained || 0 },
        Term2: { max: config.Term2?.max || 0, obtained: sub.Term2?.obtained || 0 },
        Term3: { max: config.Term3?.max || 0, obtained: sub.Term3?.obtained || 0 },
        marksObtained,
        totalMaxMarks,
        passingMarks: config.passingMarks,
      };
    });
    value.subjects = processedSubjects;

    // Validate subject marks
    for (const sub of value.subjects) {
      const { isValid, errors } = validateSubjectMarks(sub.marksObtained, sub.totalMaxMarks, sub.passingMarks);
      if (!isValid) {
        return res.status(400).json({ success: false, message: `Subject ${sub.subjectName}: ${errors.join(', ')}` });
      }
    }

    const { subjectsWithGrades, totals, overallGrade, status } = buildComputedFields(value.subjects);

    const updated = await Marksheet.findByIdAndUpdate(
      id,
      {
        session: value.session,
        classId: value.classId,
        sectionId: value.sectionId,
        examId: value.examId,
        studentId: value.studentId,
        totalMaxMarks: totals.totalMaxMarks,
        totalObtained: totals.totalObtained,
        percentage: totals.percentage,
        grade: overallGrade,
        remarks: value.remarks,
        status,
        subjects: subjectsWithGrades,
        updatedBy: req.decodedToken?.id
      },
      { new: true, runValidators: true }
    );

    if (!updated) return res.status(404).json({ success: false, message: 'Marksheet not found' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteMarksheet = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Marksheet.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Marksheet not found' });
    return res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

exports.generateMarksheetPDF = async (req, res) => {
  try {
    const { id } = req.params;
    const schoolId = req.decodedToken?.schoolId;
    const doc = await Marksheet.findOne({ _id: id, schoolId })
      .populate('studentId')
      .populate('classId')
      .populate('sectionId')
      .populate('examId');
    if (!doc) return res.status(404).json({ success: false, message: 'Marksheet not found' });

    // Fetch school for template/name & assets
    const school = await School.findById(schoolId);
    const schoolName = school?.name || 'SCHOOL NAME';
    const assets = school?.assets || {};

    // Helper to convert '/uploads/..' to local file path
    const toLocalPath = (urlPath) => {
      if (!urlPath) return null;
      const cleaned = urlPath.replace(/^\//, '');
      return path.join(__dirname, '..', cleaned);
    };

    const pdf = new PDFDocument({ 
      margin: 50,
      size: 'A4',
      bufferPages: true
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=marksheet-${doc.studentId?.name?.replace(/\s+/g, '_')}-${doc._id}.pdf`);
    pdf.pipe(res);

    // Page dimensions
    const pageWidth = pdf.page.width;
    const margin = 50;
    const contentWidth = pageWidth - (margin * 2);

    // Colors
    const primaryColor = '#1e40af'; // Blue-800
    const secondaryColor = '#374151'; // Gray-700
    const lightGray = '#f3f4f6'; // Gray-100
    const darkGray = '#111827'; // Gray-900

    // Header Section: use image if provided, else colored banner
    const headerImagePath = toLocalPath(assets.headerImage);
    if (headerImagePath && fs.existsSync(headerImagePath)) {
      try {
        pdf.image(headerImagePath, margin, margin, { width: contentWidth, height: 120, align: 'center' });
      } catch (_) {
        pdf.rect(margin, margin, contentWidth, 120).fillAndStroke(primaryColor, primaryColor);
      }
    } else {
      pdf.rect(margin, margin, contentWidth, 120).fillAndStroke(primaryColor, primaryColor);
    }

    // School Name Header
    pdf.fillColor('white')
       .fontSize(24)
       .font('Helvetica-Bold')
       .text(schoolName, margin + 20, margin + 20, { 
         width: contentWidth - 40, 
         align: 'center' 
       });

    pdf.fontSize(12)
       .font('Helvetica')
       .text('INTERNET GENERATED COPY', margin + 20, margin + 50, { 
         width: contentWidth - 40, 
         align: 'center' 
       });

    // MARKSHEET Title
    pdf.fontSize(28)
       .font('Helvetica-Bold')
       .text('MARKSHEET', margin + 20, margin + 75, { 
         width: contentWidth - 40, 
         align: 'center' 
       });

    // Student Information Section
    let currentY = margin + 190;
    
    // Left side - Student Info
    pdf.fillColor(darkGray)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text(`Student: ${doc.studentId?.name || 'N/A'}`, margin, currentY);
    
    pdf.fontSize(10)
       .font('Helvetica')
       .text(`Roll No: ${doc.studentId?.rollNumber || 'N/A'}`, margin, currentY + 20);
    
    pdf.text(`Class: ${doc.classId?.className || 'N/A'}`, margin, currentY + 35);
    pdf.text(`Section: ${doc.sectionId?.name || doc.sectionId?.sectionName || 'N/A'}`, margin, currentY + 50);

    // Right side - Date and Session
    const rightX = margin + contentWidth - 150;
    pdf.text(`Date: ${new Date().toLocaleDateString()}`, rightX, currentY);
    pdf.text(`Exam: ${doc.examId?.examName || doc.examId?.title || 'N/A'}`, rightX, currentY + 20);
    pdf.text(`Session: ${doc.session}`, rightX, currentY + 35);

    // Subjects Table
    currentY += 90;
    
    // Table Header
    const tableStartY = currentY;
    const rowHeight = 25;
    const colWidths = [200, 80, 80, 80, 60]; // Subject, Max Marks, Pass Marks, Obtained, Grade
    let currentX = margin;

    // Header background
    pdf.rect(margin, currentY, contentWidth, rowHeight)
       .fillAndStroke(primaryColor, primaryColor);

    // Header text
    pdf.fillColor('white')
       .fontSize(11)
       .font('Helvetica-Bold');

    const headers = ['Subject', 'Max Marks', 'Pass Marks', 'Obtained', 'Grade'];
    headers.forEach((header, i) => {
      pdf.text(header, currentX + 10, currentY + 8, { 
        width: colWidths[i] - 20, 
        align: 'center' 
      });
      currentX += colWidths[i];
    });

    currentY += rowHeight;

    // Table Rows
    pdf.fillColor(darkGray)
       .fontSize(10)
       .font('Helvetica');

    doc.subjects.forEach((subject, index) => {
      currentX = margin;
      
      // Alternating row colors
      if (index % 2 === 0) {
        pdf.rect(margin, currentY, contentWidth, rowHeight)
           .fillAndStroke(lightGray, '#e5e7eb');
      } else {
        pdf.rect(margin, currentY, contentWidth, rowHeight)
           .fillAndStroke('white', '#e5e7eb');
      }

      pdf.fillColor(darkGray);

      // Subject name
      pdf.text(subject.subjectName || 'N/A', currentX + 10, currentY + 8, { 
        width: colWidths[0] - 20, 
        align: 'left' 
      });
      currentX += colWidths[0];

      // Max marks
      pdf.text(String(subject.totalMaxMarks ?? ((subject.Term1?.max || 0) + (subject.Term2?.max || 0) + (subject.Term3?.max || 0))), currentX + 10, currentY + 8, { 
        width: colWidths[1] - 20, 
        align: 'center' 
      });
      currentX += colWidths[1];

      // Pass marks
      pdf.text(String(subject.passingMarks), currentX + 10, currentY + 8, { 
        width: colWidths[2] - 20, 
        align: 'center' 
      });
      currentX += colWidths[2];

      // Obtained marks
      pdf.text(String(subject.marksObtained), currentX + 10, currentY + 8, { 
        width: colWidths[3] - 20, 
        align: 'center' 
      });
      currentX += colWidths[3];

      // Grade
      pdf.text(subject.grade || 'N/A', currentX + 10, currentY + 8, { 
        width: colWidths[4] - 20, 
        align: 'center' 
      });

      currentY += rowHeight;
    });

    // Summary Section
    currentY += 30;
    
    // Summary box
    pdf.rect(margin, currentY, contentWidth, 80)
       .fillAndStroke(lightGray, '#d1d5db');

    pdf.fillColor(darkGray)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('SUMMARY', margin + 20, currentY + 15);

    // Summary details in two columns
    const summaryLeftX = margin + 20;
    const summaryRightX = margin + contentWidth/2 + 20;
    const summaryY = currentY + 35;

    pdf.fontSize(11)
       .font('Helvetica')
       .text(`Total: ${doc.totalObtained}/${doc.totalMaxMarks}`, summaryLeftX, summaryY);
    
    pdf.text(`Percentage: ${doc.percentage}%`, summaryLeftX, summaryY + 20);

    pdf.text(`Grade: ${doc.grade}`, summaryRightX, summaryY);
    
    // Status with color coding
    const statusColor = doc.status === 'PASS' ? '#059669' : '#dc2626'; // Green or Red
    pdf.fillColor(statusColor)
       .font('Helvetica-Bold')
       .text(`Status: ${doc.status}`, summaryRightX, summaryY + 20);

    // Remarks if available
    if (doc.remarks) {
      currentY += 100;
      pdf.fillColor(darkGray)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Remarks:', margin, currentY);
      
      pdf.fontSize(10)
         .font('Helvetica')
         .text(doc.remarks, margin, currentY + 20, { 
           width: contentWidth, 
           align: 'left' 
         });
    }

    // Footer Note
    const footerY = pdf.page.height - 100;
    
    pdf.rect(margin, footerY, contentWidth, 60)
       .fillAndStroke('#fef3c7', '#f59e0b'); // Yellow background with orange border

    pdf.fillColor('#92400e') // Dark yellow text
       .fontSize(9)
       .font('Helvetica-Bold')
       .text('Note: University does not own for the errors or omissions, if any, in this statement.', 
             margin + 10, footerY + 15, { 
               width: contentWidth - 20, 
               align: 'center' 
             });
    
    pdf.text('Correction, if any to be reported within 7 days of publication of Result.', 
             margin + 10, footerY + 35, { 
               width: contentWidth - 20, 
               align: 'center' 
             });

    pdf.end();
  } catch (err) {
    console.error('PDF Generation Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Utility endpoint for quick checks
exports.debug = async (req, res) => {
  return res.json({ success: true, message: 'Marksheet API is reachable' });
};

exports.getMaxMarksConfig = async (req, res) => {
  try {
    const { examId, classId, sectionId } = req.query; // Changed to req.query
    const schoolId = req.decodedToken?.schoolId;

    if (!examId || !classId) {
      return res.status(400).json({
        success: false,
        message: "examId and classId are required"
      });
    }

    const config = await MaxMarksConfig.findOne({
      schoolId,
      examId,
      classId,
      ...(sectionId && { sectionId })
    }).populate("subjects.subjectId");

    if (!config) {
      return res.status(200).json({
        success: true,
        data: [],
        examId,
        classId,
        sectionId: sectionId || null
      });
    }

    const data = config.subjects.map((sub) => ({
      subjectId: sub.subjectId?._id,
      subjectName: sub.subjectId?.subjectName || "Unknown Subject",
      Term1: sub.Term1,
      Term2: sub.Term2,
      Term3: sub.Term3,
      passingMarks: sub.passingMarks,
    }));

    return res.status(200).json({
      success: true,
      data,
      examId,
      classId,
      sectionId: sectionId || null
    });
  } catch (error) {
    console.error("❌ Error in getMaxMarksConfig:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};

// Create or Update MaxMarksConfig
exports.createMaxMarksConfig = async (req, res) => {
  try {
    const { examId, classId, sectionId, subjects } = req.body;
    const schoolId = req.decodedToken?.schoolId;

    if (!examId || !classId || !subjects || !Array.isArray(subjects)) {
      return res.status(400).json({
        success: false,
        message: "examId, classId, and subjects array are required"
      });
    }

    // Validate subjects
    for (const subject of subjects) {
      if (!subject.subjectId) {
        return res.status(400).json({
          success: false,
          message: "Each subject must have a subjectId"
        });
      }
      if (subject.passingMarks === undefined || subject.passingMarks === null) {
        return res.status(400).json({
          success: false,
          message: "Each subject must have passingMarks"
        });
      }
    }

    // Create or update MaxMarksConfig (upsert)
    const config = await MaxMarksConfig.findOneAndUpdate(
      {
        schoolId,
        examId,
        classId,
        ...(sectionId && { sectionId })
      },
      {
        schoolId,
        examId,
        classId,
        sectionId: sectionId || null,
        subjects: subjects.map(sub => ({
          subjectId: sub.subjectId,
          Term1: sub.Term1 || { i: 0, ii: 0, max: 0 },
          Term2: sub.Term2 || { i: 0, ii: 0, max: 0 },
          Term3: sub.Term3 || { i: 0, ii: 0, max: 0 },
          passingMarks: sub.passingMarks
        }))
      },
      {
        upsert: true,
        new: true,
        runValidators: true
      }
    );

    return res.status(200).json({
      success: true,
      message: "Max Marks Configuration created/updated successfully",
      data: config
    });
  } catch (error) {
    console.error("❌ Error in createMaxMarksConfig:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message
    });
  }
};



