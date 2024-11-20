const sql = require('mssql');
const { insertOrder, insertOrderDetails, getOrdersByUserId, deleteOrderById, getOrderById, deleteOrderQuery, deleteOrderDetailsQuery, updateOrderPaymentStatusQuery } = require('../models/sqlQueries');

// 提交订单
async function placeOrder(req, res) {
    const { user_id, order_items, total_amount } = req.body;

    try {
        // 检查请求数据的有效性
        if (!user_id || !Array.isArray(order_items) || order_items.length === 0 || !total_amount) {
            return res.status(400).json({ message: '订单数据无效' });
        }

        // 连接到数据库
        const pool = await sql.connect();
        
        // 开始一个事务，以确保订单插入和订单详情插入的一致性
        const transaction = new sql.Transaction(pool);

        try {
            await transaction.begin();

            // 插入订单到 order 表
            const orderRequest = new sql.Request(transaction);
            const orderResult = await orderRequest
                .input('user_id', sql.Int, user_id)
                .input('total_amount', sql.Decimal(10, 2), total_amount)
                .input('status', sql.NVarChar, 'pending') // 初始状态为 'pending'
                .query(insertOrder);

            if (!orderResult.recordset || orderResult.recordset.length === 0) {
                throw new Error('无法获取新订单 ID');
            }

            const orderId = orderResult.recordset[0].order_id;

            // 插入每一个订单详情到 order_details 表
            for (const item of order_items) {
                const detailRequest = new sql.Request(transaction);
                await detailRequest
                    .input('order_id', sql.Int, orderId)
                    .input('dish_id', sql.Int, item.dish_id)
                    .input('quantity', sql.Int, item.quantity)
                    .query(insertOrderDetails);
            }

            // 提交事务
            await transaction.commit();

            // 返回成功响应
            res.status(201).json({ message: '订单已提交', orderId });
        } catch (error) {
            // 回滚事务，以防止部分插入导致数据不一致
            await transaction.rollback();
            console.error('Transaction error:', error);
            res.status(500).json({ message: '订单处理失败，已回滚事务' });
        }
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
}

// 获取历史订单
async function getUserOrders(req, res) {
    const { userId, role } = req.user; // 从解码的 Token 中获取用户 ID 和角色

    try {
        if (!userId) {
            return res.status(400).json({ message: '用户 ID 无效' });
        }

        // 连接到数据库
        const pool = await sql.connect();

        let result;

        if (role === '管理员') {
            // 如果是管理员，则获取所有订单
            result = await pool.request()
                .query('SELECT * FROM [order]');
        } else {
            // 如果是普通用户，则只获取该用户的订单
            result = await pool.request()
                .input('user_id', sql.Int, userId)
                .query(getOrdersByUserId);
        }

        console.log('Database query result:', result.recordset);

        // 检查查询结果是否为空
        if (result.recordset.length === 0) {
            return res.status(200).json([]); // 返回空数组，而不是 404 错误
        }

        // 返回查询结果
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
}

// 获取特定订单的详细信息
async function getOrderDetails(req, res) {
    const { orderId } = req.params;

    try {
        if (!orderId) {
            return res.status(400).json({ message: '订单 ID 无效' });
        }

        const pool = await sql.connect();
        const result = await pool.request()
            .input('order_id', sql.Int, orderId)
            .query(getOrderById);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: '未找到该订单' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Error fetching order:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
}

// 删除订单
async function deleteOrder(req, res) {
    const { orderId } = req.params;

    try {
        // 连接到数据库
        const pool = await sql.connect();

        // 开始一个事务，以确保删除操作的完整性
        const transaction = new sql.Transaction(pool);
        await transaction.begin();

        // 删除订单详情
        const deleteOrderDetailsRequest = new sql.Request(transaction);
        await deleteOrderDetailsRequest
            .input('order_id', sql.Int, orderId)
            .query(deleteOrderDetailsQuery);

        // 删除订单
        const deleteOrderRequest = new sql.Request(transaction);
        const result = await deleteOrderRequest
            .input('order_id', sql.Int, orderId)
            .query(deleteOrderQuery);

        if (result.rowsAffected[0] === 0) {
            await transaction.rollback(); // 回滚事务
            return res.status(404).json({ message: '订单未找到' });
        }

        // 提交事务
        await transaction.commit();
        res.status(200).json({ message: '订单已删除' });
    } catch (error) {
        console.error('Error deleting order:', error);

        // 如果事务失败，回滚事务
        if (transaction) {
            try {
                await transaction.rollback();
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
        }

        res.status(500).json({ message: '服务器错误' });
    }
}

// 更新订单支付状态
async function updateOrderPaymentStatus(req, res) {
    const { orderId } = req.body; // 支付回调中提供的 orderId

    try {
        if (!orderId) {
            return res.status(400).json({ message: '订单 ID 无效' });
        }

        const pool = await sql.connect();
        const updateOrderRequest = new sql.Request(pool);
        updateOrderRequest.input('order_id', sql.Int, orderId);
        updateOrderRequest.input('status', sql.NVarChar, 'paid');
        updateOrderRequest.input('paid_at', sql.DateTime, new Date()); // 设置支付时间

        const result = await updateOrderRequest.query(updateOrderPaymentStatusQuery);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: '未找到该订单' });
        }

        res.status(200).json({ message: '订单支付状态已更新' });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
}

module.exports = { placeOrder, getUserOrders, getOrderDetails, deleteOrder, updateOrderPaymentStatus };
