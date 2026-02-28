import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaCheck, FaExclamationTriangle, FaInfoCircle } from 'react-icons/fa';
import { modalVariants, overlayVariants, buttonVariants } from '../../utils/animations';

const AnimatedModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-xl',
    lg: 'max-w-3xl',
    xl: 'max-w-5xl',
    full: 'max-w-7xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="flex items-center justify-center min-h-screen p-4">
            <motion.div
              className={`relative bg-white rounded-2xl shadow-2xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-hidden`}
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
                {showCloseButton && (
                  <motion.button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <FaTimes className="text-lg" />
                  </motion.button>
                )}
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action",
  message = "Are you sure you want to proceed?",
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning" // warning, success, error, info
}) => {
  const typeConfig = {
    warning: {
      icon: <FaExclamationTriangle className="text-yellow-500 text-2xl" />,
      confirmClass: "bg-yellow-500 hover:bg-yellow-600"
    },
    success: {
      icon: <FaCheck className="text-green-500 text-2xl" />,
      confirmClass: "bg-green-500 hover:bg-green-600"
    },
    error: {
      icon: <FaExclamationTriangle className="text-red-500 text-2xl" />,
      confirmClass: "bg-red-500 hover:bg-red-600"
    },
    info: {
      icon: <FaInfoCircle className="text-blue-500 text-2xl" />,
      confirmClass: "bg-blue-500 hover:bg-blue-600"
    }
  };

  const config = typeConfig[type] || typeConfig.warning;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
          />
          
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                {config.icon}
                <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
              </div>
              
              <p className="text-gray-600 mb-6">{message}</p>
              
              <div className="flex gap-3 justify-end">
                <motion.button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  onClick={onConfirm}
                  className={`px-4 py-2 rounded-lg text-white ${config.confirmClass} transition-colors`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const NotificationModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = "success",
  autoClose = true,
  autoCloseDelay = 3000
}) => {
  const typeConfig = {
    success: {
      icon: <FaCheck className="text-green-500 text-2xl" />,
      bgClass: "bg-green-50 border-green-200",
      borderClass: "border-l-4 border-green-500"
    },
    error: {
      icon: <FaExclamationTriangle className="text-red-500 text-2xl" />,
      bgClass: "bg-red-50 border-red-200",
      borderClass: "border-l-4 border-red-500"
    },
    warning: {
      icon: <FaExclamationTriangle className="text-yellow-500 text-2xl" />,
      bgClass: "bg-yellow-50 border-yellow-200",
      borderClass: "border-l-4 border-yellow-500"
    },
    info: {
      icon: <FaInfoCircle className="text-blue-500 text-2xl" />,
      bgClass: "bg-blue-50 border-blue-200",
      borderClass: "border-l-4 border-blue-500"
    }
  };

  const config = typeConfig[type] || typeConfig.success;

  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, autoCloseDelay, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed top-4 right-4 z-50">
          <motion.div
            className={`rounded-lg shadow-lg p-4 ${config.bgClass} ${config.borderClass} border`}
            variants={notificationVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-start gap-3">
              {config.icon}
              <div className="flex-1">
                <h4 className="font-semibold text-gray-800">{title}</h4>
                <p className="text-gray-600 text-sm mt-1">{message}</p>
              </div>
              <motion.button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <FaTimes />
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export { AnimatedModal, ConfirmModal, NotificationModal };