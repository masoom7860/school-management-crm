const express = require('express');
const router = express.Router();
const cors = require('cors'); // Import cors middleware
const {
  createFeeStructure,
  getFeeStructures,
  updateFeeStructure,
  deleteFeeStructure,
  getAcademicYears
} = require('../controllers/feeStructureControlller');

const { verifyAdminOrStaff } = require('../middlewares/authMiddleware'); // Import auth middleware

// Configure CORS specifically for these routes to allow School-ID header
const corsOptions = {
  origin: '*', // Or specify allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'School-ID'], // Allow School-ID header
};

router.use(cors(corsOptions)); // Apply CORS middleware to this router

// Apply appropriate middleware to routes
router.post('/create', verifyAdminOrStaff, createFeeStructure); // Get academic years
router.get('/academic-years/:schoolId', verifyAdminOrStaff, getAcademicYears);

// Get fee structures with filtering
router.get('/list/:schoolId', verifyAdminOrStaff, getFeeStructures); // Requires Admin/Staff
router.put('/update/:id', verifyAdminOrStaff, updateFeeStructure); // Requires Admin/Staff
router.delete('/delete/:id', verifyAdminOrStaff, deleteFeeStructure); // Requires Admin/Staff

module.exports = router;