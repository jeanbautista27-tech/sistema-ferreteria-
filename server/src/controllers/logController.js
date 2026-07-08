const { AuditLog, Usuario } = require('../models');

const getAll = async (req, res) => {
    try {
        const logs = await AuditLog.findAll({
            include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre', 'email'] }],
            order: [['created_at', 'DESC']],
            limit: 200
        });
        res.json({ ok: true, logs });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

module.exports = { getAll };
