// 引入必要的模块
const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const { loginUser } = require('./controllers/userController');
const { getDishes, addDish, deleteDish, updateDish  } = require('./controllers/dishController'); // 确保导入所有需要的函数
const { placeOrder, getUserOrders, deleteOrder } = require('./controllers/orderController');
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

// 根路径响应（测试服务器状态）
app.get('/', (req, res) => {
  res.send('后端服务器正在正常运行...');
});

// 路由设置

// 用户登录 API
app.post('/api/login', loginUser);

// 获取所有菜品 API
app.get('/api/dishes', getDishes);

// 添加新菜品（仅限管理员）
app.post('/api/dishes', authMiddleware(['管理员']), addDish);

// 删除菜品（仅限管理员）
app.delete('/api/dishes/:dishId', authMiddleware(['管理员']), deleteDish);

// 更新菜品（仅限管理员）
app.put('/api/dishes/:dishId', authMiddleware(['管理员']), updateDish);

// 获取用户的订单 API（仅限顾客）
app.get('/api/orders', authMiddleware(['顾客']), (req, res, next) => {
  console.log('GET /api/orders route hit');
  next();
}, getUserOrders);

// 删除订单 API（仅限顾客）
app.delete('/api/orders/:orderId', authMiddleware(['顾客', '管理员']), deleteOrder);


// 提交订单 API（仅限顾客）
app.post('/api/orders', authMiddleware(['顾客']), placeOrder);

// 未匹配路由的错误处理
app.use((req, res, next) => {
  res.status(404).json({ message: '请求的资源不存在' });
});

// 全局错误处理中间件
app.use((err, req, res, next) => {
  console.error('服务器内部错误:', err);
  res.status(500).json({ message: '服务器内部错误，请稍后再试' });
});

// 监听端口
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
