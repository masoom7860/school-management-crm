import React from 'react';

// Simple responsive content wrapper used by dashboard pages.
// Provides consistent paddings, max-width and a rounded/light card background.
const ResponsiveContainer = ({ children, className = '' }) => {
  return (
    // Keep the previous background/card styling: full-width inner card with subtle blur and border
    <div className={`w-full p-0 ${className}`}>
      <div className="w-full bg-white/80 backdrop-blur-sm rounded-none shadow-lg shadow-red-100/50 ring-0 border border-red-100">
        <div className="p-4 sm:p-6 md:p-8">{children}</div>
      </div>
    </div>
  );
};

export default ResponsiveContainer;
