import { useState, useEffect } from "react";
import { FaHome, FaUsers, FaChalkboardTeacher, FaClipboardCheck, FaGraduationCap, FaBook, FaSignOutAlt } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn } from '../utils/animations';
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import "react-toastify/dist/ReactToastify.css";

import StaffData from '../components/staff/StaffData';
import TeacherData from '../components/teachers/TeacherData';
import TeacherManagement from '../components/staff/TeacherManagement';
import StudentManagement from '../components/teachers/studentmanagement/StudentManagement';
import AttendanceManagement from '../components/teachers/AttendanceManagement';

// Import the relevant Fee Management components for staff
import StudentFeeManagementStaff from '../components/staff/StudentFeeManagementStaff'; // The main staff student fee management component
import FeeStructureManagement from '../components/admin/FeeStructureManagement'; // Import FeeStructureManagement

import EditAccount from '../components/teachers/EditAccount';
// import OnlineExamReport from '../components/teachers/OnlineExamReport';
import StudyMaterialManagement from '../components/teachers/StudyMaterialManagement';
import ViewAccount from "../components/teachers/ViewAccount";
import NotificationOption from '../components/teachers/NotificationOption'
import ParentsManagement from "../components/staff/ParentsManagement";
import CourseManagement from "../components/staff/CourseManagement";

const menuItems = [
  { icon: <FaHome />, label: "Dashboard", subItems: ["Staff", "Teacher"] },
  { icon: <FaUsers />, label: "Teacher Management" },
  { icon: <FaUsers />, label: "Student Management" },
  { icon: <FaUsers />, label: "Parent Management" },
  { icon: <FaBook />, label: "Course Management" },
  { icon: <FaClipboardCheck />, label: "Attendance", subItems: ["Attendance Management"] },
  { icon: <FaGraduationCap />, label: "Exams", subItems: ["Online Exam & Report Management"] },
  { icon: <FaClipboardCheck />, label: "Certificates", subItems: ["Certificate Management"] },
  { icon: <FaClipboardCheck />, label: "Fees" }, // Keep only the main "Fees" label
  { icon: <FaClipboardCheck />, label: "Fee Structure Management" }, // Add Fee Structure Management menu item
  { icon: <FaUsers />, label: "Accounts", subItems: ["Edit Account", "View Account", "Change Password"] },
  { icon: <FaChalkboardTeacher />, label: "Complaints", subItems: ["Complaint Management"] },
  { icon: <FaChalkboardTeacher />, label: "Notification", subItems: ["Notification Management"] },
  { icon: <FaBook />, label: "Study Material", subItems: ["Study Material Management"] },
  { icon: <FaClipboardCheck />, label: "Website Management", subItems: ["CRM Front Management"] },
  { icon: <FaSignOutAlt />, label: "Logout" },
];

const componentMap = {
  "Staff": StaffData,
  "Teacher": TeacherData,
  "Teacher Management": TeacherManagement,
  "Student Management": StudentManagement,
  "Parent Management": ParentsManagement,
  "Course Management": CourseManagement,
  "Attendance Management": AttendanceManagement,
  // "Online Exam Report": OnlineExamReport,
  "Study Material Management": StudyMaterialManagement,
  "Edit Account": EditAccount,
  "View Accounts": ViewAccount,
  "View Notification": NotificationOption,
  "Fees": StudentFeeManagementStaff, // Map the main Staff Student Fee Management component
  "Fee Structure Management": FeeStructureManagement, // Map Fee Structure Management component
};

const StaffDashboard = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeComponent, setActiveComponent] = useState("Staff");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    name: "",
    role: "",
    schoolName: "",
    schoolId: ""
  });

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

      // Token is valid, set user info
      const name = localStorage.getItem("userName");
      const role = localStorage.getItem("role");
      const schoolName = localStorage.getItem("schoolName");
      const schoolId = localStorage.getItem("schoolId");

      if (!name || !role) {
        toast.error("Invalid user credentials");
        handleLogout();
        return;
      }

      // Check if user has proper role (case-insensitive check)
      const lowerCaseRole = role.toLowerCase();
      if (lowerCaseRole !== "staff" && lowerCaseRole !== "admin") {
        toast.error("You don't have permission to access this dashboard");
        handleLogout();
        return;
      }

      setUserInfo({
        name: name || "",
        role: role || "Staff",
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

  const handleLogout = () => {
    // Clear all stored credentials
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    localStorage.removeItem("schoolName");
    localStorage.removeItem("schoolId");

    // Set authentication state
    setIsAuthenticated(false);

    // Redirect to login page
    navigate("/user-login");

    // Show logout success message
    toast.success("Logged out successfully");
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

  const ActiveComponent = componentMap[activeComponent] || StaffData;

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Validating session...</p>
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
          <div className="p-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg shadow-red-100/50 p-6 border border-red-100">
              <h1 className="text-2xl font-bold mb-4 text-red-700">Staff Dashboard</h1>
              {/* Pass schoolId and token to the active component */}
              {ActiveComponent ? (
                <ActiveComponent schoolId={userInfo.schoolId} token={localStorage.getItem("token")} />
              ) : (
                <StaffData schoolId={userInfo.schoolId} token={localStorage.getItem("token")} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;