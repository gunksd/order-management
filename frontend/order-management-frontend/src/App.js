import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CustomerPage from './components/CustomerPage';
import AdminPage from './components/AdminPage';
import Register from './components/Register';
import PaymentPage from './components/PaymentPage'; // 确保引入 PaymentPage 组件

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
        {/* 添加支付页面的路由 */}
        <Route
          path="/payment/:orderId"
          element={<PaymentPage />}
        />
      </Routes>
    </Router>
  );
}

export default App;
