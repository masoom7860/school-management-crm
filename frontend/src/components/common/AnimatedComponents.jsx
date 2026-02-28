import React from 'react';
import { motion } from 'framer-motion';
import { buttonVariants, inputVariants } from '../../utils/animations';

// Animated Button Component
export const AnimatedButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = "font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500",
    secondary: "bg-gradient-to-r from-green-500 to-teal-600 text-white hover:from-green-600 hover:to-teal-700 focus:ring-green-500",
    accent: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 focus:ring-yellow-500",
    danger: "bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700 focus:ring-red-500",
    outline: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500",
    ghost: "text-gray-700 hover:bg-gray-100 focus:ring-gray-500"
  };
  
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };

  return (
    <motion.button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      variants={buttonVariants}
      whileHover="hover"
      whileTap="tap"
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Animated Input Component
export const AnimatedInput = ({ 
  label, 
  error, 
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <motion.label 
          className="block text-sm font-medium text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {label}
        </motion.label>
      )}
      <motion.input
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none transition-all duration-200 ${
          error ? 'border-red-500 focus:ring-2 focus:ring-red-500' : 'focus:ring-2 focus:ring-blue-500 focus:border-transparent'
        } ${className}`}
        variants={inputVariants}
        whileFocus="focus"
        whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
        {...props}
      />
      {error && (
        <motion.p 
          className="text-sm text-red-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Animated Select Component
export const AnimatedSelect = ({ 
  label, 
  error, 
  options = [],
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <motion.label 
          className="block text-sm font-medium text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {label}
        </motion.label>
      )}
      <motion.select
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        variants={inputVariants}
        whileFocus="focus"
        whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
        {...props}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value}>
            {option.label}
          </option>
        ))}
      </motion.select>
      {error && (
        <motion.p 
          className="text-sm text-red-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Animated Textarea Component
export const AnimatedTextarea = ({ 
  label, 
  error, 
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <motion.label 
          className="block text-sm font-medium text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {label}
        </motion.label>
      )}
      <motion.textarea
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none ${
          error ? 'border-red-500' : ''
        } ${className}`}
        variants={inputVariants}
        whileFocus="focus"
        whileHover={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
        {...props}
      />
      {error && (
        <motion.p 
          className="text-sm text-red-500"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Animated Form Component
export const AnimatedForm = ({ children, onSubmit, className = '' }) => {
  return (
    <motion.form
      className={className}
      onSubmit={onSubmit}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.form>
  );
};

// Animated Card Component
export const AnimatedCard = ({ 
  children, 
  className = '',
  hoverEffect = true,
  ...props 
}) => {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden ${className}`}
      variants={buttonVariants}
      whileHover={hoverEffect ? "hover" : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Animated Badge Component
export const AnimatedBadge = ({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}) => {
  const variantClasses = {
    primary: "bg-blue-100 text-blue-800",
    secondary: "bg-green-100 text-green-800",
    accent: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-orange-100 text-orange-800"
  };

  return (
    <motion.span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      {...props}
    >
      {children}
    </motion.span>
  );
};

// Animated Toggle Switch
export const AnimatedToggle = ({ 
  checked, 
  onChange, 
  label,
  ...props 
}) => {
  return (
    <div className="flex items-center gap-3">
      <motion.button
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-blue-500' : 'bg-gray-300'
        }`}
        whileTap={{ scale: 0.95 }}
        {...props}
      >
        <motion.div
          className="absolute w-5 h-5 bg-white rounded-full shadow-md top-0.5"
          animate={{ 
            left: checked ? '26px' : '2px'
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </motion.button>
      {label && (
        <span className="text-sm text-gray-700">{label}</span>
      )}
    </div>
  );
};