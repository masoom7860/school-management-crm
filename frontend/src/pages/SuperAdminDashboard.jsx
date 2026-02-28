import { useState } from 'react'
import { FaHome, FaUsers, FaCog } from "react-icons/fa";
import { motion, AnimatePresence } from 'framer-motion';
import { staggerContainer, fadeIn } from '../utils/animations';
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar';
import SchoolList from '../components/superadmin/SchoolList';
import CreateSchoolForm from '../components/superadmin/CraeteSchoolForm';
import SuperAdminData from '../components/superadmin/SuperAdminData';
import SystemSettings from '../components/superadmin/SystemSettings';
import WebsiteSettings from '../components/superadmin/WebsiteSettings';
import ManageFAQ from '../components/superadmin/ManageFAQ';
import PaymentSystem from '../components/superadmin/PaymentSystem';
import SmtpSetting from '../components/superadmin/SmtpSetting';
import AboutSection from '../components/superadmin/AboutSection';
import RegistrationForm from '../components/RegistrationForm';
import { useNavigate } from 'react-router-dom';
import AllAdminsList from '../components/superadmin/AllAdminsList';
import AllSuperAdmins from '../components/superadmin/AllSuperAdmins';

const menuItems = [
  { icon: <FaHome />, label: "Overview" },
  { icon: <FaUsers />, label: "School" },
  { icon: <FaUsers />, label: "Create School" },
  { icon: <FaUsers />, label: "All Admins" },
  { icon: <FaUsers />, label: "All Super Admins" },
  { icon: <FaCog />, label: "Settings", subItems: ["System Setting", "Website Setting", "Manage FAQ", "Payment Setting", "Smtp Setting", "About"] },
  { icon: <FaUsers />, label: "Logout" },
];

const componentMap = {
  "Overview": SuperAdminData,
  "School": SchoolList,
  "Create School": CreateSchoolForm,
  "All Admins": AllAdminsList,
  "All Super Admins": AllSuperAdmins,
  "System Setting": SystemSettings,
  "Website Setting": WebsiteSettings,
  "Manage FAQ": ManageFAQ,
  "Payment Setting": PaymentSystem,
  "Smtp Setting": SmtpSetting,                                                                                          
  "About": AboutSection
};

const SuperAdminDashboard = () => {
  const [isSidebarExpanded, setSidebarExpanded] = useState(true);
  const [activeComponent, setActiveComponent] = useState("Overview");
  const [showAddSchoolModal, setShowAddSchoolModal] = useState(false);
  const [schoolListKey, setSchoolListKey] = useState(0);
  const navigate = useNavigate();

  const handleMenuClick = (label) => {
    if (label === "Logout") {
      handleLogout();
    } else {
      setActiveComponent(label);
    }
  };

  const handleAddSchoolClose = () => {
    setShowAddSchoolModal(false);
    setSchoolListKey(prev => prev + 1);
  };

  const handleLogout = () => {
    localStorage.removeItem('superadmin_token');
    navigate('/superadmin-login');
  };

  const ActiveComponent = componentMap[activeComponent] ;

  return (
    <div className="flex">
      <Sidebar menuItems={menuItems} onMenuClick={handleMenuClick} isExpanded={isSidebarExpanded} />
      <div className="flex-1 flex flex-col min-h-screen">
        <Navbar toggleSidebar={() => setSidebarExpanded(!isSidebarExpanded)} />
        <div className="bg-gradient-to-br from-red-50 via-white to-black-50 flex-1">
          <div className='p-6'>
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg shadow-red-100/50 p-6 border border-red-100">
              {activeComponent === "School" ? <SchoolList key={schoolListKey} /> : <ActiveComponent />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard