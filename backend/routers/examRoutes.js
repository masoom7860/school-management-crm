const express = require('express');
const router = express.Router();
const { createExam, getExamsBySchool, deleteExam } = require('../controllers/examController');
const { allowRoles } = require('../middlewares/authMiddleware');

router.post('/create', allowRoles('admin', 'staff', 'subadmin', 'teacher'), createExam);
router.get('/all/:schoolId', allowRoles('admin', 'staff', 'subadmin', 'teacher'), getExamsBySchool);
router.get('/', allowRoles('admin', 'staff', 'subadmin', 'teacher'), getExamsBySchool);
router.delete('/delete/:examId', deleteExam);

module.exports = router;
