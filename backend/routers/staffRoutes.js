const express = require('express');
const {
  createStaff,
  staffLogin,
  deleteStaff,
  getAllStaffForSchool,
  updateStaff,
} = require('../controllers/staffController');

const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post(
  '/create/:schoolId',
  upload.schoolUpload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'identityDocument', maxCount: 1 },
  ]),
  createStaff
);

router.put(
  '/update/:staffId',
  upload.schoolUpload.fields([
    { name: 'photo', maxCount: 1 },
    { name: 'identityDocument', maxCount: 1 },
  ]),
  updateStaff
);

// ✅ Other routes
router.post('/login', staffLogin);
router.get('/getstaff/:schoolId', getAllStaffForSchool);
router.delete('/delete/:staffId', deleteStaff);

module.exports = router;
