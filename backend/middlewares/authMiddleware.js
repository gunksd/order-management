const jwt = require('jsonwebtoken');

// 验证用户身份和权限的中间件
function authMiddleware(roles = []) {
    return (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(403).json({ message: '未授权访问' });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: '权限不足' });
            }

            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: '无效的令牌' });
        }
    };
}

module.exports = { authMiddleware };
