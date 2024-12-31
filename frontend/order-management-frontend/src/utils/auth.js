// 用于管理身份验证的工具函数

// 保存token到localStorage
export const setToken = (token) => {
    localStorage.setItem('token', token);
  };
  
  // 从localStorage获取token
  export const getToken = () => {
    return localStorage.getItem('token');
  };
  
  // 从localStorage移除token
  export const removeToken = () => {
    localStorage.removeItem('token');
  };
  
  // 检查是否已认证
  export const isAuthenticated = () => {
    const token = getToken();
    return !!token; // 如果token存在则返回true，否则返回false
  };
  
  // 解码JWT token（如果需要的话）
  export const decodeToken = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };
  
  