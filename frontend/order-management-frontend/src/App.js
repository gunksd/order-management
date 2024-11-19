import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CustomerPage from './components/CustomerPage';
import AdminPage from './components/AdminPage';
import Register from './components/Register';

function App() {
  const [role, setRole] = useState(null);

  const handleLogin = (userRole) => {
    setRole(userRole);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        {/* 根据用户角色跳转到不同页面 */}
        <Route
          path="/customer"
          element={role === '顾客' ? <CustomerPage /> : <Navigate to="/" />}
        />
        <Route
          path="/admin"
          element={role === '管理员' ? <AdminPage /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
