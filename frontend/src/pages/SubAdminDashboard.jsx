import React, { useState, useEffect } from 'react';
import { FaHome, FaUsers, FaChalkboardTeacher, FaClipboardCheck, FaGraduationCap, FaBook, FaCog, FaSignOutAlt } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn } from '../utils/animations';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

// Import all components
import AdminData from '../components/subadmin/AdminData';
import TeacherData from '../components/teachers/TeacherData';
import FeeStructureManagementSubAdmin from '../modules/fee-management/subadmin/FeeStructureManagement';
import BulkFeeAssignmentSubAdmin from '../modules/fee-management/subadmin/BulkFeeAssignment';
import CollectionReportsSubAdmin from '../modules/fee-management/subadmin/CollectionReports';
import ReceiptManagerSubAdmin from '../modules/fee-management/subadmin/ReceiptManager';
import SubAdminFeeDashboardWidgets from '../modules/fee-management/subadmin/SubAdminFeeDashboardWidgets';
import PaymentApprovalsSubAdmin from '../modules/fee-management/subadmin/PaymentApprovals';
import DailyCollectionSubAdmin from '../modules/fee-management/subadmin/DailyCollection';

import StudentManagement from '../components/teachers/studentmanagement/StudentManagement';
import ParentsManagement from '../components/staff/ParentsManagement';
import AttendanceManagement from '../components/teachers/AttendanceManagement';
import TeacherManagement from '../components/staff/TeacherManagement';
import ClassManagement from '../components/admin/ClassManagement'; // Corrected import path
import SubjectManagement from '../components/admin/SubjectManagement';
import CourseManagement from '../components/staff/CourseManagement';
import CertificateManagement from '../components/staff/CertificateManagement';
// import OnlineExamReport from '../components/teachers/OnlineExamReport';
import EditAccount from '../components/teachers/EditAccount';
import ViewAccount from '../components/teachers/ViewAccount';
import StaffManagement from '../components/subadmin/StaffManagement';
import DeleteAccount from '../components/subadmin/DeleteAccount';
import ChangePassword from '../components/subadmin/ChangePassword';
import WebsiteManagement from '../components/subadmin/WebsiteManagement';

const menuItems = [
  { icon: <FaHome />, label: "Dashboard", subItems: ["Admin", "Teacher"] },
  { icon: <FaUsers />, label: "Staff Management" },
  { icon: <FaChalkboardTeacher />, label: "Teacher Management" },
  { icon: <FaUsers />, label: "Student Management" },
  { icon: <FaUsers />, label: "Parent's Management" },
  { icon: <FaBook />, label: "Course Management" },
  { icon: <FaBook />, label: "Class Management" },
  { icon: <FaBook />, label: "Subject Management" },
  { 
    icon: <FaClipboardCheck />, 
    label: "Fee Management", 
    subItems: [
      "Fee Structure Management (Sub-Admin)", 
      "Bulk Fee Assignment (Sub-Admin)", 
      "Collection Reports (Sub-Admin)", 
      "Receipt Manager (Sub-Admin)", 
      "Sub-Admin Fee Dashboard Widgets", 
      "Payment Approvals (Sub-Admin)", 
      "Daily Collection (Sub-Admin)"
    ] 
  },
  { icon: <FaClipboardCheck />, label: "Attendance Management" },
  { icon: <FaGraduationCap />, label: "Certificate Management" },
  { icon: <FaGraduationCap />, label: "Online Exam & Report Management" },
  { 
    icon: <FaCog />, 
    label: "Account Settings", 
    subItems: ["Delete Account", "Edit Account", "View Account", "Change Password"] 
  },
  { icon: <FaCog />, label: "Website Management" },
  { icon: <FaSignOutAlt />, label: "Logout" }
];

const componentMap = {
  "Admin": AdminData,
  "Teacher": TeacherData,
  "Fee Structure Management (Sub-Admin)": FeeStructureManagementSubAdmin,
  "Bulk Fee Assignment (Sub-Admin)": BulkFeeAssignmentSubAdmin,
  "Collection Reports (Sub-Admin)": CollectionReportsSubAdmin,
  "Receipt Manager (Sub-Admin)": ReceiptManagerSubAdmin,
  "Sub-Admin Fee Dashboard Widgets": SubAdminFeeDashboardWidgets,
  "Payment Approvals (Sub-Admin)": PaymentApprovalsSubAdmin,
  "Daily Collection (Sub-Admin)": DailyCollectionSubAdmin,
  "Staff Management": StaffManagement,
  "Student Management": StudentManagement,
  "Teacher Management": TeacherManagement,
  "Parent's Management": ParentsManagement,
  "Class Management": ClassManagement,
  "Subject Management": SubjectManagement,
  "Attendance Management": AttendanceManagement,
  "Course Management": CourseManagement,
  // "Online Exam & Report Management": OnlineExamReport,
  "Edit Account": EditAccount,
  "View Account": ViewAccount,
  "Certificate Management": CertificateManagement,
  "Delete Account": DeleteAccount,
  "Change Password": ChangePassword,
  "Website Management": WebsiteManagement
};

const SubAdminDashboard = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeComponent, setActiveComponent] = useState("Admin");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    name: "",
    role: "",
    schoolName: "",
    schoolId: ""
  });

  // Validate session on component mount
  useEffect(() => {
    validateSession();
  }, []);

  const validateSession = () => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      toast.error("Session expired. Please login again.");
      handleLogout();
      return;
    }

    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        toast.error("Session expired. Please login again.");
        handleLogout();
        return;
      }

      // Validate required user credentials
      const name = localStorage.getItem("userName");
      const role = localStorage.getItem("role");
      const schoolName = localStorage.getItem("schoolName");
      const schoolId = localStorage.getItem("schoolId");

      if (!name || !role) {
        toast.error("Invalid user credentials");
        handleLogout();
        return;
      }

      setUserInfo({
        name: name || "",
        role: role || "Sub-Admin",
        schoolName: schoolName || "Unknown School",
        schoolId: schoolId || "",
      });

      setIsAuthenticated(true);
      
    } catch (err) {
      console.error("Failed to validate session", err);
      toast.error("Invalid session. Please login again.");
      handleLogout();
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    setIsLoggingOut(true);
    
    try {
      // Clear client-side credentials
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      localStorage.removeItem("role");
      localStorage.removeItem("schoolName");
      localStorage.removeItem("schoolId");
      
      // Reset state
      setIsAuthenticated(false);
      setUserInfo({
        name: "",
        role: "",
        schoolName: "",
        schoolId: ""
      });
      
      // Show success message
      toast.success("Logged out successfully");
      
      // Redirect to login
      navigate("/user-login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const confirmLogout = () => {
    handleLogout();
  };

  const handleMenuClick = (label) => {
    if (label === "Logout") {
      confirmLogout();
    } else {
      setActiveComponent(label);
    }
  };

  const ActiveComponent = componentMap[activeComponent] || AdminData;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-lg">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar 
        menuItems={menuItems} 
        onMenuClick={handleMenuClick} 
        isExpanded={isSidebarExpanded}
        onToggle={() => setSidebarExpanded(!isSidebarExpanded)} 
      />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar
          toggleSidebar={() => setSidebarExpanded(!isSidebarExpanded)}
          name={userInfo.name}
          role={userInfo.role}
          schoolName={userInfo.schoolName}
          onLogout={confirmLogout}
        />
        <div className="bg-gradient-to-br from-red-50 via-white to-black-50 flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeComponent}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-6"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg shadow-red-100/50 p-6 border border-red-100">
                <ActiveComponent />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default SubAdminDashboard;