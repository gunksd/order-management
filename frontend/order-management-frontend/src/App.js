import React, { useState } from 'react';
import Login from './components/Login';
import CustomerPage from './components/CustomerPage';
import AdminPage from './components/AdminPage';

function App() {
  const [role, setRole] = useState(null);

  const handleLogin = (userRole) => {
    setRole(userRole);
  };

  return (
    <div>
      {!role && <Login onLogin={handleLogin} />}
      {role === '顾客' && <CustomerPage />}
      {role === '管理员' && <AdminPage />}
    </div>
  );
}

export default App;
