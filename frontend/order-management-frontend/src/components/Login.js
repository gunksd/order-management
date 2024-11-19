import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });

      const { token, role, userId } = response.data; // 从响应中获取 token, role 和 userId

      // 存储 token 和 userId 到本地存储，用于后续 API 调用
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);

      // 触发父组件的回调，传递用户角色
      onLogin(role);
    } catch (error) {
      setError('登录失败，请检查用户名或密码');
      console.error('Login error:', error);
    }
  };

  // 处理按键事件
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>登录</h2>
        <input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          onKeyPress={handleKeyPress} // 绑定按键事件
        />
        <input
          type="password"
          placeholder="密码"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          onKeyPress={handleKeyPress} // 绑定按键事件
        />
        <button onClick={handleLogin} style={styles.button}>登录</button>
        {error && <div style={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

// 样式对象
const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f2f5',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
  },
  header: {
    marginBottom: '20px',
    color: '#333',
  },
  input: {
    marginBottom: '10px',
    padding: '10px',
    width: '100%',
    borderRadius: '5px',
    border: '1px solid #ccc',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    outline: 'none',
    marginTop: '10px',
  },
  error: {
    color: 'red',
    marginTop: '10px',
  },
};

// 添加按钮动画效果
document.addEventListener('mouseover', (event) => {
  if (event.target.tagName === 'BUTTON') {
    event.target.style.transform = 'scale(1.05)';
  }
});

document.addEventListener('mouseout', (event) => {
  if (event.target.tagName === 'BUTTON') {
    event.target.style.transform = 'scale(1)';
  }
});

export default Login;
