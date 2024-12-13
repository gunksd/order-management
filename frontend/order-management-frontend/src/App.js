import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import CustomerPage from './components/CustomerPage';
import AdminPage from './components/AdminPage';
import Register from './components/Register';
import PaymentPage from './components/PaymentPage'; // 确保引入 PaymentPage 组件

function App() {
  const [role, setRole] = useState(null); // 初始状态为空

  // 在组件加载时从 localStorage 获取角色信息
  useEffect(() => {
    const savedRole = localStorage.getItem('role'); // 从 localStorage 中获取角色
    if (savedRole) {
      setRole(savedRole); // 如果角色信息存在，设置 role
    }
  }, []); // 空依赖数组，确保只在组件加载时执行一次

  // 登录后更新角色并存储到 localStorage
  const handleLogin = (userRole) => {
    setRole(userRole); // 更新角色状态
    localStorage.setItem('role', userRole); // 将角色保存到 localStorage
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
