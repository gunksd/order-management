import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaLock } from 'react-icons/fa';
import { motion } from 'framer-motion';
import StarryBackground from '../StarryBackground.tsx';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/register', {
        username,
        password,
      });

      if (response.status === 201) {
        setSuccess('注册成功，请登录');
        setError(null);
        setTimeout(() => navigate('/'), 2000);
      }
    } catch (error) {
      setError('注册失败，请重试');
      console.error('Register error:', error);
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
        <h2 style={styles.header}>注册</h2>
        <div style={styles.inputContainer}>
          <FaUser style={styles.icon} />
          <input
            type="text"
            placeholder="用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
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
          />
          <div
            onClick={() => setShowPassword(!showPassword)}
            style={styles.showPasswordButton}
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <div style={styles.inputContainer}>
          <FaLock style={styles.icon} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="确认密码"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />
          <div
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.showPasswordButton}
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRegister}
          style={styles.button}
        >
          注册
        </motion.button>
        {error && <div style={styles.error}>{error}</div>}
        {success && <div style={styles.success}>{success}</div>}
        <div style={styles.loginLink}>
          <span>已有账号？</span>
          <Link to="/" style={styles.loginButton}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={styles.loginStyledButton}
            >
              登录
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
    backgroundColor: 'rgba(25, 118, 210, 0.1)', // 更改为蓝色调
    backdropFilter: 'blur(10px)',
    padding: '30px',
    borderRadius: '15px',
    boxShadow: '0 8px 32px rgba(31, 38, 135, 0.37)',
    maxWidth: '350px', // 减小最大宽度
    width: '100%',
    textAlign: 'center',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    marginBottom: '20px',
    color: '#fff',
    fontSize: '24px', // 减小字体大小
    fontWeight: '600',
  },
  inputContainer: {
    position: 'relative',
    marginBottom: '15px', // 减小间距
  },
  icon: {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#fff',
    fontSize: '16px', // 减小图标大小
  },
  input: {
    padding: '12px 12px 12px 40px', // 调整内边距
    width: '100%',
    borderRadius: '25px',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    fontSize: '14px', // 减小字体大小
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
    fontSize: '16px', // 减小图标大小
    userSelect: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#1976D2', // 更改为蓝色
    color: '#fff',
    border: 'none',
    padding: '12px 25px', // 调整内边距
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '16px', // 减小字体大小
    fontWeight: '500',
    outline: 'none',
    marginTop: '15px', // 减小上边距
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  error: {
    color: '#ff6b6b',
    marginTop: '10px',
    fontSize: '12px', // 减小字体大小
  },
  success: {
    color: '#4ecdc4',
    marginTop: '10px',
    fontSize: '12px', // 减小字体大小
  },
  loginLink: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#fff',
    fontSize: '14px', // 减小字体大小
  },
  loginButton: {
    marginLeft: '8px',
    textDecoration: 'none',
  },
  loginStyledButton: {
    backgroundColor: 'transparent',
    color: '#1976D2', // 更改为蓝色
    border: '2px solid #1976D2', // 更改为蓝色
    padding: '8px 15px', // 调整内边距
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    fontSize: '12px', // 减小字体大小
    fontWeight: '500',
    outline: 'none',
  },
};

export default Register;

