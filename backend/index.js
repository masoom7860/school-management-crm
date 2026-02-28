require('dotenv').config({ path: './.env' });
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const path = require('path');
const School = require('./models/registarSchoolModel');

// Existing routes
const schoolRoutes = require('./routers/reistarSchoolRoute');
const schoolImageRoutes = require("./routers/schoolImageRoutes");
const otpRoutes = require('./routers/otpRoutes');
const subadminRoutes = require('./routers/subadminRoute');
const staffRoutes = require('./routers/staffRoutes');
const teacherRoute = require('./routers/teachersRoute');
const studentRoute = require('./routers/studentRoutes');
const designationRoutes = require('./routers/designationRoutes');
// import designationRoutes from "./routes/designationRoutes.js";
const parentRoute = require('./routers/parentRoutes');
const courseRoute = require('./routers/courseRoutes');
const classRoutes = require('./routers/classRoutes');
// const feeStructureRoutes = require('./routers/feeStructureRoutes');
// const studentFeeRoutes = require('./routers/studentFeeRoutes');
const feesRoutes = require('./routers/feesRoutes');
const attendanceRoutes = require('./routers/attandenceRoutes');
const certificateRoutes = require('./routers/certificateRoutes');
const examRoutes = require('./routers/examRoutes');
const examReportRoutes = require('./routers/reportRoutes'); // Assuming this is for exam-specific reports
const studymeterialRoutes = require('./routers/studyMaterialRoutes');
const feedbackRoutes = require('./routers/feedbackRoutes');
const membershipRoutes = require('./routers/membershipRoutes');
const paymentRoutes = require('./routers/paymentRoutes');
const userLoginRouetes = require('./routers/userLoginRoutes');
const superadminRoute = require('./routers/superadminRoute');
const superadminAuthRoutes = require('./routers/superadminAuthRoutes');
const subjectRoutes = require('./routers/subjectRoutes');
const marksheetRoutes = require('./routers/marksheetRoutes');
const sectionRoutes = require('./routers/sectionRoutes');
const sessionRoutes = require('./routers/sessionRoutes');
const imageRoutes = require('./routers/image');
const maxMarksRoutes = require("./routers/maxMarkRoutes");
const studentMarkRoutes = require("./routers/studentMarkRoutes");
// const certificateRoutes = require("./routers/certificateRoutes");


// NEW: Import SMS routes
const smsRoutes = require('./routers/smsRoutes'); // Create this file

// NEW: Import refactored report and notification routes
const feeReportRoutes = require('./routers/reportRoutes'); // For fee-related reports
const notificationRoutes = require('./routers/notificationRoutes'); // For fee-related notifications
const uploadRoutes = require('./routers/uploadRoutes');
const contactRoutes = require('./routers/contactRoutes');
const idCardTemplateRoutes = require('./routers/idCardTemplateRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
console.log('Connecting to MongoDB...');
connectDB()
  .then(() => School.syncIndexes())
  .then(() => console.log('School indexes synced'))
  .catch((e) => console.error('Failed to sync School indexes:', e.message || e));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'School-ID']
}));

// Serve static files from the 'uploads' directory (after CORS so headers apply)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes - Added /api prefix to match frontend calls
app.use('/userlogin', userLoginRouetes);
app.use("/api/school-images", schoolImageRoutes);
app.use('/registerSchool', schoolRoutes);
app.use('/otp', otpRoutes);
app.use('/subadmins', subadminRoutes);
app.use('/api/staffs', staffRoutes);
app.use('/api/teachers', teacherRoute);
app.use('/api/students', studentRoute);
app.use('/api/designations', designationRoutes);
app.use('/api/parents', parentRoute);
app.use('/course', courseRoute);
app.use('/api/classes', classRoutes);
// app.use('/api/fee-structures', feeStructureRoutes);
// app.use('/api/student-fees', studentFeeRoutes); // Updated prefix
app.use('/api/fees', feesRoutes);
app.use('/attendance', attendanceRoutes);
// app.use('/cirtificate', cirtificateRoutes);
app.use('/api/exams', examRoutes);
app.use('/examReport', examReportRoutes); // Keep existing exam reports
app.use('/api/reports', feeReportRoutes); // NEW: Fee-related reports
app.use('/api/notifications', notificationRoutes); // NEW: Fee-related notifications
app.use('/studymeterial', studymeterialRoutes);
app.use('/api/study-materials', studymeterialRoutes);
app.use('/feedback', feedbackRoutes);
app.use('/membership', membershipRoutes);
app.use('/payment', paymentRoutes);
app.use('/superadmin', superadminRoute);
app.use('/api/superadmin', superadminAuthRoutes);
app.use('/api/subjects', subjectRoutes);
app.use("/api/maxmarks", maxMarksRoutes)
app.use("/api/studentmarks", studentMarkRoutes); 
app.use('/api/marksheets', marksheetRoutes);
app.use('/api/sections', sectionRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/image', imageRoutes);
app.use("/api/certificates", certificateRoutes);
app.use('/api/schoolS', require('./routers/schoolRoutes'));
app.use('/api/upload', uploadRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/id-card-templates', idCardTemplateRoutes);
// app.use('/api/schools', schoolRoutes);
// NEW: Add SMS routes
app.use('/api/sms', smsRoutes);

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

