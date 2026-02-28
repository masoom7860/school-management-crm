const express = require('express');
const router = express.Router();
const SMSLog = require('../models/SMSLog'); // Create this model
const axios = require('axios');

const ZOSTO_API_KEY = process.env.ZOSTO_API_KEY || '579|HGIjT0RYaA1pDIfyKNWnVjrUdoq9eby72WLHIb5Rff927dca';

// Send attendance SMS
router.post('/send-attendance-sms', async (req, res) => {
  try {
    const { studentId, studentName, parentPhone, status, date, schoolId, teacherId } = req.body;

    if (!parentPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Parent phone number is required' 
      });
    }

    // Clean and format phone number
    const cleanPhone = parentPhone.toString().replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('91') ? cleanPhone : `91${cleanPhone}`;

    const message = `Your child ${studentName} was marked ${status} on ${new Date(date).toLocaleDateString('en-IN')}.`;
    const templateId = '1707172506548994059';

    console.log('Sending SMS to:', formattedPhone);

    // Call Zosto SMS API
    const response = await axios.post(
      'https://zostosms.com/api/v3/sms/send',
      null,
      {
        params: {
          recipient: formattedPhone,
          sender_id: 'ZOSTOT',
          message: message,
          type: 'plain',
          dlt_template_id: templateId
        },
        headers: {
          'Authorization': `Bearer ${ZOSTO_API_KEY}`
        }
      }
    );

    console.log('Zosto API Response:', response.data);

    // Save to database
    const smsLog = new SMSLog({
      studentId,
      studentName,
      phone: formattedPhone,
      message,
      templateId,
      status: 'Sent',
      messageId: response.data.message_id || response.data.id || `msg_${Date.now()}`,
      schoolId,
      teacherId,
      attendanceDate: date,
      apiResponse: response.data
    });

    await smsLog.save();

    res.json({
      success: true,
      message: 'SMS sent successfully',
      data: smsLog
    });

  } catch (error) {
    console.error('SMS Error:', error.response?.data || error.message);

    // Save failed attempt to database
    const smsLog = new SMSLog({
      studentId: req.body.studentId,
      studentName: req.body.studentName,
      phone: req.body.parentPhone,
      message: `Your child ${req.body.studentName} was marked ${req.body.status} on ${new Date(req.body.date).toLocaleDateString('en-IN')}.`,
      templateId: '1707172506548994059',
      status: 'Failed',
      error: error.response?.data?.message || error.message,
      schoolId: req.body.schoolId,
      teacherId: req.body.teacherId,
      attendanceDate: req.body.date,
      apiResponse: error.response?.data
    });

    await smsLog.save();

    res.status(500).json({
      success: false,
      message: 'Failed to send SMS',
      error: error.response?.data?.message || error.message
    });
  }
});

// Get SMS logs for teacher
router.get('/logs', async (req, res) => {
  try {
    const { teacherId, schoolId, page = 1, limit = 50 } = req.query;

    if (!teacherId || !schoolId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID and School ID are required'
      });
    }

    const logs = await SMSLog.find({
      teacherId: teacherId,
      schoolId: schoolId
    })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await SMSLog.countDocuments({
      teacherId: teacherId,
      schoolId: schoolId
    });

    res.json({
      success: true,
      logs,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });

  } catch (error) {
    console.error('Error fetching SMS logs:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SMS logs',
      error: error.message
    });
  }
});

// Get SMS statistics for dashboard
router.get('/stats', async (req, res) => {
  try {
    const { teacherId, schoolId } = req.query;

    if (!teacherId || !schoolId) {
      return res.status(400).json({
        success: false,
        message: 'Teacher ID and School ID are required'
      });
    }

    const totalSMS = await SMSLog.countDocuments({ teacherId, schoolId });
    const sentSMS = await SMSLog.countDocuments({ teacherId, schoolId, status: 'Sent' });
    const failedSMS = await SMSLog.countDocuments({ teacherId, schoolId, status: 'Failed' });

    // Last 7 days stats
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentSMS = await SMSLog.countDocuments({
      teacherId,
      schoolId,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      stats: {
        total: totalSMS,
        sent: sentSMS,
        failed: failedSMS,
        recent: recentSMS
      }
    });

  } catch (error) {
    console.error('Error fetching SMS stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching SMS statistics',
      error: error.message
    });
  }
});

module.exports = router;