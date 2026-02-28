const express = require('express');
const router = express.Router();
const {
  createFeedback,
  getFeedbacksBySchool,
  markFeedbackResolved
} = require('../controllers/feedbackController');

router.post('/create', createFeedback);
router.get('/:schoolId', getFeedbacksBySchool);
router.put('/resolve/:feedbackId', markFeedbackResolved);

module.exports = router;
