const express = require('express');
const router = express.Router();
const {
  addClass,
  getClassesBySchool,
  getClassById,
  updateClass,
  deleteClass,
  addSectionToClass,
  updateSectionInClass,
  deleteSectionFromClass,
  getSectionsByClass,
  getClassesWithSections,
  getStudentsByClassAndSection,
  getTeacherAssignedClasses,
  getTeacherAssignedClassesWithSections,
} = require('../controllers/classController');
const { verifyAdminOrStaff, allowRoles } = require('../middlewares/authMiddleware');

router.post('/', verifyAdminOrStaff, addClass);
router.get('/', allowRoles('admin', 'staff', 'subadmin', 'teacher'), getClassesBySchool); // Get all classes for the authenticated school
router.get('/with-sections', allowRoles('admin', 'staff', 'subadmin', 'teacher'), getClassesWithSections); // Get all classes with their sections
// Teacher-scoped helpers: only classes assigned to the logged-in teacher
router.get('/assigned', allowRoles('teacher'), getTeacherAssignedClasses);
router.get('/assigned-with-sections', allowRoles('teacher'), getTeacherAssignedClassesWithSections);
router.get('/sections', allowRoles('admin', 'staff', 'subadmin', 'teacher'), getSectionsByClass);
router.get('/students',allowRoles('admin', 'staff', 'subadmin', 'teacher'),getStudentsByClassAndSection);
router.get('/:id', verifyAdminOrStaff, getClassById); // Get single class by ID for the authenticated school
router.put('/:id', verifyAdminOrStaff, updateClass); // Update class by ID for the authenticated school
router.delete('/:id', verifyAdminOrStaff, deleteClass); // Delete class by ID for the authenticated school
router.post('/:id/sections', verifyAdminOrStaff, addSectionToClass);
router.put('/:id/sections/:sectionName', verifyAdminOrStaff, updateSectionInClass);
router.delete('/:id/sections/:sectionName', verifyAdminOrStaff, deleteSectionFromClass);

module.exports = router;