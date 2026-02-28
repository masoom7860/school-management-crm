const express = require('express');
const router = express.Router();
const { sendDueFeeNotifications } = require('../controllers/studentFeeController');
const { verifyAdminOrStaff } = require('../middlewares/authMiddleware');

// Send SMS/Email/WhatsApp Reminder
router.post('/send/:schoolId', verifyAdminOrStaff, sendDueFeeNotifications);

module.exports = router;
