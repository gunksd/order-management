const jwt = require('jsonwebtoken');

// 验证用户身份和权限的中间件
function authMiddleware(roles = []) {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: '未授权访问，缺少 Token 或格式错误' });
        }

        try {
            // 验证 Token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 打印解码后的 Token 信息
            console.log('Decoded Token:', decoded);
            
            // 检查用户角色是否匹配
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: '权限不足' });
            }

            // 将解码后的用户信息传递到下一个中间件
            req.user = decoded;
            next();
        } catch (error) {
            // 在这里打印 JWT 验证的错误信息
            console.error('JWT Verification Error:', error);
            res.status(401).json({ message: '无效的令牌' });
        }
    };
}

module.exports = { authMiddleware };
