import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedSuperAdminRoute = ({ children }) => {
  const token = localStorage.getItem('superadmin_token');
  if (!token) {
    return <Navigate to="/superadmin-login" replace />;
  }
  return children;
};

export default ProtectedSuperAdminRoute; 