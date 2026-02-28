// src/pages/AdminDashboard.js
import { useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import {
  FaHome, FaUsers, FaChalkboardTeacher,
  FaClipboardCheck, FaGraduationCap, FaBook, FaCog,
  FaSignOutAlt, FaCreditCard
} from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn } from '../utils/animations';
// import GlobalFooter from '../components/GlobalFooter.jsx';

// Import the new Fee Management components
// import FeeStructureManagement from '../components/admin/FeeStructureManagement'; // For Fee Structures
// import AdminStudentFeeManagement from '../components/admin/StudentFeeManagement'; // Admin Student Fee Management
import { AddFeeMonths, SetClassFees, SubmitFees } from '../components/admin/fees';
// import StaffStudentFeeManagement from '../components/staff/StudentFeeManagement'; // Staff Student Fee Management
import RazorpayConfigManagement from '../components/admin/RazorpayConfigManagement'; // Import Razorpay config component
import DesignationManagement from '../components/admin/DesignationManagement'; // Import Designation Management component
// Import other component pages
import AdminData from '../components/subadmin/AdminData';
import TeacherData from '../components/teachers/TeacherData';
import StudentManagement from '../components/teachers/studentmanagement/StudentManagement';
import UpdateStudent from '../components/teachers/studentmanagement/UpdateStudent';
import AllStudent from '../components/teachers/studentmanagement/AllStudent';
// import ParentsManagement from '../components/staff/ParentsManagement';
// import AttendanceManagement from '../components/teachers/AttendanceManagement';
import TeacherManagement from '../components/staff/TeacherManagement';
import SessionManagement from '../components/admin/SessionManagement';
import ClassManagement from '../components/admin/ClassManagement';
import SubjectManagement from '../components/admin/SubjectManagement';
import AttendanceManagement from '../components/teachers/AttendanceManagement'
// import CourseManagement from '../components/staff/CourseManagement';
// import CertificateManagement from '../components/staff/CertificateManagement';
// import OnlineExamReport from '../components/teachers/OnlineExamReport';
import EditAccount from '../components/teachers/EditAccount';
import ViewAccount from '../components/teachers/ViewAccount';
import StaffManagement from '../components/subadmin/StaffManagement';
import SchoolImageManagement from '../components/admin/SchoolImageUpload';
import PrintManagement from '../components/admin/PrintManagement';
import PrintManagementStaff from '../components/admin/PrintManagementStaff';
// import Marksheet from '../components/teachers/MarksheetManagement';
// import CreateMarksheet from './admin/marksheet/CreateMarksheet';
// import BulkMarksheetEntry from './admin/marksheet/BulkMarksheetEntry';
import SetMaximumMarks from '../components/admin/SetMaximumMarks';
import FillMarksheet from '../components/admin/FillMarksheet';
// import CertificateForm from '../components/admin/CertificateForm';
import CertificatePage from '../components/admin/CertificatePage';
import PrintMarksheet from '../components/admin/PrintMarksheet';
// import PrintCertificate from '../components/admin/PrintCertificate';
// import StaffIdCard from '../components/admin/PrintDash/StaffCard';
// import SubAdminManagement from '../components/admin/SubAdminManagement';
// import WebsiteManagement from '../components/subadmin/WebsiteManagement';
// import { updateStudent } from '../../../backend/controllers/studentController';

const menuItems = [
  { icon: <FaHome />, label: "Admin" },
  { icon: <FaUsers />, label: "School Images" },
  { icon: <FaUsers />, label: "Print",subItems: ["Student Id Card","Staff Id Card","Print Marksheet"]  },
  { icon: <FaUsers />, label: "Staff Management" },
  // { icon: <FaUsers />, label: "Manage Sub Admin" },
  { icon: <FaChalkboardTeacher />, label: "Teacher Management" },
  { icon: <FaUsers />, label: "Student Management" ,subItems: ["Add Student", "Update Student"] },
  // { icon: <FaUsers />, label: "Parent's Management" },
  {icon:<FaUsers/>,label:"Attendance Management"},
  {icon:<FaUsers/>,label:"Exam Management",subItems:["Fill Marksheet"]},
  // { icon: <FaBook />, label: "Marksheet",subItems: ["Create Marksheet", "Bulk Marksheet Entry"] },
  { icon: <FaBook />, label: "Set Maximum Marks" },

  { icon: <FaBook />, label: "Add Designation" },
  { icon: <FaBook />, label: "Session Management" },
  { icon: <FaBook />, label: "Class Management" },
  { icon: <FaBook />, label: "Subject Management" },
  { icon: <FaBook />, label: "Certificate" },
  {
    icon: <FaClipboardCheck />,
    label: "Fee Management",
    subItems: [
      // "Fee Structure Management",
      "Set Fees",
      "Set Month Fee",
      "Submit Fees",
      // "Student Fee Management",
    ]
  },
  // { icon: <FaCreditCard />, label: "Payment Settings", subItems: ["Razorpay Configuration"] }, // New Payment Settings menu
  // { icon: <FaClipboardCheck />, label: "Attendance Management" },
  // { icon: <FaGraduationCap />, label: "Certificate Management" },
  // { icon: <FaGraduationCap />, label: "Online Exam & Report Management" },
  { icon: <FaCog />, label: "Edit Account" },
  { icon: <FaCog />, label: "View Account" },
  // { icon: <FaUsers />, label: "All Super Admins" },
  // { icon: <FaCog />, label: "Website Management" },
  { icon: <FaSignOutAlt />, label: "Logout" }
];

