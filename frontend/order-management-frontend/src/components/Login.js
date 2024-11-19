import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; // 引入眼睛图标

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 添加状态来控制密码显示
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // 使用 useNavigate 来进行导航

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        username,
        password,
      });

      const { token, role, userId } = response.data;

      // 存储 token 和 userId 到本地存储，用于后续 API 调用
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);

      // 触发父组件的回调，传递用户角色
      onLogin(role);

      // 根据角色导航到不同的页面，例如：
      if (role === '顾客') {
        navigate('/customer'); // 导航到顾客页面
      } else if (role === '管理员') {
        navigate('/admin'); // 导航到管理员页面
      }
    } catch (error) {
      setError('登录失败，请检查用户名或密码');
      console.error('Login error:', error);
    }
  };

  // 处理按键事件
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
          onKeyDown={handleKeyDown} // 绑定按键事件
        />
        <div style={styles.passwordContainer}>
          <input
            type={showPassword ? 'text' : 'password'} // 根据 showPassword 的值切换输入框类型
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.passwordInput}
            onKeyDown={handleKeyDown} // 绑定按键事件
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
            注册
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
    position: 'relative',
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
  passwordContainer: {
    position: 'relative',
    marginBottom: '10px',
    width: '100%',
  },
  passwordInput: {
    padding: '10px',
    width: '100%',
    borderRadius: '5px',
    border: '1px solid #ccc',
    paddingRight: '40px', // 留出空间给眼睛图标按钮
  },
  showPasswordButton: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#007bff',
    fontSize: '20px',
    userSelect: 'none', // 禁止选择文本，防止意外行为
    display: 'flex',
    alignItems: 'center',
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
  registerLink: {
    marginTop: '20px',
  },
  registerButton: {
    marginLeft: '10px',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#007bff',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};

export default Login;
