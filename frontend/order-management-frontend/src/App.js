import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './components/Login';
import CustomerPage from './components/CustomerPage';
import AdminPage from './components/AdminPage';
import Register from './components/Register';
import PaymentPage from './components/PaymentPage';
import { getToken, setToken, removeToken, isAuthenticated as checkAuth } from './utils/auth';

function App() {
  const [role, setRole] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = () => {
      const token = getToken();
      const savedRole = localStorage.getItem('role');
      
      if (token && savedRole && checkAuth()) {
        try {
          const decodedToken = jwtDecode(token);
          if (decodedToken.exp * 1000 > Date.now()) {
            setRole(savedRole);
            setIsAuthenticated(true);
          } else {
            // Token 过期
            handleLogout();
          }
        } catch (error) {
          console.error('无效的 token:', error);
          handleLogout();
        }
      } else {
        // 没有找到有效的 token 或角色
        handleLogout();
      }
    };

    checkAuthentication();
  }, []);

  const handleLogin = (userRole, token) => {
    setRole(userRole);
    setIsAuthenticated(true);
    setToken(token);
    localStorage.setItem('role', userRole);
  };

  const handleLogout = () => {
    setRole(null);
    setIsAuthenticated(false);
    removeToken();
    localStorage.removeItem('role');
  };

  const ProtectedRoute = ({ children, allowedRole }) => {
    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    if (allowedRole && role !== allowedRole) {
      return <Navigate to="/" replace />;
    }
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/customer"
          element={
            <ProtectedRoute allowedRole="顾客">
              <CustomerPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="管理员">
              <AdminPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payment/:orderId"
          element={
            <ProtectedRoute>
              <PaymentPage onLogout={handleLogout} />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

