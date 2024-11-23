// 引入必要的模块
const express = require('express');
const sql = require('mssql');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const { loginUser, registerUser } = require('./controllers/userController');
const { getDishes, addDish, deleteDish, updateDish, updateDishSales } = require('./controllers/dishController');
const { placeOrder, getUserOrders, deleteOrder, getOrderSummary } = require('./controllers/orderController');
const { generatePaymentLink, handlePaymentSuccess } = require('./controllers/paymentController');
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

// 用户注册 API
app.post('/api/register', registerUser);

// 获取所有菜品 API
app.get('/api/dishes', getDishes);

// 添加新菜品（仅限管理员）
app.post('/api/dishes', authMiddleware(['管理员']), addDish);

// 删除菜品（仅限管理员）
app.delete('/api/dishes/:dishId', authMiddleware(['管理员']), deleteDish);

// 更新菜品（仅限管理员）
app.put('/api/dishes/:dishId', authMiddleware(['管理员']), updateDish);

// 获取用户的订单 API
app.get('/api/orders', authMiddleware(['顾客', '管理员']), getUserOrders);

// 删除订单 API
app.delete('/api/orders/:orderId', authMiddleware(['顾客', '管理员']), deleteOrder);

// 提交订单 API（仅限顾客）
app.post('/api/orders', authMiddleware(['顾客']), placeOrder);

// 生成支付链接 API（仅限顾客）
app.post('/api/payment/generate', authMiddleware(['顾客']), generatePaymentLink);

// 支付成功确认 API（仅限管理员）
app.post('/api/payment/confirm', authMiddleware(['管理员']), handlePaymentSuccess);

// 更新菜品销量 API
app.put('/api/dishes/:dishId/sales', authMiddleware(['顾客']), updateDishSales);

// 更新订单支付状态 API（仅限管理员）
app.put('/api/orders/confirm-payment', authMiddleware(['管理员']), async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ message: '订单 ID 无效' });
  }

  try {
    const pool = await sql.connect();
    const request = new sql.Request(pool);

    request.input('order_id', sql.Int, orderId);
    request.input('status', sql.NVarChar, 'paid');
    request.input('paid_at', sql.DateTime, new Date());

    const result = await request.query(`
      UPDATE [order]
      SET status = @status, paid_at = @paid_at
      WHERE order_id = @order_id;
    `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: '订单未找到' });
    }

    res.status(200).json({ message: '订单支付状态已更新' });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 获取订单统计信息 API（管理员可以查看所有用户的信息，顾客只能查看自己的）
app.get('/api/orders/summary', authMiddleware(['顾客', '管理员']), async (req, res) => {
  const { userId, role } = req.user; // 从解码后的 Token 中提取用户 ID 和角色

  try {
    const pool = await sql.connect();
    let result;

    if (role === '管理员') {
      // 如果是管理员，返回所有用户的订单统计信息
      result = await pool.request().query(`
        SELECT username, user_id, order_count, total_spent
        FROM OrderSummary
      `);
    } else if (role === '顾客') {
      // 如果是顾客，返回该顾客的订单统计信息
      result = await pool.request()
        .input('user_id', sql.Int, userId)
        .query(`
          SELECT username, user_id, order_count, total_spent
          FROM OrderSummary
          WHERE user_id = @user_id
        `);
    } else {
      return res.status(403).json({ message: '您无权查看订单统计信息' });
    }

    // 打印返回的记录，确保返回了 username 列
    console.log('Order Summary Query Result:', result.recordset);

    res.status(200).json(result.recordset);
  } catch (error) {
    console.error('Error fetching order summary:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});



// 确保订单统计视图已创建（管理员权限）
app.post('/api/views/create', authMiddleware(['管理员']), async (req, res) => {
  try {
    const pool = await sql.connect();
    const query = `
    IF NOT EXISTS (SELECT * FROM sys.views WHERE name = 'OrderSummary')
    BEGIN
        EXEC('
            CREATE VIEW OrderSummary AS
            SELECT u.username, o.user_id, COUNT(o.order_id) AS order_count, SUM(o.total_amount) AS total_spent
            FROM [order] o
            JOIN [user] u ON o.user_id = u.user_id
            GROUP BY u.username, o.user_id;
        ')
    END
    `;
    await pool.request().query(query);
    res.status(201).json({ message: '视图创建成功或已存在' });
  } catch (error) {
    console.error('Error while creating OrderSummary view:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});


// 更新订单统计视图 API
app.post('/api/orders/update-summary-view', authMiddleware(['顾客', '管理员']), async (req, res) => {
  try {
    const pool = await sql.connect();
    const query = `
      IF EXISTS (SELECT * FROM sys.views WHERE name = 'OrderSummary')
      BEGIN
          EXEC('
              ALTER VIEW OrderSummary AS
              SELECT username, user_id, COUNT(order_id) AS order_count, SUM(total_amount) AS total_spent
              FROM [order]
              GROUP BY user_id;
          ')
      END
    `;
    await pool.request().query(query);
    res.status(200).json({ message: '视图更新成功' });
  } catch (error) {
    console.error('Error while updating OrderSummary view:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 删除视图 API（仅限管理员）
app.delete('/api/views/delete', authMiddleware(['管理员']), async (req, res) => {
  try {
    const pool = await sql.connect();
    await pool.request().query('DROP VIEW IF EXISTS OrderSummary');
    res.status(200).json({ message: '视图删除成功' });
  } catch (error) {
    console.error('Error deleting view:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

// 管理索引 API（仅限管理员）
app.post('/api/indexes/create', authMiddleware(['管理员']), async (req, res) => {
  try {
    const pool = await sql.connect();
    await pool.request().query(`
      CREATE INDEX idx_user_id ON [order] (user_id);
    `);
    res.status(201).json({ message: '索引创建成功' });
  } catch (error) {
    console.error('Error creating index:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});


// 删除索引 API（仅限管理员）
app.delete('/api/indexes/delete', authMiddleware(['管理员']), async (req, res) => {
  try {
    const pool = await sql.connect();
    await pool.request().query('DROP INDEX idx_user_id ON [order]');
    res.status(200).json({ message: '索引删除成功' });
  } catch (error) {
    console.error('Error deleting index:', error);
    res.status(500).json({ message: '服务器错误', error: error.message });
  }
});

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
