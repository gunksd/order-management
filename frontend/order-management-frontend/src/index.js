import React from 'react';
import ReactDOM from 'react-dom/client'; // 引入 createRoot
import './index.css'; // 全局样式
import App from './App';

// 获取根元素
const rootElement = document.getElementById('root');

// 使用 createRoot API 渲染应用
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

