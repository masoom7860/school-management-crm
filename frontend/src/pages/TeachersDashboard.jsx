import { useState, useEffect } from "react";
import { FaHome, FaUsers, FaClipboardList, FaFileAlt, FaBookOpen, FaUserCog, FaBell, FaSignOutAlt } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn } from '../utils/animations';
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";

import TeacherData from '../components/teachers/TeacherData';
import StudentManagement from '../components/teachers/studentmanagement/StudentManagement';
import UpdateStudent from '../components/teachers/studentmanagement/UpdateStudent';
import AttendanceManagement from '../components/teachers/AttendanceManagement';
import EditAccount from '../components/teachers/EditAccount';
import StudyMaterialManagement from '../components/teachers/StudyMaterialManagement';
import ViewAccount from "../components/teachers/ViewAccount";
import NotificationOption from '../components/teachers/NotificationOption'
import MarksheetManagement from "../components/teachers/MarksheetManagement";
import StandaloneMarksheetList from "../components/teachers/StandaloneMarksheetList";

const menuItems = [
  { icon: <FaHome />, label: "Dashboard" },
  { icon: <FaUsers />, label: "Students Management", subItems: ["Add Student", "Update Student"] },
  { icon: <FaClipboardList />, label: "Attendance", subItems: ["Attendance Management"] },
  { icon: <FaFileAlt />, label: "Marksheet" ,subItems: ["Marksheet","MarkSheetList"]},
  { icon: <FaBookOpen />, label: "Study Material", subItems: ["Study Material Management"] },
  { icon: <FaUserCog />, label: "Accounts", subItems: ["Edit Account", "View Accounts"] },
  { icon: <FaBell />, label: "Notification", subItems: ["View Notification"] },
  { icon: <FaSignOutAlt />, label: "Logout" }, // Added logout option
];

const componentMap = {
  "Dashboard": TeacherData,
  "Add Student": StudentManagement,
  "Update Student": UpdateStudent,
  "Attendance Management": AttendanceManagement,
  "Marksheet": MarksheetManagement,
  "MarkSheetList": StandaloneMarksheetList,
  "Study Material Management": StudyMaterialManagement,
  "Edit Account": EditAccount,
  "View Accounts": ViewAccount,
  "View Notification": NotificationOption,
};

const TeachersDashboard = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    name: "",
    role: "",
    schoolName: "",
    schoolId: ""
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    // Redirect to login if no token found
    if (!token) {
      navigate("/login");
      return;
    }

    // Verify token expiration
    try {
      const decoded = jwt_decode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        handleLogout();
        return;
      }
    } catch (err) {
      console.error("Failed to decode token", err);
      handleLogout();
      return;
    }

    // Set user info if token is valid
    const name = localStorage.getItem("userName");
    const role = localStorage.getItem("role");
    const schoolName = localStorage.getItem("schoolName");
    const schoolId = localStorage.getItem("schoolId");

    setUserInfo({
      name: name || "",
      role: role || "Unknown",
      schoolName: schoolName || "Unknown School", // Fixed: was using schoolId instead of schoolName
      schoolId: schoolId || "",
    });
  }, [navigate]);

  const handleLogout = () => {
    // Clear all stored credentials
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    localStorage.removeItem("role");
    localStorage.removeItem("schoolName");
    localStorage.removeItem("schoolId");
    
    // Redirect to login page
    navigate("/user-login");
  };

  const handleMenuClick = (label) => {
    if (label === "Logout") {
      handleLogout();
    } else {
      setActiveComponent(label);
    }
  };

  const ActiveComponent = componentMap[activeComponent] || TeacherData;

  return (
    <div className="flex">
      <Sidebar menuItems={menuItems} onMenuClick={handleMenuClick} isExpanded={isSidebarExpanded} onToggle={() => setSidebarExpanded(!isSidebarExpanded)} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar
          toggleSidebar={() => setSidebarExpanded(!isSidebarExpanded)}
          name={userInfo.name}
          role={userInfo.role}
          schoolName={userInfo.schoolName}
          onLogout={handleLogout} // Pass logout handler to Navbar if you want a logout button there too
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
                {ActiveComponent ? <ActiveComponent /> : <TeacherData />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default TeachersDashboard;