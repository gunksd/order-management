// 引入必要的模块
const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const { loginUser } = require('./controllers/userController');
const { getDishes, addDish } = require('./controllers/dishController');
const { placeOrder, getUserOrders } = require('./controllers/orderController');
const { authMiddleware } = require('./middlewares/authMiddleware');

// 创建 Express 应用实例
const app = express();
app.use(express.json());
app.use(cors());

// 数据库配置（通过环境变量读取）
const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

// 连接数据库
sql.connect(config)
  .then(() => console.log('Connected to SQL Server'))
  .catch(err => console.error('Database connection failed:', err));

// 路由设置

// 用户登录 API
app.post('/api/login', loginUser);

// 获取所有菜品 API
app.get('/api/dishes', getDishes);

// 添加新菜品（仅限管理员）
app.post('/api/dishes', authMiddleware(['管理员']), addDish);

// 提交订单 API（仅限顾客）
app.post('/api/orders', authMiddleware(['顾客']), placeOrder);

// 获取用户的订单 API（仅限顾客）
app.get('/api/orders', authMiddleware(['顾客']), getUserOrders);

// 监听端口
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
