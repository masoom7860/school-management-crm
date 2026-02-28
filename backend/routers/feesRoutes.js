const express = require('express');
const router = express.Router();

const {
  createFeeMonth,
  getFeeMonths,
  updateFeeMonth,
  deleteFeeMonth,
  createOrUpdateClassMonthlyFee,
  getClassMonthlyFees,
  deleteClassMonthlyFee,
  getStudentFeeLedgers,
  createStudentFeeLedger,
  addLedgerPayment,
  getLedgerReceiptPdf,
  deleteLedger,
  getSessionSummary,
  getDependencies,
} = require('../controllers/feesController');

const { verifyAdminOrStaff } = require('../middlewares/authMiddleware');

// Fee months
router.post('/months', verifyAdminOrStaff, createFeeMonth);
router.get('/months/:schoolId', verifyAdminOrStaff, getFeeMonths);
router.put('/months/:id', verifyAdminOrStaff, updateFeeMonth);
router.delete('/months/:id', verifyAdminOrStaff, deleteFeeMonth);

// Class monthly fees
router.post('/class-fees', verifyAdminOrStaff, createOrUpdateClassMonthlyFee);
router.get('/class-fees/:schoolId', verifyAdminOrStaff, getClassMonthlyFees);
router.delete('/class-fees/:id', verifyAdminOrStaff, deleteClassMonthlyFee);

// Student ledgers
router.get('/ledgers/:schoolId', verifyAdminOrStaff, getStudentFeeLedgers);
router.post('/ledgers', verifyAdminOrStaff, createStudentFeeLedger);
router.post('/ledgers/:ledgerId/payments', verifyAdminOrStaff, addLedgerPayment);
router.get('/ledgers/:ledgerId/receipts/:receiptNumber', verifyAdminOrStaff, getLedgerReceiptPdf);
router.delete('/ledgers/:id', verifyAdminOrStaff, deleteLedger);

// Supporting lookups
router.get('/sessions/:schoolId', verifyAdminOrStaff, getSessionSummary);
router.get('/dependencies/:schoolId', verifyAdminOrStaff, getDependencies);

module.exports = router;
