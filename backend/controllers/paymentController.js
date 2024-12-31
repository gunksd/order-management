const sql = require('mssql');
const moment = require('moment');

// 生成支付宝个人收款码支付链接的接口
async function generatePaymentLink(req, res) {
    const { orderId } = req.body;

    if (!orderId) {
        return res.status(400).json({ message: '订单 ID 无效' });
    }

    try {
        // 连接到数据库以获取订单金额
        const pool = await sql.connect();

        const orderResult = await pool.request()
            .input('order_id', sql.Int, orderId)
            .query('SELECT total_amount FROM [order] WHERE order_id = @order_id');

        if (orderResult.recordset.length === 0) {
            return res.status(404).json({ message: '未找到该订单' });
        }

        const amount = orderResult.recordset[0].total_amount;

        // 使用固定的支付宝个人收款码链接
        const payUrl = 'https://raw.githubusercontent.com/gunksd/img/refs/heads/main/pay.jpg';
        const instruction = "请使用支付宝扫描以下二维码进行支付，完成后再返回页面确认支付。";

        // 返回支付链接、支付金额和支付说明
        res.status(200).json({ payUrl, amount, instruction });
    } catch (error) {
        console.error('Error generating payment link:', error);
        res.status(500).json({ message: '服务器错误，无法生成支付链接' });
    }
}

// 生成批量支付的支付宝个人收款码支付链接的接口
async function generateBatchPaymentLink(req, res) {
    const { orderIds } = req.body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return res.status(400).json({ message: '订单 ID 列表无效' });
    }

    try {
        // 连接到数据库以获取订单总金额
        const pool = await sql.connect();

        const orderIdsString = orderIds.join(',');
        const orderResult = await pool.request()
            .input('order_ids', sql.VarChar(8000), orderIdsString)
            .query(`
                SELECT SUM(total_amount) AS total_amount 
                FROM [order] 
                WHERE order_id IN (SELECT value FROM STRING_SPLIT(@order_ids, ','))
            `);

        if (orderResult.recordset.length === 0 || orderResult.recordset[0].total_amount === null) {
            return res.status(404).json({ message: '未找到有效订单' });
        }

        const amount = orderResult.recordset[0].total_amount;

        // 使用固定的支付宝个人收款码链接
        const payUrl = 'https://raw.githubusercontent.com/gunksd/img/refs/heads/main/pay.jpg';
        const instruction = "请使用支付宝扫描以下二维码进行批量支付，完成后再返回页面确认支付。";

        // 返回支付链接、支付总金额和支付说明
        res.status(200).json({ payUrl, amount, instruction });
    } catch (error) {
        console.error('Error generating batch payment link:', error);
        res.status(500).json({ message: '服务器错误，无法生成批量支付链接' });
    }
}

// 支付成功回调（模拟）
async function handlePaymentSuccess(req, res) {
    const { orderId, isBatchPayment } = req.body;

    if ((!orderId && !isBatchPayment) || (isBatchPayment && (!Array.isArray(orderId) || orderId.length === 0))) {
        return res.status(400).json({ message: '订单 ID 无效' });
    }

    try {
        // 连接到数据库
        const pool = await sql.connect();

        if (isBatchPayment) {
            // 批量更新订单状态和支付时间
            const orderIdsString = orderId.join(',');
            await pool.request()
                .input('order_ids', sql.VarChar(8000), orderIdsString)
                .input('status', sql.NVarChar, 'paid')
                .input('paid_at', sql.DateTime, moment().format('YYYY-MM-DD HH:mm:ss'))
                .query(`
                    UPDATE [order]
                    SET status = @status, paid_at = @paid_at
                    WHERE order_id IN (SELECT value FROM STRING_SPLIT(@order_ids, ','))
                `);
            
            res.status(200).json({ message: '批量订单状态已更新为已支付' });
        } else {
            // 单个订单更新状态和支付时间
            await pool.request()
                .input('order_id', sql.Int, orderId)
                .input('status', sql.NVarChar, 'paid')
                .input('paid_at', sql.DateTime, moment().format('YYYY-MM-DD HH:mm:ss'))
                .query(`
                    UPDATE [order]
                    SET status = @status, paid_at = @paid_at
                    WHERE order_id = @order_id
                `);
            
            res.status(200).json({ message: '订单状态已更新为已支付' });
        }
    } catch (error) {
        console.error('Error handling payment success:', error);
        res.status(500).json({ message: '服务器错误' });
    }
}

module.exports = {
    generatePaymentLink,
    generateBatchPaymentLink,
    handlePaymentSuccess,
};

