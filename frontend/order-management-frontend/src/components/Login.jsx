import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import StarryBackground from '../StarryBackground.tsx';

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
      localStorage.setItem('role', role);
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
      <StarryBackground />
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={styles.card}
      >
        <h2 style={styles.header}>智能点菜系统</h2>
        <div style={styles.inputContainer}>
          <FaUser style={styles.icon} />
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            onKeyDown={handleKeyDown}
          />
        </div>
        <div style={styles.inputContainer}>
          <FaLock style={styles.icon} />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            onKeyDown={handleKeyDown}
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogin}
          style={styles.button}
        >
          登录
        </motion.button>
        {error && <div style={styles.error}>{error}</div>}
        <div style={styles.registerLink}>
          <span>还没有账号？</span>
          <Link to="/register" style={styles.registerButton}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={styles.registerStyledButton}
            >
              注册
            </motion.button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    fontFamily: "'Roboto', sans-serif",
    position: 'relative',
    overflow: 'hidden',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
    maxWidth: '350px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    marginBottom: '20px',
    color: '#fff',
    fontSize: '24px',
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: '15px',
  },
  icon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#fff',
    fontSize: '16px',
  },
  input: {
    padding: '12px 12px 12px 40px',
    width: '100%',
    borderRadius: '25px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    fontSize: '14px',
    fontFamily: "'Roboto', sans-serif",
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    transition: 'all 0.3s ease',
  },
  showPasswordButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '16px',
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    border: 'none',
    padding: '12px 25px',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '16px',
    fontWeight: '500',
    outline: 'none',
    marginTop: '15px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  error: {
    color: '#ff6b6b',
    marginTop: '10px',
    fontSize: '12px',
  },
  registerLink: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '14px',
  },
  registerButton: {
    marginLeft: '10px',
    textDecoration: 'none',
  },
  registerStyledButton: {
    backgroundColor: 'transparent',
    color: '#4CAF50',
    border: '2px solid #4CAF50',
    padding: '8px 15px',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '12px',
    fontWeight: '500',
    outline: 'none',
  },
};

export default Login;

