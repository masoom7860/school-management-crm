const express = require('express');
const { registerSchool,   getAllSchools, updateSchool, loginWithOtp, getSchoolById, updateSchoolRazorpayConfig, toggleSchoolStatus, addSchoolBySuperAdmin } = require('../controllers/registarSchool'); // Added addSchoolBySuperAdmin
const { verifySchoolAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');


const router = express.Router();

// 🔐 OTP routes


// 🏫 School Auth routes
// Add upload middleware for logoUrl to the register route
router.post('/register',
  upload.schoolUpload.fields([
    { name: 'logoUrl', maxCount: 1 },
    { name: 'registrationCertificateUrl', maxCount: 1 },
    { name: 'identityDocumentUrl', maxCount: 1 }
  ]),
  registerSchool
);
router.post('/login', loginWithOtp);
router.put('/update/:schoolId',
  upload.schoolUpload.fields([
    { name: 'logoUrl', maxCount: 1 },
    { name: 'registrationCertificateUrl', maxCount: 1 },
    { name: 'identityDocumentUrl', maxCount: 1 }
  ]),
  updateSchool
);
router.get('/getAllSchool', getAllSchools)
router.get('/get/:schoolId', getSchoolById);

// Route to configure Razorpay keys for a school (requires school admin)
router.put('/configure-razorpay/:schoolId', verifySchoolAdmin, updateSchoolRazorpayConfig); // Assuming updateSchoolRazorpayConfig will be added to controller

// 🔒 Protected route (for logged-in school admin)
router.get('/dashboard', verifySchoolAdmin, (req, res) => {
    res.json({ message: `Welcome ${req.school.name}!`, school: req.school });
});

// Add a route for toggling school status (super admin only)
// TODO: Replace 'verifySuperAdmin' with actual middleware for super admin auth
const verifySuperAdmin = (req, res, next) => { next(); };
router.patch('/toggle-status/:schoolId', verifySuperAdmin, toggleSchoolStatus);

// Add a route for super admin to add a school (no OTP)
router.post('/addBySuperAdmin', verifySuperAdmin, upload.schoolUpload.fields([
  { name: 'logoUrl', maxCount: 1 },
  { name: 'registrationCertificateUrl', maxCount: 1 },
  { name: 'identityDocumentUrl', maxCount: 1 }
]), addSchoolBySuperAdmin);

module.exports = router;
