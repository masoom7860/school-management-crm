const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendanceBySchool,
  getStudentAttendance,
  updateAttendance,
  deleteAttendance,
  getStudentsByTeacher, // Added
  markBatchAttendance, // Added
  generateAttendanceReport // Added
} = require('../controllers/attendanceController');
const { allowRoles } = require('../middlewares/authMiddleware');

router.post('/mark', allowRoles('admin', 'teacher', 'subadmin', 'staff'), markAttendance);
router.get('/school/:schoolId', allowRoles('admin', 'subadmin', 'staff'), getAttendanceBySchool);
router.get('/student/:studentId', allowRoles('admin', 'teacher', 'subadmin', 'staff'), getStudentAttendance);
router.put('/update/:attendanceId', allowRoles('admin', 'teacher'), updateAttendance);
router.delete('/delete/:attendanceId', allowRoles('admin'), deleteAttendance);

// New routes for teacher attendance management
router.get('/teacher/:teacherId/students', allowRoles('admin', 'teacher', 'subadmin'), getStudentsByTeacher);
router.post('/batch', allowRoles('admin', 'teacher'), markBatchAttendance);
router.get('/report', allowRoles('admin', 'teacher', 'subadmin', 'staff'), generateAttendanceReport);


module.exports = router;
