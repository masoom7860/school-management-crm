const express = require('express');
const router = express.Router();
const {
  createSession,
  getSessionsBySchool,
  getSessionById,
  updateSession,
  deleteSession,
  activateSession,
} = require('../controllers/sessionController');
const { verifyAdminOrStaff, allowRoles } = require('../middlewares/authMiddleware');

// List all sessions for the authenticated school
router.get('/', allowRoles('admin', 'staff', 'subadmin', 'teacher'), getSessionsBySchool);

// Create session
router.post('/', verifyAdminOrStaff, createSession);

// Get one session
router.get('/:id', verifyAdminOrStaff, getSessionById);

// Update session
router.put('/:id', verifyAdminOrStaff, updateSession);

// Delete session
router.delete('/:id', verifyAdminOrStaff, deleteSession);

// Activate session
router.post('/:id/activate', verifyAdminOrStaff, activateSession);

module.exports = router;

