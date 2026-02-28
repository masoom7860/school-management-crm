import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaPalette, FaBolt, FaChartBar, FaUser, FaCog } from 'react-icons/fa';
import EnhancedDashboardCard from '../components/subadmin/EnhancedDashboardCard';
import AnimatedDashboardCharts from '../components/subadmin/AnimatedDashboardCharts';
import { AnimatedModal, ConfirmModal, NotificationModal } from '../components/common/AnimatedModals';
import { ThemeSwitcher, AnimationSpeedSelector } from '../contexts/ThemeContext';
import { CardSkeleton, ChartSkeleton, FormSkeleton } from '../components/common/LoadingSkeletons';
import { usePageTransition } from '../contexts/ThemeContext';
import { buttonVariants } from '../utils/animations';

const UIDemoPage = () => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('success');
  const [loading, setLoading] = useState(false);
  
  const pageTransition = usePageTransition();

  const handleConfirmAction = () => {
    setShowConfirm(false);
    setShowNotification(true);
    setNotificationType('success');
  };

  const showLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6"
      {...pageTransition}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-gray-800 mb-2">UI Enhancement Demo</h1>
          <p className="text-gray-600">Showcasing beautiful Framer Motion animations and components</p>
        </motion.div>

        {/* Theme Controls */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <ThemeSwitcher />
          <AnimationSpeedSelector />
        </motion.div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-wrap gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FaUser className="inline mr-2" />
            Open Modal
          </motion.button>
          
          <motion.button
            onClick={() => setShowConfirm(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FaCog className="inline mr-2" />
            Confirm Action
          </motion.button>
          
          <motion.button
            onClick={showLoadingDemo}
            className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <FaBolt className="inline mr-2" />
            Loading Demo
          </motion.button>
        </motion.div>

        {/* Dashboard Cards Demo */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaChartBar /> Animated Dashboard Cards
          </h2>
          {loading ? <CardSkeleton /> : <EnhancedDashboardCard />}
        </motion.section>

        {/* Charts Demo */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaChartBar /> Animated Charts
          </h2>
          {loading ? <ChartSkeleton /> : <AnimatedDashboardCharts />}
        </motion.section>

        {/* Form Skeleton Demo */}
        <motion.section 
          className="mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <FaPalette /> Form Loading State
          </h2>
          {loading ? <FormSkeleton /> : (
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Sample Form</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input 
                    type="email" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
                <motion.button
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Submit Form
                </motion.button>
              </div>
            </div>
          )}
        </motion.section>

        {/* Modals */}
        <AnimatedModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Sample Modal"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-gray-600">
              This is a beautifully animated modal with smooth transitions and hover effects.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">Features:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Smooth entrance and exit animations</li>
                <li>• Backdrop overlay with fade effect</li>
                <li>• Interactive hover states</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>
        </AnimatedModal>

        <ConfirmModal
          isOpen={showConfirm}
          onClose={() => setShowConfirm(false)}
          onConfirm={handleConfirmAction}
          title="Confirm Action"
          message="Are you sure you want to perform this action? This cannot be undone."
          type="warning"
        />

        <NotificationModal
          isOpen={showNotification}
          onClose={() => setShowNotification(false)}
          title="Action Completed"
          message="Your action has been successfully completed!"
          type={notificationType}
        />
      </div>
    </motion.div>
  );
};

export default UIDemoPage;