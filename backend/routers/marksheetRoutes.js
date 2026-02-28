const express = require('express');
const router = express.Router();

const { allowRoles } = require('../middlewares/authMiddleware');
const {
  createMarksheet,
  getMarksheetById,
  listMarksheets,
  updateMarksheet,
  deleteMarksheet,
  generateMarksheetPDF,
  debug,
  getMaxMarksConfig,
  createMaxMarksConfig
} = require('../controllers/marksheetController');

// ✅ Debug Route
router.get('/debug', allowRoles('admin', 'staff', 'subadmin', 'teacher'), debug);

// ✅ Max Marks Config Routes
router.get('/max-marks-config', allowRoles('admin', 'staff', 'subadmin', 'teacher'), getMaxMarksConfig);
router.post('/max-marks-config', allowRoles('admin', 'staff', 'subadmin', 'teacher'), createMaxMarksConfig);


// ✅ CRUD
router.post('/', allowRoles('admin', 'staff', 'subadmin', 'teacher'), createMarksheet);
router.get('/', allowRoles('admin', 'staff', 'subadmin', 'teacher'), listMarksheets);
router.get('/:id', allowRoles('admin', 'staff', 'subadmin', 'teacher'), getMarksheetById);
router.put('/:id', allowRoles('admin', 'staff', 'subadmin', 'teacher'), updateMarksheet);
router.delete('/:id', allowRoles('admin', 'staff', 'subadmin', 'teacher'), deleteMarksheet);

// ✅ PDF Generation
router.get('/:id/pdf', allowRoles('admin', 'staff', 'subadmin', 'teacher'), generateMarksheetPDF);

module.exports = router;
