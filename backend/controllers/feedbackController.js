const Feedback = require('../models/feedbackModel');

const createFeedback = async (req, res) => {
  try {
    const { schoolId, studentId, message } = req.body;

    if (!schoolId || !studentId || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const feedback = new Feedback({ schoolId, studentId, message });
    await feedback.save();

    res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getFeedbacksBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const feedbacks = await Feedback.find({ schoolId }).populate('studentId', 'name email');
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const markFeedbackResolved = async (req, res) => {
  try {
    const { feedbackId } = req.params;

    const feedback = await Feedback.findByIdAndUpdate(feedbackId, { isResolved: true }, { new: true });
    if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

    res.status(200).json({ success: true, message: 'Marked as resolved', data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createFeedback,
  getFeedbacksBySchool,
  markFeedbackResolved
};
