// OFFLINE-ONLY Payment Controller

const StudentFee = require('../models/studentFeeModel');
const Student = require('../models/studentModel');
const FeeStructure = require('../models/feeStructureModel');
const Class = require('../models/classModel');
const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const School = require('../models/registarSchoolModel');

// Helper function to generate PDF buffer
const generatePDFBuffer = async (feeRecord, payment, school) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const doc = new PDFDocument({ margin: 40 });

    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // School logo
    if (school.logoUrl) {
      try {
        const logoPath = school.logoUrl.startsWith('uploads/')
          ? school.logoUrl
          : `uploads/schools/${school.logoUrl}`;
        doc.image(logoPath, doc.x, doc.y, { width: 60 });
      } catch (e) {}
    }

    doc.fontSize(18).text(school.schoolName || 'School', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(12).text(school.address || '', { align: 'center' });
    doc.moveDown(1);

    doc.fontSize(16).text('Fee Receipt', { align: 'center', underline: true });
    doc.moveDown(1);

    // Student & Payment Details
    doc.fontSize(12);
    doc.text(`Receipt No: ${payment.transactionId || payment._id}`);
    doc.text(`Date: ${new Date(payment.date).toLocaleDateString()}`);
    doc.text(`Student Name: ${feeRecord.student?.firstName || ''} ${feeRecord.student?.lastName || ''}`);
    doc.text(`Roll No: ${feeRecord.student?.rollNumber || ''}`);
    doc.text(`Class: ${feeRecord.classId?.className || ''} ${feeRecord.classId?.section || ''}`);
    doc.text(`Academic Year: ${feeRecord.academicYear}`);
    doc.moveDown(0.5);

    // Fee Breakdown Table
    doc.font('Helvetica-Bold').text('Fee Breakdown:', { underline: true });
    doc.font('Helvetica');
    let y = doc.y;
    doc.text('Component', 60, y);
    doc.text('Amount', 300, y);
    doc.moveDown(0.2);
    doc.moveTo(60, doc.y).lineTo(500, doc.y).stroke();
    (feeRecord.components || []).forEach(comp => {
      doc.text(comp.name, 60, doc.y);
      doc.text(`₹${comp.amount.toFixed(2)}`, 300, doc.y);
      doc.moveDown(0.1);
    });
    doc.moveDown(0.5);
    doc.text(`Total Fee: ₹${feeRecord.totalFee.toFixed(2)}`);
    doc.text(`Amount Paid (This Payment): ₹${payment.amount.toFixed(2)}`);
    doc.text(`Payment Mode: ${payment.mode}`);
    doc.text(`Total Amount Paid: ₹${feeRecord.amountPaid.toFixed(2)}`);
    doc.text(`Pending Balance: ₹${feeRecord.balance < 0 ? 0 : feeRecord.balance.toFixed(2)}`);
    if (payment.note) doc.text(`Note: ${payment.note}`);
    doc.moveDown(1);

    doc.text('This is a system-generated receipt.', { align: 'center', italics: true });

    doc.end();
  });
};

// Create offline fee payment
exports.createOfflineFeePayment = async (req, res) => {
  try {
    const { studentId, month, year, amountPaid, paymentMethod, note } = req.body;
    const schoolId = req.school._id;
    const paidBy = req.user._id;

    // Validate student exists and belongs to school
    const student = await Student.findOne({ _id: studentId, schoolId });
    if (!student) {
      return res.status(404).json({ message: 'Student not found or does not belong to your school.' });
    }

    // Get student's fee record
    const studentFee = await StudentFee.findOne({
      student: studentId,
      schoolId,
      academicYear: student.academicYear
    });

    if (!studentFee) {
      return res.status(404).json({ message: 'Fee record not found for this student.' });
    }

    // Create payment entry
    const paymentEntry = {
      amount: amountPaid,
      date: new Date(),
      mode: paymentMethod,
      // transactionId: uuidv4(), // Removed uuid usage
      note,
      recordedBy: paidBy
    };

    // Update student fee record
    studentFee.paymentHistory.push(paymentEntry);
    studentFee.amountPaid += amountPaid;
    studentFee.balance = studentFee.totalFee - studentFee.amountPaid;
    studentFee.status = studentFee.balance <= 0 ? 'Paid' : 'Partial';

    // Generate PDF receipt
    const school = await School.findById(schoolId);
    const pdfBuffer = await generatePDFBuffer(studentFee, paymentEntry, school);

    // Upload to Cloudinary (Commented out as local storage is used for receipts)
    // const uploadResult = await cloudinary.uploader.upload_stream({
    //   resource_type: 'raw',
    //   folder: 'fee-receipts',
    //   public_id: `receipt_${studentFee._id}_${paymentEntry.transactionId}`
    // }).end(pdfBuffer);

    // // Save receipt URL
    // paymentEntry.receiptUrl = uploadResult.secure_url;

    // Note: This controller seems to be for a separate offline flow.
    // The main fee management uses the storageService for uploads.
    // To avoid conflicts and ensure the Cloudinary dependency is removed,
    // we will not implement local storage upload here for this specific controller's function.
    // The receipt generation logic in studentFeeController.js already handles this.

    // Save updated student fee record (without Cloudinary URL)
    await studentFee.save();

    res.status(201).json({
      success: true,
      message: 'Payment recorded successfully',
      data: {
        payment: paymentEntry,
        receiptUrl: paymentEntry.receiptUrl
      }
    });

  } catch (error) {
    console.error('Error creating offline payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record payment',
      error: error.message
    });
  }
};

// Generate and download PDF receipt
exports.generateFeeReceiptPDF = async (req, res) => {
  try {
    const { feeId, paymentId } = req.params;
    const feeRecord = await StudentFee.findById(feeId)
      .populate({
        path: 'student',
        select: 'firstName lastName rollNumber classId',
        populate: { path: 'classId', select: 'className section' }
      })
      .populate('classId', 'className section')
      .lean();

    if (!feeRecord) {
      return res.status(404).json({ message: 'Fee record not found.' });
    }

    const payment = (feeRecord.paymentHistory || []).find(p => p._id?.toString() === paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found.' });
    }

    const school = await School.findById(feeRecord.schoolId).lean();
    if (!school) {
      return res.status(404).json({ message: 'School not found.' });
    }

    const pdfBuffer = await generatePDFBuffer(feeRecord, payment, school);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=FeeReceipt_${feeRecord.student?.rollNumber || 'student'}_${payment._id}.pdf`);
    res.send(pdfBuffer);

  } catch (err) {
    res.status(500).json({ message: 'Failed to generate PDF receipt.', error: err.message });
  }
};
