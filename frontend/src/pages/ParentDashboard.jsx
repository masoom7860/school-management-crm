import { useState, useEffect } from "react";
import { FaHome, FaUsers, FaClipboardCheck } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn } from '../utils/animations';

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import Breadcrumb from '../components/Breadcrumb';

import ParentsData from '../components/parents/ParentsData';
import StudentCertificate from '../components/students/StudentCertficate';
import StudentFeedback from '../components/students/StudentFeedback';
import StudentStudyMaterial from '../components/students/StudentStudyMaterial';
import ViewAttendance from '../components/students/ViewAttendance';
import StudentAdmission from '../components/students/StudentAdmission';
import ExaminationReport from "../components/students/ExaminationReport";
import Notification from "../components/students/Notification";

// Remove imports for redundant fee components
// import StudentFeeStatusTable from '../modules/fee-management/staff/StudentFeeStatusTable';
// import StudentFeeTimeline from '../modules/fee-management/staff/StudentFeeTimeline';

const menuItems = [
  { icon: <FaHome />, label: "Dashboard" },
  { icon: <FaUsers />, label: "Student Certificate" },
  { icon: <FaClipboardCheck />, label: "Student Feedback" },
  { icon: <FaClipboardCheck />, label: "Student Study Material" },
  { icon: <FaClipboardCheck />, label: "View Attendance" },
  { icon: <FaClipboardCheck />, label: "Student Admission" },
  { icon: <FaClipboardCheck />, label: "Examination Report" },
  { icon: <FaClipboardCheck />, label: "Notification" },
];

const componentMap = {
  "Dashboard": ParentsData,
  "Student Certificate": StudentCertificate,
  "Student Feedback": StudentFeedback,
  "Student Study Material": StudentStudyMaterial,
  "View Attendance": ViewAttendance,
  "Student Admission": StudentAdmission,
  "Examination Report": ExaminationReport,
  "Notification": Notification,
  // Remove mappings for redundant fee components
  // "Student Fee Status": StudentFeeStatusTable,
  // "Student Fee Timeline": StudentFeeTimeline,
};

const ParentDashboard = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeComponent, setActiveComponent] = useState("Dashboard");
  const [userInfo, setUserInfo] = useState({
    name: "",
    role: "",
    schoolName: "",
  });

  useEffect(() => {
    const name = localStorage.getItem("parentName") || "Parent";
    const role = "Parent";
    const schoolName = localStorage.getItem("schoolName") || "School";

    setUserInfo({ name, role, schoolName });
  }, []);

  const handleMenuClick = (label) => {
    setActiveComponent(label);
  };

  const ActiveComponent = componentMap[activeComponent] || ParentsData;

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
        />
        <div className="bg-gradient-to-br from-red-50 via-white to-black-50 flex-1">
          <div className="p-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg shadow-red-100/50 p-6 border border-red-100">
              <h1 className="text-2xl font-bold mb-4 text-red-700">Parent Dashboard</h1>
              <Breadcrumb currentPage={activeComponent} />
              <ActiveComponent />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;