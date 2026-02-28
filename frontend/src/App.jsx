import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard.jsx';
import TeachersDashboard from './pages/TeachersDashboard.jsx';
// import StaffDashboard from './pages/StaffDashbord.jsx';
import Home from './pages/Home.jsx';
import LoginPage from './components/LoginPage.jsx'; // School Admin Login
import UserLogin from './pages/UserLogin.jsx'; // ✅ User Login
import RegistrationForm from './components/RegistrationForm.jsx';
import SubAdminDashboard from './pages/SubAdminDashboard.jsx';
import StudentDashboard from './pages/StudentDashboard.jsx';
import ParentDashboard from './pages/ParentDashboard.jsx';
import ProtectedRoute from './components/ProtectedRoute';
import SuperAdminDashboard from './pages/SuperAdminDashboard.jsx'
import SuperAdminLogin from './components/superadmin/SuperAdminLogin.jsx';
import SuperAdminRegister from './components/superadmin/SuperAdminRegister.jsx';
import ProtectedSuperAdminRoute from './components/ProtectedSuperAdminRoute.jsx';
import { Toaster } from 'react-hot-toast';
import StudentPrintRoute from './components/admin/PrintDash/StudentPrintRoute.jsx';
import AllStudentPrintRoute from './components/admin/PrintDash/AllStudentPrintRoute.jsx';
import StaffPrintRoute from './components/admin/PrintDash/StaffPrintRoute.jsx';
import TeacherPrintRoute from './components/admin/PrintDash/TeacherPrintRoute.jsx';
import PrintMarksheet from './components/admin/PrintMarksheet.jsx';
import CBSEReportCardView from './components/admin/CBSEReportCardView.jsx';
import Documentation from './components/documentation/Documentation.jsx';
import UIDemoPage from './pages/UIDemoPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" reverseOrder={false} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/help" element={<Documentation />} />
        <Route path="/ui-demo" element={<UIDemoPage />} />

        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/user-login" element={<UserLogin />} />
        <Route path="/RegistrationForm" element={<RegistrationForm />} />
        <Route path="/superadmindashboard" element={
          <ProtectedSuperAdminRoute>
            <SuperAdminDashboard />
          </ProtectedSuperAdminRoute>
        } />
        <Route path="/superadmin-login" element={<SuperAdminLogin />} />
        <Route path="/superadmin-register" element={<SuperAdminRegister />} />

        {/* Protected Routes by Role */}

        <Route path="/admindashboard" element={<ProtectedRoute element={AdminDashboard} allowedRole="admin" />} />
        <Route path="/subadmindashboard" element={<ProtectedRoute element={SubAdminDashboard} allowedRole="subadmin" />} />
        <Route path="/teacherdashboard" element={<ProtectedRoute element={TeachersDashboard} allowedRole="teacher" />} />
        {/* <Route path="/staffdashboard" element={<ProtectedRoute element={StaffDashboard} allowedRole="staff" />} /> */}
        <Route path="/studentdashboard" element={<ProtectedRoute element={StudentDashboard} allowedRole="student" />} />
        <Route path="/parentdashboard" element={<ProtectedRoute element={ParentDashboard} allowedRole="parent" />} />
        {/* <Route path="/print-preview" element={<PrintPreview />} /> */}

        {/* Print Preview Routes */}
        <Route path="/print/students" element={<ProtectedRoute element={StudentPrintRoute} allowedRole="admin" />} />
        <Route path="/print/all-students" element={<ProtectedRoute element={AllStudentPrintRoute} allowedRole="admin" />} />
        <Route path="/print/staff" element={<ProtectedRoute element={StaffPrintRoute} allowedRole="admin" />} />
        <Route path="/print/teacher" element={<ProtectedRoute element={TeacherPrintRoute} allowedRole="admin" />} />
        <Route path="/print/marksheet" element={<ProtectedRoute element={PrintMarksheet} allowedRole="admin" />} />
        <Route path="/view/marksheet" element={<ProtectedRoute element={CBSEReportCardView} allowedRole="admin" />} />

        {/* <Route path="/superadmindashboard" element={<ProtectedRoute element={SuperAdminDashboard} allowedRole="superadmin"/> }/> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
