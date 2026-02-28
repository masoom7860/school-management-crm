const express = require('express');
const router = express.Router();

const upload = require('../middlewares/uploadMiddleware');
const { allowRoles } = require('../middlewares/authMiddleware'); 

const {
  createStudent,
  getAllStudents,
  getStudentsByClassTeacher,
  studentLogin,
  updateStudent,
  deleteStudent,
  getStudentById,
  getStudentsByQuery
} = require('../controllers/studentController');

// ✅ Use upload.fields to accept multiple image fields
router.post(
  '/create',
  upload.schoolUpload.fields([
    { name: 'studentPhoto', maxCount: 1 },
    { name: 'fatherPhoto', maxCount: 1 },
    { name: 'motherPhoto', maxCount: 1 },
    { name: 'guardianPhoto', maxCount: 1 }
  ]),
  createStudent
);

router.post('/login', studentLogin);

router.get('/get/:schoolId', allowRoles('admin', 'staff', 'subadmin', 'teacher'), getAllStudents);

// New route to get students by query parameters
router.get('/', allowRoles('admin', 'staff', 'subadmin', 'teacher'), getStudentsByQuery);

// New route to get a single student by ID
router.get('/getById/:studentId', getStudentById);

// ✅ Update route supports multiple photo uploads and other form data
router.put(
  '/update/:studentId',
  upload.schoolUpload.fields([
    { name: 'profilePhoto', maxCount: 1 },
    { name: 'fatherPhoto', maxCount: 1 },
    { name: 'motherPhoto', maxCount: 1 },
    { name: 'guardianPhoto', maxCount: 1 }
  ]),
  updateStudent
);

router.get('/teacher/:teacherId/students', getStudentsByClassTeacher); // New route to fetch students by teacher

router.delete('/delete/:studentId', deleteStudent); // Uncommented

module.exports = router;