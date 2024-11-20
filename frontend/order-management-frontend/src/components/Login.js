import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });

      const { token, role, userId } = response.data;

      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);
      onLogin(role);

      if (role === '顾客') {
        navigate('/customer');
      } else if (role === '管理员') {
        navigate('/admin');
      }
    } catch (error) {
      setError('登录失败，请检查用户名或密码');
      console.error('Login error:', error);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.header}>智能点菜系统登录</h2>
        <input
          type="text"
          placeholder="用户名"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          onKeyDown={handleKeyDown}
        />
        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.passwordInput}
            onKeyDown={handleKeyDown}
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <button onClick={handleLogin} style={styles.button}>
          登录
        </button>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.registerLink}>
          <span>还没有账号？</span>
          <Link to="/register" style={styles.registerButton}>
            <button style={styles.registerStyledButton}>注册</button>
          </Link>
        </div>
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
    backgroundColor: '#f7f9fc',
    padding: '20px',
    fontFamily: "'Roboto', sans-serif",
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '15px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
  },
  header: {
    marginBottom: '30px',
    color: '#333',
    fontSize: '24px',
    fontWeight: '600',
  },
  input: {
    marginBottom: '15px',
    padding: '12px',
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    fontFamily: "'Roboto', sans-serif",
  },
  passwordContainer: {
    position: 'relative',
    marginBottom: '15px',
    width: '100%',
  },
  passwordInput: {
    padding: '12px',
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '16px',
    paddingRight: '50px',
    fontFamily: "'Roboto', sans-serif",
  },
  showPasswordButton: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#007bff',
    fontSize: '20px',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    fontWeight: '500',
    outline: 'none',
    marginTop: '20px',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  error: {
    color: 'red',
    marginTop: '15px',
    fontSize: '14px',
  },
  registerLink: {
    marginTop: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButton: {
    marginLeft: '10px',
    textDecoration: 'none',
  },
  registerStyledButton: {
    backgroundColor: '#28a745',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
  },
};

export default Login;
