const express = require('express');
const router = express.Router();
const { allowRoles } = require('../middlewares/authMiddleware');
const {
  getIdCardTemplate,
  upsertIdCardTemplate,
} = require('../controllers/idCardTemplateController');

// Allow admin, staff, subadmin, teacher to view templates
router.get('/', allowRoles('admin', 'staff', 'subadmin', 'teacher'), getIdCardTemplate);

// Allow admin & staff to update templates
router.put('/', allowRoles('admin', 'staff'), upsertIdCardTemplate);

module.exports = router;
