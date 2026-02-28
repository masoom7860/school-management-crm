const express = require('express');
const router = express.Router();
const { registerSuperAdmin, loginSuperAdmin, getAllAdmins, deleteSchoolAndAdmin, getAllSuperAdmins } = require('../controllers/superadminAuthController');
const superAdminAuth = require('../middlewares/superAdminAuthMiddleware');

router.post('/register', registerSuperAdmin);
router.post('/login', loginSuperAdmin);

// New routes for super admin
router.get('/all-admins', superAdminAuth, getAllAdmins);
router.delete('/delete-school/:schoolId', superAdminAuth, deleteSchoolAndAdmin);
router.get('/all-superadmins', getAllSuperAdmins);

module.exports = router; 