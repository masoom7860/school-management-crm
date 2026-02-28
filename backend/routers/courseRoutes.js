const express = require('express');
const router = express.Router();
const {
  addCourse,
  getCoursesBySchool,
  getCourseById,
  updateCourse,
  deleteCourse
} = require('../controllers/courseController');

router.post('/addCourse', addCourse);
router.get('/getCourse/:schoolId', getCoursesBySchool);
router.get('/getCoursebyId/:courseId', getCourseById);
router.put('/updateCousre/:courseId', updateCourse);
router.delete('/deleteCourse/:courseId', deleteCourse);

module.exports = router;
