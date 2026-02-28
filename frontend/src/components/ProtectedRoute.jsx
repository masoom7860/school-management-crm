// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ element: Component, allowedRole }) => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token) {
    // No token found, redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && role !== allowedRole) {
    // Token exists but role doesn't match, redirect to home or unauthorized page
    return <Navigate to="/" replace />;
  }

  // For superadmin, you might want to add additional checks
  if (allowedRole === 'superadmin' && role === 'superadmin') {
    // Add any superadmin-specific checks here if needed
    return <Component />;
  }

  // For all other authorized cases
  return <Component />;
};

export default ProtectedRoute;