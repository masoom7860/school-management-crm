// Common animation variants for Framer Motion

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

export const slideInUp = {
  hidden: { y: 50, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

export const slideInLeft = {
  hidden: { x: -50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

export const slideInRight = {
  hidden: { x: 50, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 0.6 }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const staggerItem = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export const cardHover = {
  rest: { 
    scale: 1,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  hover: { 
    scale: 1.02,
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.3 }
  }
};

export const buttonHover = {
  rest: { 
    scale: 1,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  },
  hover: { 
    scale: 1.05,
    boxShadow: '0 8px 15px rgba(0, 0, 0, 0.2)',
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const floatAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const pulseAnimation = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const bounceAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeOut"
    }
  }
};

export const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3
    }
  }
};

export const scaleOut = {
  hidden: { scale: 1, opacity: 1 },
  visible: {
    scale: 0.8,
    opacity: 0,
    transition: {
      duration: 0.3
    }
  }
};

// Additional variants needed for Navbar component
export const buttonVariants = {
  rest: { 
    scale: 1,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  },
  hover: { 
    scale: 1.05,
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
    transition: { duration: 0.2 }
  },
  tap: {
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.1
    },
    originY: 0
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.1
    },
    originY: 0
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.1
    },
    originY: 0
  }
};

export const notificationVariants = {
  hidden: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.1
    },
    originY: 0
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.1
    },
    originY: 0
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.95,
    transition: {
      duration: 0.1
    },
    originY: 0
  }
};

// Additional variants needed for Sidebar component
export const sidebarVariants = {
  expanded: {
    width: "16rem", // Adjust width as needed
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  collapsed: {
    width: "5rem", // Adjust width as needed
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  hover: {
    backgroundColor: "rgba(0, 0, 0, 0.1)"
  }
};

export const menuItemVariants = {
  hidden: { 
    opacity: 0, 
    x: -20 
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  },
  hover: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    scale: 1.02
  }
};

export const submenuVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    padding: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  },
  visible: {
    opacity: 1,
    height: "auto",
    padding: "0.5rem",
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  },
  exit: {
    opacity: 0,
    height: 0,
    padding: 0,
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};

// Additional variants needed for EnhancedDashboardCard component
export const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 30, 
    scale: 0.9 
  },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  },
  hover: {
    y: -5,
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  }
};

export const floatingVariants = {
  animate: {
    y: [0, -10, 0],
    opacity: [0.3, 0.5, 0.3],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Additional variants needed for AnimatedDashboardCharts component
export const chartVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// Additional variants needed for AnimatedModals component
export const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 20
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30
    }
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 20,
    transition: {
      duration: 0.2
    }
  }
};

export const overlayVariants = {
  hidden: {
    opacity: 0
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2
    }
  }
};