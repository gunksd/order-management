const sql = require('mssql');
const bcrypt = require('bcrypt');
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

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: '用户不存在' });
        }

        const user = result.recordset[0];
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: '密码错误' });
        }

        const token = jwt.sign(
            { userId: user.user_id, role: user.user_type },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, role: user.user_type });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: '服务器错误' });
    }
}

module.exports = { loginUser };
