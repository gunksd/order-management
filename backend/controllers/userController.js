const sql = require('mssql');
const jwt = require('jsonwebtoken');
const { getUserByUsername } = require('../models/sqlQueries');

// 登录用户
async function loginUser(req, res) {
    const { username, password } = req.body;

    try {
        const pool = await sql.connect();
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query(getUserByUsername);

        // 检查用户是否存在
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }

        const user = result.recordset[0];

        // 明文密码比较
        if (password !== user.password) {
            return res.status(401).json({ message: '密码错误' });
        }

        // 创建 JWT token
        const token = jwt.sign(
            { userId: user.user_id, role: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // 返回 token, role, 和 userId
        res.json({ token, role: user.user_type, userId: user.user_id });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: '服务器错误' });
    }
}

module.exports = { loginUser };
