// controllers/studentFeeController.js
const mongoose = require('mongoose');
const Student = require('../models/studentModel'); // assume exists
const StudentFee = require('../models/studentFeeModel');
const FeeStructure = require('../models/feeStructureModel');
const Session = require('../models/sessionModel');

// Utils / services (you should have these implemented)
const { generateReceiptPDF, generateReportPDF } = require('../services/pdfService');
const {
  sendEmailNotification,
  sendSmsNotification,
  sendWhatsAppNotification
} = require('../services/notificationService');

// Helper to compute accrued late fee for a StudentFee record as of now
const computeAccruedLateFee = (feeDoc) => {
  try {
    if (!feeDoc?.lateFeeEnabled) return 0;
    const dueDate = feeDoc?.dueDate ? new Date(feeDoc.dueDate) : null;
    if (!dueDate || isNaN(dueDate.getTime())) return 0;
    const capDays = Number(feeDoc.lateFeeGraceDays || 0);
    const perDay = Number(feeDoc.lateFeePerDay || 0);
    if (perDay <= 0) return 0;
    const today = new Date();
    const ms = today.setHours(0,0,0,0) - new Date(dueDate.setHours(0,0,0,0)).getTime();
    const daysLate = Math.floor(ms / (24 * 60 * 60 * 1000));
    if (daysLate <= 0) return 0;
    const chargeDays = capDays > 0 ? Math.min(daysLate, capDays) : daysLate;
    return chargeDays * perDay;
  } catch (e) {
    return 0;
  }
};

