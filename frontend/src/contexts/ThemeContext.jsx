import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ThemeContext = createContext();

const animationPresets = {
  smooth: {
    duration: 0.3,
    ease: [0.25, 0.46, 0.45, 0.94]
  },
  quick: {
    duration: 0.15,
    ease: [0.4, 0, 0.6, 1]
  },
  bouncy: {
    type: "spring",
    stiffness: 300,
    damping: 20
  },
  gentle: {
    type: "spring",
    stiffness: 100,
    damping: 30
  }
};

const colorThemes = {
  default: {
    primary: 'from-blue-500 to-purple-600',
    secondary: 'from-green-500 to-teal-600',
    accent: 'from-yellow-500 to-orange-500',
    background: 'from-gray-50 to-gray-100'
  },
  ocean: {
    primary: 'from-cyan-500 to-blue-600',
    secondary: 'from-teal-500 to-green-600',
    accent: 'from-blue-400 to-indigo-500',
    background: 'from-blue-50 to-cyan-50'
  },
  sunset: {
    primary: 'from-orange-500 to-red-600',
    secondary: 'from-pink-500 to-rose-600',
    accent: 'from-yellow-400 to-orange-500',
    background: 'from-orange-50 to-red-50'
  },
  forest: {
    primary: 'from-green-500 to-emerald-600',
    secondary: 'from-lime-500 to-green-600',
    accent: 'from-amber-500 to-yellow-500',
    background: 'from-green-50 to-emerald-50'
  }
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('default');
  const [animationSpeed, setAnimationSpeed] = useState('smooth');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const value = {
    theme,
    setTheme,
    animationSpeed,
    setAnimationSpeed,
    isDarkMode,
    setIsDarkMode,
    currentTheme: colorThemes[theme],
    currentAnimation: animationPresets[animationSpeed]
  };

  return (
    <ThemeContext.Provider value={value}>
      <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`${theme}-${isDarkMode}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Custom hook for page transitions
export const usePageTransition = () => {
  const { currentAnimation } = useTheme();
  
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: currentAnimation
  };
};

// Custom hook for card animations
export const useCardAnimation = () => {
  const { currentAnimation } = useTheme();
  
  return {
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    whileHover: { y: -5, transition: { duration: 0.2 } },
    transition: { ...currentAnimation, type: "spring", stiffness: 200 }
  };
};

// Theme switcher component
export const ThemeSwitcher = () => {
  const { theme, setTheme, isDarkMode, setIsDarkMode } = useTheme();
  
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-md">
      <div className="flex gap-2">
        {Object.keys(colorThemes).map((themeName) => (
          <motion.button
            key={themeName}
            onClick={() => setTheme(themeName)}
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${colorThemes[themeName].primary} ${
              theme === themeName ? 'ring-2 ring-offset-2 ring-gray-400' : ''
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
      
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">Dark Mode</span>
        <motion.button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-300'
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <motion.div
            className="absolute w-5 h-5 bg-white rounded-full shadow-md top-0.5"
            animate={{ 
              left: isDarkMode ? '26px' : '2px',
              backgroundColor: isDarkMode ? '#374151' : '#ffffff'
            }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </motion.button>
      </div>
    </div>
  );
};

// Animation speed selector
export const AnimationSpeedSelector = () => {
  const { animationSpeed, setAnimationSpeed } = useTheme();
  
  const speeds = [
    { key: 'quick', label: 'Quick' },
    { key: 'smooth', label: 'Smooth' },
    { key: 'gentle', label: 'Gentle' },
    { key: 'bouncy', label: 'Bouncy' }
  ];
  
  return (
    <div className="flex gap-2 p-4 bg-white rounded-lg shadow-md">
      {speeds.map((speed) => (
        <motion.button
          key={speed.key}
          onClick={() => setAnimationSpeed(speed.key)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
            animationSpeed === speed.key
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {speed.label}
        </motion.button>
      ))}
    </div>
  );
};