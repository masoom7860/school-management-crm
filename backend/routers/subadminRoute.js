// routes/subadminRoutes.js
const express = require('express');
const router = express.Router();
const {
  createSubAdmin,
  subadminLogin,
  deleteSubadmin,
  getAllSubadminsForSchool,
  updateSubadmin
} = require('../controllers/subAdminController');

const upload = require('../middlewares/uploadMiddleware'); // use existing student upload middleware

// Apply upload middleware to the create route to parse multipart/form-data
router.post('/create/:schoolId', upload.schoolUpload.single('photo'), createSubAdmin);
router.post('/login', subadminLogin);

// ✅ Use existing upload middleware for photo update
router.put('/update/:adminId/:subadminId', upload.schoolUpload.single('photo'), updateSubadmin);

router.delete('/delete/:subadminId', deleteSubadmin);
router.get('/school/:schoolId', getAllSubadminsForSchool);

module.exports = router;
