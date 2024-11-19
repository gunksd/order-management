const sql = require('mssql');
const { insertOrder, insertOrderDetails, getOrdersByUserId } = require('../models/sqlQueries');

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

// 获取用户的所有订单
async function getUserOrders(req, res) {
    const { userId } = req.user;

    try {
        // 检查 userId 是否有效
        if (!userId) {
            return res.status(400).json({ message: '用户 ID 无效' });
        }

        const pool = await sql.connect();
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query(getOrdersByUserId);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: '未找到订单' });
        }

        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: '服务器错误', error: error.message });
    }
}

module.exports = { placeOrder, getUserOrders };
