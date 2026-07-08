const { Proveedor } = require('../models');

const getAll = async (req, res) => {
    try {
        const proveedores = await Proveedor.findAll({ where: { activo: 1 }, order: [['empresa', 'ASC']] });
        res.json({ ok: true, proveedores });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al obtener proveedores', error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { empresa } = req.body;
        if (!empresa) return res.status(400).json({ ok: false, msg: 'Razón social es requerida' });
        const proveedor = await Proveedor.create(req.body);
        res.status(201).json({ ok: true, msg: 'Proveedor creado', proveedor });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al crear proveedor', error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const proveedor = await Proveedor.findByPk(req.params.id);
        if (!proveedor) return res.status(404).json({ ok: false, msg: 'Proveedor no encontrado' });
        await proveedor.update(req.body);
        res.json({ ok: true, msg: 'Proveedor actualizado', proveedor });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al actualizar', error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const proveedor = await Proveedor.findByPk(req.params.id);
        if (!proveedor) return res.status(404).json({ ok: false, msg: 'Proveedor no encontrado' });
        await proveedor.update({ activo: 0 });
        res.json({ ok: true, msg: 'Proveedor eliminado' });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al eliminar', error: err.message });
    }
};

module.exports = { getAll, create, update, remove };
