const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario, Rol, AuditLog } = require('../models');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ ok: false, msg: 'Email y contraseña requeridos' });

        const usuario = await Usuario.findOne({
            where: { email, activo: 1 },
            include: [{ model: Rol, as: 'rol' }]
        });

        if (!usuario) return res.status(401).json({ ok: false, msg: 'Credenciales incorrectas' });

        const validPass = await bcrypt.compare(password, usuario.password_hash);
        if (!validPass) return res.status(401).json({ ok: false, msg: 'Credenciales incorrectas' });

        await usuario.update({ ultimo_login: new Date() });

        const token = jwt.sign(
            { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol.nombre },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        await AuditLog.create({
            usuario_id: usuario.id,
            accion: 'LOGIN',
            tabla_afectada: 'usuarios',
            registro_id: usuario.id,
            ip: req.ip
        });

        res.json({
            ok: true,
            token,
            usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: usuario.rol.nombre }
        });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error en el servidor', error: err.message });
    }
};

const me = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.user.id, {
            include: [{ model: Rol, as: 'rol' }],
            attributes: { exclude: ['password_hash'] }
        });
        if (!usuario) return res.status(404).json({ ok: false, msg: 'Usuario no encontrado' });
        res.json({ ok: true, usuario });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error en el servidor', error: err.message });
    }
};

module.exports = { login, me };
