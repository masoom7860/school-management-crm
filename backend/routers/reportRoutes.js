const express = require('express');
const router = express.Router();
const {
  getFeeDefaulters,
  getMonthlyCollectionSummary,
  getClassWiseRevenue,
  getPendingVsCollectedReport,
  generateMonthlyCollectionPdf,
  generateClassWiseRevenuePdf,
  generatePendingVsCollectedPdf
} = require('../controllers/studentFeeController'); // Reports are derived from student fees
const { verifyAdminOrStaff } = require('../middlewares/authMiddleware');

// Fee Defaulters Report
router.get('/defaulters/:schoolId', verifyAdminOrStaff, getFeeDefaulters);

// Collection Summary (monthly, class-wise) - This endpoint will be more generic
// The type of collection can be specified via query parameter, e.g., ?type=monthly or ?type=class
router.get('/collections/:schoolId', verifyAdminOrStaff, async (req, res) => {
  const { schoolId } = req.params;
  const { type, academicYear } = req.query;

  try {
    if (type === 'monthly') {
      await getMonthlyCollectionSummary(req, res);
    } else if (type === 'class-wise') {
      await getClassWiseRevenue(req, res);
    } else {
      // Default or error if type is not specified
      return res.status(400).json({ success: false, message: 'Please specify report type (monthly or class-wise)' });
    }
  } catch (error) {
    console.error('Error fetching collection summary:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve collection summary' });
  }
});

// Student Ledger (using existing getStudentFees logic, but renamed route)
router.get('/ledger/:studentId', verifyAdminOrStaff, (req, res) => {
  // The getStudentFees controller function already provides the necessary data for a ledger
  // It needs to be adapted to accept studentId as a path parameter directly
  // For now, we'll call the existing function, assuming it handles the studentId correctly
  // Further refinement might be needed in studentFeeController.js if getStudentFees expects schoolId in params
  req.params.studentId = req.params.studentId; // Ensure studentId is passed correctly
  getStudentFees(req, res);
});


// PDF Generation for Reports
router.get('/collections/:schoolId/pdf', verifyAdminOrStaff, async (req, res) => {
  const { schoolId } = req.params;
  const { type, academicYear } = req.query;

  try {
    if (type === 'monthly') {
      await generateMonthlyCollectionPdf(req, res);
    } else if (type === 'class-wise') {
      await generateClassWiseRevenuePdf(req, res);
    } else if (type === 'pending-collected') {
      await generatePendingVsCollectedPdf(req, res);
    } else {
      return res.status(400).json({ success: false, message: 'Please specify report type (monthly, class-wise, or pending-collected) for PDF generation' });
    }
  } catch (error) {
    console.error('Error generating report PDF:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report PDF' });
  }
});

// Pending vs Collected Report
router.get('/pending-collected/:schoolId', verifyAdminOrStaff, getPendingVsCollectedReport);


module.exports = router;
