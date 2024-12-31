import React from 'react';
import { Navigate } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  if (!isAuthenticated()) {
    // 如果未认证，重定向到登录页面
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;

