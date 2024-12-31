import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import StarryBackground from '../StarryBackground.tsx';
import { setToken } from '../utils/auth';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      document.querySelector('input[type="text"]').parentNode.classList.add('focused');
    }
    if (password) {
      document.querySelector('input[type="password"]').parentNode.classList.add('focused');
    }
  }, []);

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });

      const { token, role, userId } = response.data;

      if (typeof token !== 'string' || !token.includes('.')) {
        throw new Error('从服务器接收到的token格式无效');
      }

      setToken(token);
      
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);
      localStorage.setItem('role', role);
      
      onLogin(role, token);

      if (role === '顾客') {
        navigate('/customer');
      } else if (role === '管理员') {
        navigate('/admin');
      }
    } catch (error) {
      setError('登录失败，请检查用户名或密码');
      console.error('登录错误:', error);
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
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{...styles.input, ...(username ? styles.inputFocus : {})}}
            onFocus={(e) => e.target.parentNode.classList.add('focused')}
            onBlur={(e) => !e.target.value && e.target.parentNode.classList.remove('focused')}
            onKeyDown={handleKeyDown}
          />
          <label style={{...styles.inputLabel, ...(username ? styles.inputLabelActive : {})}}>用户名</label>
        </div>
        <div style={styles.inputContainer}>
          <FaLock style={styles.icon} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              ...styles.input,
              ...(password ? styles.inputFocus : {}),
              letterSpacing: showPassword ? 'normal' : '0.1em',
            }}
            onFocus={(e) => e.target.parentNode.classList.add('focused')}
            onBlur={(e) => !e.target.value && e.target.parentNode.classList.remove('focused')}
            onKeyDown={handleKeyDown}
          />
          <label style={{...styles.inputLabel, ...(password ? styles.inputLabelActive : {})}}>密码</label>
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
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={styles.error}
          >
            {error}
          </motion.div>
        )}
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
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
    maxWidth: '400px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    marginBottom: '25px',
    color: '#fff',
    fontSize: '24px',
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: '20px',
    transition: 'all 0.3s ease',
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
    letterSpacing: '0.05em',
    outline: 'none',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
  },
  inputFocus: {
    border: '1px solid rgba(255, 255, 255, 0.5)',
    boxShadow: '0 0 5px rgba(255, 255, 255, 0.2)',
  },
  inputLabel: {
    position: 'absolute',
    left: '40px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: '14px',
    pointerEvents: 'none',
    transition: 'all 0.3s ease',
  },
  inputLabelActive: {
    top: '-10px',
    left: '20px',
    fontSize: '12px',
    color: '#4CAF50',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: '0 5px',
    borderRadius: '10px',
  },
  showPasswordButton: {
    position: 'absolute',
    right: '15px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#fff',
    fontSize: '18px',
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
    marginTop: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  error: {
    color: '#ff6b6b',
    marginTop: '15px',
    fontSize: '14px',
    padding: '10px',
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: '5px',
    border: '1px solid #ff6b6b',
  },
  registerLink: {
    marginTop: '25px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
  },
  registerButton: {
    marginLeft: '10px',
    textDecoration: 'none',
  },
  registerStyledButton: {
    backgroundColor: 'transparent',
    color: '#4CAF50',
    border: '2px solid #4CAF50',
    padding: '10px 20px',
    borderRadius: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '14px',
    fontWeight: '500',
    outline: 'none',
  },
};

export default Login;

