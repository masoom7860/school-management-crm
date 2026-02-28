const express = require('express');
const router = express.Router();
const upload = require('../middlewares/uploadMiddleware'); // multer config

const { 
  createTeacher, 
  teacherLogin, 
  getAllTeachers, 
  deleteTeacher,
  updateTeacher,
  getTeacherById // Import the new controller function
} = require('../controllers/teacherController');

router.post('/create/:schoolId', upload.teacherUpload.single('photo'), createTeacher); // Use teacherUpload.single for photo upload

router.post('/login', teacherLogin);

router.get('/all/:schoolId', getAllTeachers);

router.delete('/delete/:teacherId', deleteTeacher);

router.put('/update/:teacherId', upload.teacherUpload.single('photo'), updateTeacher);

// Route to get a single teacher by ID
router.get('/single/:teacherId', getTeacherById);

module.exports = router;
