// routes/studentFeeRoutes.js
const express = require('express');
const router = express.Router();

const {
  assignStudentFee,
  addStudentPayment,
  getStudentFees, // student ledger for student/parent
  getAllStudentFees,
  generateReceiptPdf,
  generateFeeDefaultersPdf, // ✅ add this
  getFeeDefaulters,
  getMonthlyCollectionSummary,
  sendDueFeeNotifications,
  generateMonthlyCollectionPdf,
  getClassWiseRevenue,
  generateClassWiseRevenuePdf,
  getPendingVsCollectedReport,
  generatePendingVsCollectedPdf
} = require('../controllers/studentFeeController');

const { verifyAdminOrStaff, allowRoles } = require('../middlewares/authMiddleware');

// Assign Fee to Student(s)
router.post('/assign', verifyAdminOrStaff, assignStudentFee);

// Get all Student Fees for a School
router.get('/all/:schoolId', verifyAdminOrStaff, getAllStudentFees);

// Get specific Student’s Fee Records (used as ledger in reports) — students call this too
router.get('/student/:studentId', allowRoles('student', 'admin', 'staff', 'subadmin'), getStudentFees);

// Add Payment (updates paid, due, status)
router.post('/:studentFeeId/pay', verifyAdminOrStaff, addStudentPayment);

// Generate Receipt (PDF/Print)
router.get('/:studentFeeId/receipt/:receiptNumber', allowRoles('student', 'admin', 'staff', 'subadmin'), generateReceiptPdf);

// Reports & notifications
// Reports & notifications
router.get('/defaulters/:schoolId', verifyAdminOrStaff, getFeeDefaulters);
router.get('/defaulters/:schoolId/pdf', verifyAdminOrStaff, generateFeeDefaultersPdf);

router.get('/monthly-summary/:schoolId', verifyAdminOrStaff, getMonthlyCollectionSummary);
router.get('/monthly-summary/:schoolId/pdf', verifyAdminOrStaff, generateMonthlyCollectionPdf);

router.post('/notifications/:schoolId', verifyAdminOrStaff, sendDueFeeNotifications);

router.get('/class-revenue/:schoolId', verifyAdminOrStaff, getClassWiseRevenue);
router.get('/class-revenue/:schoolId/pdf', verifyAdminOrStaff, generateClassWiseRevenuePdf);

router.get('/pending-vs-collected/:schoolId', verifyAdminOrStaff, getPendingVsCollectedReport);
router.get('/pending-vs-collected/:schoolId/pdf', verifyAdminOrStaff, generatePendingVsCollectedPdf);

module.exports = router;
