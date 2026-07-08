const { Configuracion } = require('../models');

const getAll = async (req, res) => {
    try {
        const config = await Configuracion.findAll();
        const result = {};
        config.forEach(c => result[c.clave] = c.valor);
        res.json({ ok: true, configuracion: result });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const data = req.body;
        for (const [clave, valor] of Object.entries(data)) {
            await Configuracion.upsert({ clave, valor });
        }
        if (req.file) {
            await Configuracion.upsert({ clave: 'empresa_logo', valor: req.file.filename });
        }
        res.json({ ok: true, msg: 'Configuración actualizada' });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al actualizar configuración', error: err.message });
    }
};

module.exports = { getAll, update };
