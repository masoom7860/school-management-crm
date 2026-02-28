import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, 
  FaEnvelope, 
  FaBell, 
  FaGlobe, 
  FaCheckCircle, 
  FaCalendar, 
  FaCog,
  FaUser,
  FaSignOutAlt,
  FaCaretDown
} from "react-icons/fa";
import { buttonHover, dropdownVariants, notificationVariants } from "../utils/animations";

const Navbar = ({ toggleSidebar, name, role, schoolName, onLogout, children }) => {
  const [showMessages, setShowMessages] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [notificationCount] = useState(3); // This would come from your notification system

  const adminName = name || localStorage.getItem("adminName") || "User";
  const userRole = role || localStorage.getItem("role") || "Role";
  const school = schoolName || localStorage.getItem("schoolName") || "School";

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <motion.nav 
      className="bg-gradient-to-r from-white to-gray-50 shadow-lg p-4 flex justify-between items-center border-b border-gray-100"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <motion.button 
            onClick={toggleSidebar} 
            className="mr-4 text-gray-600 hover:text-red-600 font-bold text-lg lg:hidden p-2 rounded-lg hover:bg-gray-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            ☰
          </motion.button>
        )}
        
        {/* Animated Search Bar */}
        <motion.div 
          className="flex items-center bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <FaSearch className="text-gray-400 mr-3" />
          <input 
            type="text" 
            placeholder="Find Something..." 
            className="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-64" 
          />
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.05 }}
        >
          <motion.button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full bg-white shadow-sm hover:shadow-md transition-all duration-200"
            whileTap={{ scale: 0.95 }}
          >
            <FaBell className="text-gray-600 text-xl" />
            {notificationCount > 0 && (
              <motion.span 
                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.2 }}
              >
                {notificationCount}
              </motion.span>
            )}
          </motion.button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={notificationVariants}
              >
                <div className="p-4 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {[1, 2, 3].map((item) => (
                    <motion.div
                      key={item}
                      className="p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: item * 0.1 }}
                      whileHover={{ backgroundColor: "rgb(249, 250, 251)" }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-2 rounded-full">
                          <FaCheckCircle className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">New student registration</h4>
                          <p className="text-sm text-gray-500 mt-1">John Doe has been registered</p>
                          <span className="text-xs text-gray-400">2 hours ago</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-gray-100">
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                    View All Notifications
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Profile Dropdown */}
        <motion.div 
          className="relative"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button 
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <motion.div 
              className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold shadow-md"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {adminName.charAt(0)}
            </motion.div>
            <div className="hidden md:block text-left">
              <motion.h5 
                className="font-semibold text-gray-800"
                whileHover={{ color: "#dc2626" }}
              >
                {school}
              </motion.h5>
              <p className="text-xs text-gray-500">{userRole} - {adminName}</p>
            </div>
            <motion.div
              animate={{ rotate: showProfile ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaCaretDown className="text-gray-400 text-sm" />
            </motion.div>
          </motion.button>
          
          <AnimatePresence>
            {showProfile && (
              <motion.div
                className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-100 z-50"
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {adminName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{adminName}</h4>
                      <p className="text-sm text-gray-500">{userRole}</p>
                      <p className="text-xs text-gray-400">{school}</p>
                    </div>
                  </div>
                </div>
                
                <div className="py-2">
                  <motion.button 
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
                    whileHover={{ backgroundColor: "rgb(249, 250, 251)", x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaUser className="text-gray-500" />
                    <span className="text-gray-700">My Profile</span>
                  </motion.button>
                  
                  <motion.button 
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150"
                    whileHover={{ backgroundColor: "rgb(249, 250, 251)", x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaCog className="text-gray-500" />
                    <span className="text-gray-700">Settings</span>
                  </motion.button>
                  
                  <motion.button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-red-50 transition-colors duration-150 text-red-600"
                    whileHover={{ backgroundColor: "rgb(254, 242, 242)", x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FaSignOutAlt className="text-red-500" />
                    <span className="font-medium">Logout</span>
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {children}
      </div>
    </motion.nav>
  );
};

export default Navbar;