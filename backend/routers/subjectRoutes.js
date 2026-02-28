const express = require('express');
const router = express.Router();
const subjectController = require('../controllers/subjectController');
const { allowRoles } = require('../middlewares/authMiddleware');

router.get('/catalog', allowRoles('admin', 'staff', 'subadmin', 'teacher'), subjectController.getSubjectCatalog);
router.post('/seed', allowRoles('admin', 'staff', 'subadmin'), subjectController.seedSubjectsForClass);

router.post('/', allowRoles('admin', 'staff', 'subadmin'), subjectController.createSubject);
router.get('/', allowRoles('admin', 'staff', 'subadmin', 'teacher'), subjectController.getSubjects);
router.put('/:id', allowRoles('admin', 'staff', 'subadmin'), subjectController.updateSubject);
router.delete('/delete-by-class-section', allowRoles('admin', 'staff', 'subadmin'), subjectController.deleteSubjectsByClassAndSection);
router.delete('/:id', allowRoles('admin', 'staff', 'subadmin'), subjectController.deleteSubject);

module.exports = router;
