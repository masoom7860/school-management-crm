const express = require('express');
const { registerSuperAdmin, loginSuperAdmin } = require('../controllers/superAdminController');

const router = express.Router();

// Register SuperAdmin
router.post('/register', registerSuperAdmin);

// Login SuperAdmin
router.post('/login', loginSuperAdmin);

module.exports = router; 