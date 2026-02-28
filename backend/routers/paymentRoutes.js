const express = require('express');
const {
  downloadReceipt,
  generateFeeReceiptPDF,
  createOfflineFeePayment
} = require('../controllers/paymentController'); // Removed getPaymentHistory import
const { verifyAdminOrStaff, verifyFeeViewer } = require('../middlewares/authMiddleware');

const router = express.Router();

// Create offline fee payment
router.post('/offline', verifyAdminOrStaff, createOfflineFeePayment);

// Removed the /history route as getPaymentHistory is not implemented in paymentController.js
// router.get('/history', verifyFeeViewer, getPaymentHistory);

module.exports = router;