//////////////////////
// Assign Student Fee
//////////////////////
const assignStudentFee = async (req, res) => {
  try {
    const { schoolId, studentId, classId, academicYear, feeStructureId } = req.body;
    const createdBy = req.user?._id || null;

    // required fields
    if (!schoolId || !classId || !academicYear || !feeStructureId) {
      return res.status(400).json({ success: false, message: "Missing required fields: schoolId, classId, academicYear, feeStructureId" });
    }

    // validate fee structure
    const feeStructure = await FeeStructure.findById(feeStructureId);
    if (!feeStructure) return res.status(404).json({ success: false, message: 'FeeStructure not found' });

    const totalAmount = feeStructure.totalAmount ?? feeStructure.total ?? 0;
    const dueDate = feeStructure.dueDate || null;
    const lateFeeEnabled = !!feeStructure.lateFeeEnabled;
    const lateFeePerDay = Number(feeStructure.lateFeePerDay || 10);
    const lateFeeGraceDays = Number(feeStructure.lateFeeGraceDays || 0);

    let academicYearValue = academicYear;
    if (mongoose.Types.ObjectId.isValid(academicYear)) {
      try {
        const sessionDoc = await Session.findById(academicYear).lean();
        if (sessionDoc?.yearRange) academicYearValue = sessionDoc.yearRange;
      } catch (e) {}
    }

    // CASE A: single student assignment (if studentId is provided)
    if (studentId) {
      try {
        const payload = {
          schoolId, studentId, classId, academicYear, feeStructureId,
          dueDate, lateFeeEnabled, lateFeePerDay, lateFeeGraceDays,
          totalFee: totalAmount, paidAmount: 0, dueAmount: totalAmount, status: 'Due', createdBy
        };
        payload.academicYear = academicYearValue;

        const created = await StudentFee.create(payload);
        return res.status(201).json({ success: true, message: 'Fee assigned to student', data: created });
      } catch (err) {
        // duplicate key (unique index) handling
        if (err.code === 11000) {
          return res.status(409).json({ success: false, message: 'Fee already assigned for this student in this academic year' });
        }
        throw err;
      }
    }

    // CASE B: bulk assign to all students in class
    const students = await Student.find({ schoolId, classId }).select('_id').lean();
    if (!students || students.length === 0) {
      return res.status(404).json({ success: false, message: 'No students found in this class' });
    }

    const bulkDocs = students.map(s => ({
      schoolId,
      studentId: s._id,
      classId,
      academicYear: academicYearValue,
      feeStructureId,
      dueDate, lateFeeEnabled, lateFeePerDay, lateFeeGraceDays,
      totalFee: totalAmount,
      paidAmount: 0,
      dueAmount: totalAmount,
      status: 'Due',
      createdBy
    }));

    // insertMany with ordered:false so duplicates don't abort the whole operation
    try {
      const created = await StudentFee.insertMany(bulkDocs, { ordered: false });
      const assignedCount = Array.isArray(created) ? created.length : 0;
      return res.status(201).json({
        success: true,
        message: `Assigned fee structure to ${assignedCount} students (duplicates skipped)`,
        assignedCount
      });
    } catch (err) {
      // If there are duplicate key errors, insertMany with ordered:false still throws a BulkWriteError,
      // but some docs will be inserted. We can parse the error to return the number inserted.
      if (err.code === 11000 || err.name === 'BulkWriteError') {
        // Count how many exist now for this feeStructure + academicYear + class
        const existingCount = await StudentFee.countDocuments({
          schoolId, classId, academicYear, feeStructureId
        });
        const totalStudents = students.length;
        const newlyAssigned = Math.max(0, totalStudents - existingCount);
        return res.status(201).json({
          success: true,
          message: `Assigned fee structure to ${newlyAssigned} new students. ${existingCount} were already assigned.`,
          assignedCount: newlyAssigned,
          alreadyAssignedCount: existingCount
        });
      }
      throw err;
    }

  } catch (error) {
    console.error("assignStudentFee error:", error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

//////////////////////
// Add Student Payment
//////////////////////
const addStudentPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { studentFeeId } = req.params;
    const { amount, paymentMode, remark } = req.body;

    if (!amount || isNaN(amount) || amount <= 0) {
      throw new Error('Invalid payment amount');
    }

    const validModes = ['Cash', 'Cheque', 'UPI', 'Online'];
    if (!validModes.includes(paymentMode)) {
      throw new Error(`Invalid payment mode. Valid modes: ${validModes.join(', ')}`);
    }

    const studentFee = await StudentFee.findById(studentFeeId).session(session);
    if (!studentFee) throw new Error('Student fee record not found');

    const totalPrincipal = Number(studentFee.totalFee || 0);
    const accruedLate = computeAccruedLateFee(studentFee);
    const alreadyPaidLate = Number(studentFee.lateFeePaid || 0);
    const outstandingLate = Math.max(0, accruedLate - alreadyPaidLate);
    const outstandingPrincipal = Math.max(0, Number(studentFee.dueAmount || 0));

    const maxPayable = outstandingPrincipal + outstandingLate;
    if (Number(amount) > maxPayable) {
      throw new Error(`Payment exceeds outstanding amount (incl. late fee). Maximum allowed: ${maxPayable}`);
    }

    // Allocate payment: late fee first, then principal
    let remaining = Number(amount);
    let lateFeeComponent = 0;
    if (outstandingLate > 0) {
      lateFeeComponent = Math.min(remaining, outstandingLate);
      studentFee.lateFeePaid = alreadyPaidLate + lateFeeComponent;
      remaining -= lateFeeComponent;
    }
    if (remaining > 0) {
      const principalComponent = Math.min(remaining, outstandingPrincipal);
      studentFee.paidAmount = Number(studentFee.paidAmount || 0) + principalComponent;
      studentFee.dueAmount = Math.max(0, totalPrincipal - studentFee.paidAmount);
      remaining -= principalComponent;
    }

    // Re-evaluate status after allocation
    const newAccruedLate = computeAccruedLateFee(studentFee);
    const newOutstandingLate = Math.max(0, newAccruedLate - Number(studentFee.lateFeePaid || 0));
    const totalOutstandingAfter = Number(studentFee.dueAmount || 0) + newOutstandingLate;
    studentFee.status = totalOutstandingAfter === 0 ? 'Paid' : (studentFee.paidAmount > 0 ? 'Partially Paid' : 'Due');

    const { generateUniqueReceiptNumber } = require('../services/pdfService'); // Added this line
    const receiptNumber = generateUniqueReceiptNumber();
    const payment = {
      amount: Number(amount),
      mode: paymentMode,
      date: new Date(),
      receiptNumber,
      receivedBy: req.user?._id,
      remark,
      lateFeeComponent
    };

    studentFee.payments.push(payment);
    await studentFee.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      data: {
        payment,
        newBalance: {
          paidAmount: studentFee.paidAmount,
          dueAmount: studentFee.dueAmount,
          status: studentFee.status,
          lateFeeDue: newOutstandingLate,
          totalDueWithLate: totalOutstandingAfter
        }
      }
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error("addStudentPayment error:", err);
    return res.status(400).json({ success: false, message: err.message || 'Payment failed' });
  }
};

//////////////////////
// Get Student Fees (student ledger)
//////////////////////
const getStudentFees = async (req, res) => {
  try {
    const { studentId } = req.params;
    const schoolId = req.headers['school-id'] || req.query.schoolId;
    if (!schoolId) return res.status(400).json({ success: false, message: 'School ID is required in headers or query' });

    const fees = await StudentFee.find({ studentId, schoolId })
      .populate('feeStructureId')
      .populate('classId', 'className section')
      .sort({ academicYear: -1 });

    const mapped = fees.map(f => {
      const obj = f.toObject();
      const accrued = computeAccruedLateFee(f);
      const latePaid = Number(f.lateFeePaid || 0);
      const lateFeeDue = Math.max(0, accrued - latePaid);
      return {
        ...obj,
        lateFeeDue,
        totalDueWithLate: Number(f.dueAmount || 0) + lateFeeDue,
      };
    });

    return res.json({ success: true, data: mapped, count: mapped.length });
  } catch (err) {
    console.error("getStudentFees error:", err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve fee records' });
  }
};

//////////////////////
// Get All Student Fees (admin)
//////////////////////
const getAllStudentFees = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { classId, academicYear, status, studentId } = req.query; // Get all filter parameters
    if (!schoolId) return res.status(400).json({ success: false, message: 'schoolId is required in URL param' });

    const filter = { schoolId };
    if (classId) filter.classId = classId;
    if (academicYear) {
      if (mongoose.Types.ObjectId.isValid(academicYear)) {
        try {
          const sessionDoc = await Session.findById(academicYear).lean();
          const candidates = [academicYear, sessionDoc?.yearRange].filter(Boolean);
          if (candidates.length === 1) {
            filter.academicYear = candidates[0];
          } else if (candidates.length > 1) {
            filter.$or = candidates.map(v => ({ academicYear: v }));
          }
        } catch (e) {
          filter.academicYear = academicYear;
        }
      } else {
        filter.academicYear = academicYear;
      }
    }
    if (status) filter.status = status;
    if (studentId) filter.studentId = studentId;

    const fees = await StudentFee.find(filter)
      .populate({
        path: 'studentId',
        // Include name for schemas that use a single name field, and keep first/last for compatibility
        select: 'name firstName lastName admissionNumber rollNumber'
      })
      .populate({
        path: 'feeStructureId',
        select: 'name'
      })
      .populate({
        path: 'classId',
        select: 'className'
      })
      .sort({ academicYear: -1, 'studentId.firstName': 1 });

    const mapped = fees.map(f => {
      const obj = f.toObject();
      const accrued = computeAccruedLateFee(f);
      const latePaid = Number(f.lateFeePaid || 0);
      const lateFeeDue = Math.max(0, accrued - latePaid);
      return {
        ...obj,
        lateFeeDue,
        totalDueWithLate: Number(f.dueAmount || 0) + lateFeeDue,
      };
    });

    return res.json({ success: true, data: mapped, count: mapped.length });
  } catch (err) {
    console.error("getAllStudentFees error:", err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve fee records' });
  }
};

//////////////////////
// Generate Receipt PDF
//////////////////////
const generateReceiptPdf = async (req, res) => {
  try {
    const { studentFeeId, receiptNumber } = req.params;

    const feeRecord = await StudentFee.findOne({
      _id: studentFeeId,
      'payments.receiptNumber': receiptNumber
    })
    .populate({
      path: 'studentId',
      select: 'name firstName lastName rollNumber sectionName section sectionId admissionNumber scholarNumber applicationNumber',
      populate: { path: 'sectionId', select: 'name' }
    })
    .populate({
      path: 'classId',
      select: 'className section'
    })
    .populate({
      path: 'feeStructureId',
      select: 'name components totalAmount frequency' // Explicitly select fields needed for receipt
    })
    .populate({
      path: 'schoolId',
      select: 'schoolName city branchName logoUrl'
    })
    .populate({
      path: 'payments.receivedBy',
      select: 'name'
    });

    if (!feeRecord) return res.status(404).json({ success: false, message: 'Fee record or receipt not found' });

    const payment = feeRecord.payments.find(p => p.receiptNumber === receiptNumber);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment not found for the given receipt number' });

    const pdfData = {
      _id: feeRecord._id,
      student: {
        firstName: feeRecord.studentId?.firstName || '',
        lastName: feeRecord.studentId?.lastName || '',
        fullName: feeRecord.studentId?.name || `${feeRecord.studentId?.firstName || ''} ${feeRecord.studentId?.lastName || ''}`.trim(),
        rollNumber: feeRecord.studentId?.rollNumber || '',
        srNumber: feeRecord.studentId?.admissionNumber || feeRecord.studentId?.scholarNumber || feeRecord.studentId?.applicationNumber || ''
      },
      class: {
        className: feeRecord.classId?.className || '',
        section: feeRecord.classId?.section || feeRecord.studentId?.sectionName || feeRecord.studentId?.section || feeRecord.studentId?.sectionId?.name || ''
      },
      academicYear: feeRecord.academicYear,
      totalFee: feeRecord.totalFee,
      amountPaid: feeRecord.paidAmount,
      balance: feeRecord.dueAmount,
      status: feeRecord.status,
      paymentHistory: feeRecord.payments,
      feeStructureName: feeRecord.feeStructureId?.name || '',
      feeComponents: Array.isArray(feeRecord.feeStructureId?.components) ? feeRecord.feeStructureId.components : [],
      feeFrequency: feeRecord.feeStructureId?.frequency || '',
      schoolName: feeRecord.schoolId?.schoolName || '',
      schoolCity: feeRecord.schoolId?.city || '',
      branchName: feeRecord.schoolId?.branchName || feeRecord.schoolId?.schoolName || '',
      schoolLogoUrl: feeRecord.schoolId?.logoUrl || null
    };

    const buffer = await generateReceiptPDF(pdfData, payment);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=receipt-${receiptNumber}.pdf`);
    return res.send(buffer);
  } catch (err) {
    console.error("generateReceiptPdf error:", err);
    return res.status(500).json({ success: false, message: 'Failed to generate receipt PDF' });
  }
};

//////////////////////
// Reports & Notifications
//////////////////////

const getFeeDefaulters = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { classId, academicYear } = req.query;
    if (!schoolId) return res.status(400).json({ success: false, message: 'schoolId required' });

    const filter = { schoolId, dueAmount: { $gt: 0 } };
    if (classId) filter.classId = classId;
    if (academicYear) {
      if (mongoose.Types.ObjectId.isValid(academicYear)) {
        try {
          const sessionDoc = await Session.findById(academicYear).lean();
          const candidates = [academicYear, sessionDoc?.yearRange].filter(Boolean);
          if (candidates.length === 1) {
            filter.academicYear = candidates[0];
          } else if (candidates.length > 1) {
            filter.$or = candidates.map(v => ({ academicYear: v }));
          }
        } catch (e) {
          filter.academicYear = academicYear;
        }
      } else {
        filter.academicYear = academicYear;
      }
    }

    const defaulters = await StudentFee.find(filter)
      .populate('studentId', 'name firstName lastName admissionNumber contactNo email parentId')
      .populate('classId', 'className')
      .populate('feeStructureId', 'name totalAmount')
      .sort({ academicYear: -1, 'studentId.firstName': 1 });

    return res.json({ success: true, data: defaulters, count: defaulters.length });
  } catch (err) {
    console.error("getFeeDefaulters error:", err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve defaulters' });
  }
};

const getMonthlyCollectionSummary = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;
    if (!schoolId) return res.status(400).json({ success: false, message: 'schoolId required' });

    const filter = { schoolId };
    if (academicYear) {
      if (mongoose.Types.ObjectId.isValid(academicYear)) {
        try {
          const sessionDoc = await Session.findById(academicYear).lean();
          const candidates = [academicYear, sessionDoc?.yearRange].filter(Boolean);
          if (candidates.length === 1) {
            filter.academicYear = candidates[0];
          } else if (candidates.length > 1) {
            filter.$or = candidates.map(v => ({ academicYear: v }));
          }
        } catch (e) {
          filter.academicYear = academicYear;
        }
      } else {
        filter.academicYear = academicYear;
      }
    }

    const monthlySummary = await StudentFee.aggregate([
      { $match: filter },
      { $unwind: '$payments' },
      {
        $group: {
          _id: { year: { $year: '$payments.date' }, month: { $month: '$payments.date' } },
          totalCollected: { $sum: '$payments.amount' }
        }
      },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', totalCollected: 1 } },
      { $sort: { year: 1, month: 1 } }
    ]);

    return res.json({ success: true, data: monthlySummary, count: monthlySummary.length });
  } catch (err) {
    console.error("getMonthlyCollectionSummary error:", err);
    return res.status(500).json({ success: false, message: 'Failed to get monthly summary' });
  }
};

const sendDueFeeNotifications = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear, classId, notificationType } = req.body;
    if (!schoolId || !notificationType) return res.status(400).json({ success: false, message: 'schoolId & notificationType required' });

    const filter = { schoolId, dueAmount: { $gt: 0 } };
    if (academicYear) filter.academicYear = academicYear;
    if (classId) filter.classId = classId;

    const defaulters = await StudentFee.find(filter)
      .populate('studentId', 'name firstName lastName contactNo email parentId')
      .populate('classId', 'className section');
    if (!defaulters.length) return res.json({ success: true, message: 'No defaulters to notify' });

    const results = [];
    let successCount = 0, failCount = 0;

    for (const d of defaulters) {
      const studentName = d.studentId?.name || `${d.studentId?.firstName || ''} ${d.studentId?.lastName || ''}`.trim();
      const message = `Dear ${studentName}, your fee of ₹${d.dueAmount} for academic year ${d.academicYear} is due. Please pay ASAP.`;

      let result = { success: false, message: 'No contact' };
      if (notificationType === 'email' && d.studentId.email) result = await sendEmailNotification(d.studentId.email, 'Fee Due Reminder', message, `<p>${message}</p>`);
      else if (notificationType === 'sms' && d.studentId.contactNo) result = await sendSmsNotification(d.studentId.contactNo, message);
      else if (notificationType === 'whatsapp' && d.studentId.contactNo) result = await sendWhatsAppNotification(d.studentId.contactNo, message);

      if (result.success) successCount++; else failCount++;
      results.push({ student: studentName, status: result.success ? 'Success' : 'Failed', message: result.message });
    }

    return res.json({ success: true, message: `Notifications sent: ${successCount} success, ${failCount} failed`, results });
  } catch (err) {
    console.error("sendDueFeeNotifications error:", err);
    return res.status(500).json({ success: false, message: 'Failed to send notifications' });
  }
};

const generateMonthlyCollectionPdf = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;
    const filter = { schoolId };
    if (academicYear) {
      if (mongoose.Types.ObjectId.isValid(academicYear)) {
        try {
          const sessionDoc = await Session.findById(academicYear).lean();
          const candidates = [academicYear, sessionDoc?.yearRange].filter(Boolean);
          if (candidates.length === 1) {
            filter.academicYear = candidates[0];
          } else if (candidates.length > 1) {
            filter.$or = candidates.map(v => ({ academicYear: v }));
          }
        } catch (e) {
          filter.academicYear = academicYear;
        }
      } else {
        filter.academicYear = academicYear;
      }
    }

    const monthlySummary = await StudentFee.aggregate([
      { $match: filter },
      { $unwind: '$payments' },
      { $group: { _id: { year: { $year: '$payments.date' }, month: { $month: '$payments.date' } }, totalCollected: { $sum: '$payments.amount' } } },
      { $project: { _id: 0, year: '$_id.year', month: '$_id.month', totalCollected: 1 } },
      { $sort: { year: 1, month: 1 } }
    ]);

    const headers = ['year', 'month', 'totalCollected'];
    const pdfBuffer = await generateReportPDF('Monthly Collection Summary', headers, monthlySummary);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=monthly-collection-${schoolId}.pdf`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("generateMonthlyCollectionPdf error:", err);
    return res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
};

const generateFeeDefaultersPdf = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { classId, academicYear } = req.query;
    const filter = { schoolId, dueAmount: { $gt: 0 } };
    if (classId) filter.classId = classId;
    if (academicYear) filter.academicYear = academicYear;

    const defaulters = await StudentFee.find(filter)
      .populate('studentId', 'name firstName lastName admissionNumber contactNo email')
      .populate('classId', 'className')
      .populate('feeStructureId', 'name totalAmount')
      .sort({ academicYear: -1, 'studentId.firstName': 1 });

    const headers = ['Student Name', 'Class', 'Academic Year', 'Fee Structure', 'Due Amount'];
    const rows = defaulters.map(d => [
      (d.studentId?.name || `${d.studentId?.firstName || ''} ${d.studentId?.lastName || ''}`.trim()),
      `${d.classId.className}`,
      d.academicYear,
      d.feeStructureId.name,
      d.dueAmount
    ]);

    const pdfBuffer = await generateReportPDF('Fee Defaulters Report', headers, rows);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=fee-defaulters-${schoolId}.pdf`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("generateFeeDefaultersPdf error:", err);
    return res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
};

const getClassWiseRevenue = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;
    if (!schoolId) return res.status(400).json({ success: false, message: 'schoolId required' });

    const filter = { schoolId };
    if (academicYear) {
      if (mongoose.Types.ObjectId.isValid(academicYear)) {
        try {
          const sessionDoc = await Session.findById(academicYear).lean();
          const candidates = [academicYear, sessionDoc?.yearRange].filter(Boolean);
          if (candidates.length === 1) {
            filter.academicYear = candidates[0];
          } else if (candidates.length > 1) {
            filter.$or = candidates.map(v => ({ academicYear: v }));
          }
        } catch (e) {
          filter.academicYear = academicYear;
        }
      } else {
        filter.academicYear = academicYear;
      }
    }

    const classWiseRevenue = await StudentFee.aggregate([
      { $match: filter },
      { $unwind: '$payments' },
      { $group: { _id: '$classId', totalCollected: { $sum: '$payments.amount' } } },
      {
        $lookup: {
          from: 'classes',
          localField: '_id',
          foreignField: '_id',
          as: 'classDetails'
        }
      },
      { $unwind: '$classDetails' },
      { $project: { _id: 0, classId: '$classDetails._id', className: '$classDetails.className', section: '$classDetails.section', totalCollected: 1 } },
      { $sort: { className: 1, section: 1 } }
    ]);

    return res.json({ success: true, data: classWiseRevenue, count: classWiseRevenue.length });
  } catch (err) {
    console.error("getClassWiseRevenue error:", err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve revenue' });
  }
};

const generateClassWiseRevenuePdf = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;
    const filter = { schoolId }; if (academicYear) filter.academicYear = academicYear;
    if (academicYear) {
      if (mongoose.Types.ObjectId.isValid(academicYear)) {
        try {
          const sessionDoc = await Session.findById(academicYear).lean();
          const candidates = [academicYear, sessionDoc?.yearRange].filter(Boolean);
          if (candidates.length === 1) {
            filter.academicYear = candidates[0];
          } else if (candidates.length > 1) {
            filter.$or = candidates.map(v => ({ academicYear: v }));
          }
        } catch (e) {
          filter.academicYear = academicYear;
        }
      } else {
        filter.academicYear = academicYear;
      }
    }

    const classWiseRevenue = await StudentFee.aggregate([
      { $match: filter },
      { $unwind: '$payments' },
      { $group: { _id: '$classId', totalCollected: { $sum: '$payments.amount' } } },
      { $lookup: { from: 'classes', localField: '_id', foreignField: '_id', as: 'classDetails' } },
      { $unwind: '$classDetails' },
      { $project: { _id: 0, className: '$classDetails.className', section: '$classDetails.section', totalCollected: 1 } },
      { $sort: { className: 1, section: 1 } }
    ]);

    const headers = ['className', 'section', 'totalCollected'];
    const pdfBuffer = await generateReportPDF('Class/Section-wise Revenue Report', headers, classWiseRevenue);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=class-revenue-${schoolId}.pdf`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("generateClassWiseRevenuePdf error:", err);
    return res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
};

const getPendingVsCollectedReport = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;
    if (!schoolId) return res.status(400).json({ success: false, message: 'schoolId required' });

    const filter = { schoolId };
    if (academicYear) {
      if (mongoose.Types.ObjectId.isValid(academicYear)) {
        try {
          const sessionDoc = await Session.findById(academicYear).lean();
          const candidates = [academicYear, sessionDoc?.yearRange].filter(Boolean);
          if (candidates.length === 1) {
            filter.academicYear = candidates[0];
          } else if (candidates.length > 1) {
            filter.$or = candidates.map(v => ({ academicYear: v }));
          }
        } catch (e) {
          filter.academicYear = academicYear;
        }
      } else {
        filter.academicYear = academicYear;
      }
    }

    const report = await StudentFee.aggregate([
      { $match: filter },
      { $group: { _id: null, totalAssigned: { $sum: '$totalFee' }, totalCollected: { $sum: '$paidAmount' }, totalDue: { $sum: '$dueAmount' } } },
      { $project: { _id: 0, totalAssigned: 1, totalCollected: 1, totalDue: 1 } }
    ]);

    return res.json({ success: true, data: report.length > 0 ? report[0] : { totalAssigned: 0, totalCollected: 0, totalDue: 0 } });
  } catch (err) {
    console.error("getPendingVsCollectedReport error:", err);
    return res.status(500).json({ success: false, message: 'Failed to get report' });
  }
};

