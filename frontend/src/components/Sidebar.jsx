import { useState } from "react";
import {
  FaBars, 
  FaChevronDown,
  FaHome,
  FaUsers,
  FaChalkboardTeacher,
  FaBook,
  FaCog,
  FaSignOutAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { sidebarVariants, menuItemVariants, submenuVariants, buttonHover } from "../utils/animations";

const Sidebar = ({ menuItems, onMenuClick, isExpanded = true, onToggle }) => {
  const [expandedSubmenus, setExpandedSubmenus] = useState({});

  const toggleSubmenu = (label) => {
    setExpandedSubmenus(prev => ({
      ...prev,
      [label]: !prev[label]
    }));
  };

  const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
  const logoRaw = typeof window !== "undefined" ? localStorage.getItem("schoolLogo") : null;
  const logo = logoRaw ? (logoRaw.startsWith("http") ? logoRaw : `${baseURL}/${logoRaw}`) : null;

  return (
    <motion.aside
      className="flex min-h-screen bg-gradient-to-b from-gray-900 to-black text-white shadow-2xl"
      variants={sidebarVariants}
      initial={isExpanded ? "expanded" : "collapsed"}
      animate={isExpanded ? "expanded" : "collapsed"}
      whileHover="hover"
    >
      <div className="flex flex-col w-full">
        {/* Animated Sidebar Header */}
        <motion.div 
          className="flex items-center justify-between px-4 py-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <motion.button 
            className="bg-gradient-to-r from-yellow-500 to-orange-500 p-3 rounded-full text-black shadow-lg"
            onClick={() => onToggle && onToggle()}
            variants={buttonHover}
            whileHover="hover"
            whileTap="tap"
          >
            <FaBars />
          </motion.button>
          
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                className="flex items-center gap-3"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
              >
                {logo ? (
                  <motion.img
                    src={logo}
                    alt="School Logo"
                    className="w-12 h-12 rounded-full object-cover border-2 border-yellow-400 shadow-lg"
                    onError={e => { e.target.onerror = null; e.target.src = "/default-logo.png"; }}
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                ) : (
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    🏫
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Animated Menu Items */}
        <motion.div 
          className="flex flex-col space-y-1 mt-2 px-2"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.05
              }
            }
          }}
        >
          {menuItems.map((item, index) => (
            <motion.div 
              key={index}
              variants={menuItemVariants}
              whileHover="hover"
              className="relative"
            >
              <motion.div
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  item.label === 'Logout' 
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white font-bold shadow-lg' 
                    : 'hover:from-red-600 hover:to-red-700 hover:shadow-lg'
                }`}
                onClick={() => {
                  if (item.label === 'Logout') {
                    onMenuClick('Logout');
                  } else if (item.subItems) {
                    // If it has subItems, toggle the submenu instead of navigating
                    toggleSubmenu(item.label);
                  } else {
                    onMenuClick(item.label);
                  }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-4">
                  <motion.span 
                    className="text-xl"
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    {item.icon}
                  </motion.span>
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span 
                        className="text-sm font-medium"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                
                <AnimatePresence>
                  {isExpanded && item.subItems && (
                    <motion.button
                      onClick={e => { e.stopPropagation(); toggleSubmenu(item.label); }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <motion.div
                        animate={{ rotate: expandedSubmenus[item.label] ? 180 : 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <FaChevronDown />
                      </motion.div>
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Animated Submenu */}
              <AnimatePresence>
                {isExpanded && item.subItems && expandedSubmenus[item.label] && (
                  <motion.div
                    className="ml-2 mt-1"
                    variants={submenuVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                  >
                    <motion.div 
                      className="bg-gray-800 bg-opacity-50 rounded-lg p-2 backdrop-blur-sm"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                    >
                      {item.subItems.map((subItem, subIndex) => (
                        <motion.div
                          key={subIndex}
                          className="p-2 px-4 my-1 rounded-md cursor-pointer text-sm hover:bg-red-600 hover:text-white transition-all duration-200"
                          onClick={() => onMenuClick(subItem)}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: subIndex * 0.05 }}
                          whileHover={{ 
                            x: 5,
                            backgroundColor: "rgba(220, 38, 38, 0.3)",
                            scale: 1.02
                          }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {subItem}
                        </motion.div>
                      ))}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Animated Footer */}
        <motion.div 
          className="mt-auto p-4 text-center text-xs text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
              >
                <div className="text-yellow-400 font-semibold">School Management</div>
                <div className="text-gray-500">System v2.0</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.aside>
  );
};

export default Sidebar;