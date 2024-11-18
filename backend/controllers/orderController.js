const sql = require('mssql');
const { insertOrder, insertOrderDetails, getOrdersByUserId } = require('../models/sqlQueries');

// 提交订单
async function placeOrder(req, res) {
    const { user_id, order_items, total_amount } = req.body;

    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('user_id', sql.Int, user_id)
            .input('total_amount', sql.Decimal(10, 2), total_amount)
            .query(insertOrder);
        
        const orderId = result.recordset[0].order_id;

        // 插入每一个订单详情
        for (const item of order_items) {
            await pool.request()
                .input('order_id', sql.Int, orderId)
                .input('dish_id', sql.Int, item.dish_id)
                .input('quantity', sql.Int, item.quantity)
                .query(insertOrderDetails);
        }

        res.status(201).json({ message: '订单已提交', orderId });
    } catch (error) {
        console.error('Error placing order:', error);
        res.status(500).json({ message: '服务器错误' });
    }
}

// 获取用户的所有订单
async function getUserOrders(req, res) {
    const { userId } = req.user;

    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('user_id', sql.Int, userId)
            .query(getOrdersByUserId);
        res.json(result.recordset);
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ message: '服务器错误' });
    }
}

module.exports = { placeOrder, getUserOrders };