const componentMap = {
  "Admin": AdminData,
  "School Images": SchoolImageManagement,
  "Student Id Card": PrintManagement,
  "Staff Id Card": PrintManagementStaff,
  "Certificate": CertificatePage,
  // "Print Certificate": CertificatePage,
  "Print Marksheet": PrintMarksheet,
  "Attendance Management":AttendanceManagement,
  "Teacher": TeacherData,
  // "Marksheet":Marksheet,
  "Set Maximum Marks":SetMaximumMarks,
  // "Create Marksheet":CreateMarksheet,
  // "Bulk Marksheet Entry":BulkMarksheetEntry,
  // Mapped new fee components
  "Add Designation": DesignationManagement,
  // "Fee Structure Management": FeeStructureManagement,
  "Set Fees": AddFeeMonths,
  "Set Month Fee": SetClassFees,
  "Submit Fees": SubmitFees,
  // "Student Fee Management": AdminStudentFeeManagement, // Map to the admin component
  // "Staff Student Fee Management": StaffStudentFeeManagement, // Keep staff component if needed elsewhere
  "Razorpay Configuration": RazorpayConfigManagement, // New mapping for Razorpay config

  // "Manage Sub Admin": SubAdminManagement,
  "Staff Management": StaffManagement,
  "Add Student": StudentManagement,
  "Update Student":UpdateStudent,
  "All Student": AllStudent,
  "Teacher Management": TeacherManagement,
  // "Parent's Management": ParentsManagement,
  "Session Management": SessionManagement,
  "Class Management": ClassManagement,
  "Subject Management": SubjectManagement,
  "Fill Marksheet":FillMarksheet,
  // "Student Marksheet":StudentMarksheet,
  // "Attendance Management": AttendanceManagement,
  // "Course Management": CourseManagement,
  // "Online Exam & Report Management": OnlineExamReport,
  "Edit Account": EditAccount,
  "View Account": ViewAccount,
  // "All Super Admins": AdminData,
  // "Certificate Management": CertificateManagement,
  // "Website Management": WebsiteManagement
};

const AdminDashboard = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeComponent, setActiveComponent] = useState("Admin");
  const navigate = useNavigate();

  const [userInfo, setUserInfo] = useState({
    name: "",
    role: "",
    schoolName: "",
    schoolId: ""
  });

  useEffect(() => {
    const name = localStorage.getItem("adminName");
    const role = localStorage.getItem("role");
    const schoolName = localStorage.getItem("schoolName");
    const schoolId = localStorage.getItem("schoolId");
    const token = localStorage.getItem("token");

    // Check if user is authenticated
    if (!token) {
      navigate("/"); // Redirect to homepage if not logged in
      return;
    }

    let decodedSchoolName = "";
    if (token) {
      try {
        const decoded = jwt_decode(token);
        decodedSchoolName = decoded.schoolName || schoolName;
        
        // Check if token is expired
        if (decoded.exp && decoded.exp < Date.now() / 1000) {
          handleLogout();
          return;
        }
      } catch (err) {
        console.error("Failed to decode token", err);
        handleLogout();
        return;
      }
    }

    setUserInfo({
      name: name || "Unknown",
      role: role || "Unknown",
      schoolName: decodedSchoolName || schoolName || "Unknown School",
      schoolId: schoolId || ""
    });
  }, [navigate]);

  const handleMenuClick = (label) => {
    // console.log("Clicked menu item:", label);
    if (label === "Logout") {
      handleLogout();
    } else {
      setActiveComponent(label);
    }
  };

  const handleLogout = () => {
    // Clear all user-related data from localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("adminName");
    localStorage.removeItem("role");
    localStorage.removeItem("schoolName");
    localStorage.removeItem("schoolId");
    
    // Redirect to homepage
    navigate("/");
  };

  const ActiveComponent = componentMap[activeComponent];

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
          showSidebarToggle={true}
          logoUrl={localStorage.getItem("schoolLogo")}
        >
          {/* Logout button is handled by sidebar, so don't show here */}
        </Navbar>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeComponent}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="p-0 flex-1"
          >
            <div className="bg-gradient-to-br from-red-50 via-white to-black-50 min-h-screen">
              <div className="w-full p-0">
                <div className="w-full bg-white/80 backdrop-blur-sm rounded-none shadow-lg shadow-red-100/50 ring-0 border border-red-100">
                  <div className="p-6">
                    {/* Pass schoolId and token to the active component */}
                    {ActiveComponent ? (
                      <ActiveComponent schoolId={userInfo.schoolId} token={localStorage.getItem("token")} />
                    ) : (
                      <AdminData schoolId={userInfo.schoolId} token={localStorage.getItem("token")} />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        {/* <GlobalFooter /> */}
      </div>
    </div>
  );
};

export default AdminDashboard;