const generatePendingVsCollectedPdf = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { academicYear } = req.query;
    const filter = { schoolId };
    if (academicYear) {
      if (mongoose.Types.ObjectId.isValid(academicYear)) {
        try {
          const sessionDoc = await Session.findById(academicYear).lean();
          const candidates = [academicYear, sessionDoc?.yearRange].filter(Boolean);
          if (candidates.length === 1) {
            filter.academicYear = candidates[0];
          } else if (candidates.length > 1) {
            filter.$or = candidates.map(v => ({ academicYear: v }));
          }
        } catch (e) {
          filter.academicYear = academicYear;
        }
      } else {
        filter.academicYear = academicYear;
      }
    }

    const report = await StudentFee.aggregate([
      { $match: filter },
      { $group: { _id: null, totalAssigned: { $sum: '$totalFee' }, totalCollected: { $sum: '$paidAmount' }, totalDue: { $sum: '$dueAmount' } } },
      { $project: { _id: 0, totalAssigned: 1, totalCollected: 1, totalDue: 1 } }
    ]);

    const reportData = report.length > 0 ? report[0] : { totalAssigned: 0, totalCollected: 0, totalDue: 0 };
    const formatted = [
      { metric: 'Total Assigned', value: reportData.totalAssigned },
      { metric: 'Total Collected', value: reportData.totalCollected },
      { metric: 'Total Due', value: reportData.totalDue }
    ];

    const headers = ['metric', 'value'];
    const pdfBuffer = await generateReportPDF('Pending vs Collected Report', headers, formatted);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=pending-vs-collected-${schoolId}.pdf`);
    return res.send(pdfBuffer);
  } catch (err) {
    console.error("generatePendingVsCollectedPdf error:", err);
    return res.status(500).json({ success: false, message: 'Failed to generate PDF' });
  }
};

module.exports = {
  assignStudentFee,
  addStudentPayment,
  getStudentFees,
  getAllStudentFees,
  generateReceiptPdf,
  getFeeDefaulters,
  getMonthlyCollectionSummary,
  sendDueFeeNotifications,
  generateMonthlyCollectionPdf,
  getClassWiseRevenue,
  generateClassWiseRevenuePdf,
  getPendingVsCollectedReport,
  generatePendingVsCollectedPdf,
  generateFeeDefaultersPdf // Added this line
};
