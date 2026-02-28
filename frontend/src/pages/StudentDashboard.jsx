import { useState, useEffect } from "react";
import { FaHome, FaUsers, FaClipboardCheck, FaBook, FaSignOutAlt } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn } from '../utils/animations';
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";
import { toast } from 'react-hot-toast';
import "react-toastify/dist/ReactToastify.css";

import Breadcrumb from '../components/Breadcrumb';
import StudentCertificate from '../components/students/StudentCertficate';
import StudentFeedback from '../components/students/StudentFeedback';
import StudentStudyMaterial from '../components/students/StudentStudyMaterial';
import ViewAttendance from '../components/students/ViewAttendance';
import StudentAdmission from '../components/students/StudentAdmission';

import ExaminationReport from "../components/students/ExaminationReport";
import Notification from "../components/students/Notification";
import StudentData from "../components/students/StudentData";
import MyFees from "../components/students/MyFees"; // Import the new MyFees component

// Remove imports for redundant fee components
// import StudentFeeStatusTable from '../modules/fee-management/staff/StudentFeeStatusTable';
// import StudentFeeTimeline from '../modules/fee-management/staff/StudentFeeTimeline';
// Remove import for old OnlineFee component
// import OnlineFee from "../components/students/OnlineFee";


const menuItems = [
    { icon: <FaHome />, label: "Dashboard" },
    { icon: <FaUsers />, label: "Student Certificate" },
    { icon: <FaClipboardCheck />, label: "Student Feedback" },
    { icon: <FaClipboardCheck />, label: "Student Study Material" },
    { icon: <FaClipboardCheck />, label: "View Attendance" },
    { icon: <FaClipboardCheck />, label: "Student Admission" },
    { icon: <FaClipboardCheck />, label: "Fee Details" }, // Replaced "Online Fee" with "Fee Details"
    { icon: <FaClipboardCheck />, label: "Examination Report" },
    // Remove menu items for redundant fee components
    // { icon: <FaClipboardCheck />, label: "Student Fee Status" },
    // { icon: <FaClipboardCheck />, label: "Student Fee Timeline" },
    { icon: <FaClipboardCheck />, label: "Notification" },
    { icon: <FaSignOutAlt />, label: "Logout" },
];

const componentMap = {
    "Dashboard": StudentData,
    "Student Certificate": StudentCertificate,
    "Student Feedback": StudentFeedback,
    "Student Study Material": StudentStudyMaterial,
    "View Attendance": ViewAttendance,
    "Student Admission": StudentAdmission,
    "Fee Details": MyFees, // Mapped "Fee Details" to the new MyFees component
    "Examination Report": ExaminationReport,
    "Notification": Notification,
    // Remove mappings for redundant fee components
    // "Student Fee Status": StudentFeeStatusTable,
    // "Student Fee Timeline": StudentFeeTimeline,
};

const StudentDashboard = () => {
    const [isSidebarExpanded, setSidebarExpanded] = useState(true);
    const [activeComponent, setActiveComponent] = useState("Dashboard");
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

            setUserInfo({
                name: name || "",
                role: role || "Student",
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

    const handleMenuClick = (label) => {
        if (label === "Logout") {
            handleLogout();
        } else {
            setActiveComponent(label);
        }
    };

    const ActiveComponent = componentMap[activeComponent] || StudentData;

    if (!isAuthenticated) {
        return null; // or a loading spinner while redirecting
    }

    return (
        <div className="flex">
            <Sidebar menuItems={menuItems} onMenuClick={handleMenuClick} isExpanded={isSidebarExpanded} onToggle={() => setSidebarExpanded(!isSidebarExpanded)} />
            <div className="flex-1 flex flex-col min-h-screen">
                <Navbar
                    toggleSidebar={() => setSidebarExpanded(!isSidebarExpanded)}
                    name={userInfo.name}
                    role={userInfo.role}
                    schoolName={userInfo.schoolName}
                    onLogout={handleLogout} // Pass logout handler to Navbar
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
                          <h1 className="text-2xl font-bold mb-4 text-red-700">Student Dashboard</h1>
                          <Breadcrumb currentPage={activeComponent} />
                          {/* Pass studentId and token to the active component */}
                          {ActiveComponent ? (
                              <ActiveComponent studentId={userInfo.studentId} token={localStorage.getItem("token")} />
                          ) : (
                              <StudentData studentId={userInfo.studentId} token={localStorage.getItem("token")} />
                          )}
                        </div>
                      </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;