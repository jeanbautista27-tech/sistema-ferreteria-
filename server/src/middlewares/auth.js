const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ ok: false, msg: 'Token no proporcionado' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ ok: false, msg: 'Formato de token inválido' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ ok: false, msg: 'Token inválido o expirado' });
    }
};

const requireAdmin = (req, res, next) => {
    if (req.user?.rol !== 'Administrador') {
        return res.status(403).json({ ok: false, msg: 'Acceso denegado. Se requiere rol Administrador.' });
    }
    next();
};

module.exports = { verifyToken, requireAdmin };
