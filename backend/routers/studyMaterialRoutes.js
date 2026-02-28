// routes/studyMaterialRoutes.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const {
  createStudyMaterial,
  getStudyMaterials, // legacy by class name
  listByClass,
  listTeacherMaterials,
  listStudentMaterials,
  updateStudyMaterial,
  deleteStudyMaterial
} = require('../controllers/studyMaterialController');
const { allowRoles } = require('../middlewares/authMiddleware');
const router = express.Router();

// Ensure upload dir exists
const dir = path.join(__dirname, '..', 'uploads', 'study_materials');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

// Setup file storage for study materials
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/study_materials/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// NEW RESTful routes under /api/study-materials (mounted in index.js)
router.post('/', allowRoles('teacher', 'admin', 'subadmin'), upload.single('file'), createStudyMaterial);
router.get('/', allowRoles('teacher', 'admin', 'subadmin', 'staff'), listByClass);
router.get('/teacher', allowRoles('teacher'), listTeacherMaterials);
router.get('/student', allowRoles('student'), listStudentMaterials);
router.put('/:id', allowRoles('teacher', 'admin', 'subadmin'), upload.single('file'), updateStudyMaterial);
router.delete('/:id', allowRoles('teacher', 'admin', 'subadmin'), deleteStudyMaterial);

// Legacy routes still supported when mounted at /studymeterial
router.post('/create', upload.single('file'), createStudyMaterial);
router.get('/getMaterials/:schoolId/:className', getStudyMaterials);
router.put('/update/:id', upload.single('file'), updateStudyMaterial);
router.delete('/delete/:id', deleteStudyMaterial);

module.exports = router;
