const { Op } = require('sequelize');
const { Cliente } = require('../models');

const getAll = async (req, res) => {
    try {
        const { search } = req.query;
        const where = { activo: 1 };
        if (search) where[Op.or] = [
            { nombre: { [Op.like]: `%${search}%` } },
            { numero_documento: { [Op.like]: `%${search}%` } }
        ];
        const clientes = await Cliente.findAll({ where, order: [['nombre', 'ASC']] });
        res.json({ ok: true, clientes });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al obtener clientes', error: err.message });
    }
};

const create = async (req, res) => {
    try {
        if (!req.body.nombre) return res.status(400).json({ ok: false, msg: 'Nombre es requerido' });
        const cliente = await Cliente.create(req.body);
        res.status(201).json({ ok: true, msg: 'Cliente creado', cliente });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al crear cliente', error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) return res.status(404).json({ ok: false, msg: 'Cliente no encontrado' });
        await cliente.update(req.body);
        res.json({ ok: true, msg: 'Cliente actualizado', cliente });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al actualizar', error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const cliente = await Cliente.findByPk(req.params.id);
        if (!cliente) return res.status(404).json({ ok: false, msg: 'Cliente no encontrado' });
        await cliente.update({ activo: 0 });
        res.json({ ok: true, msg: 'Cliente eliminado' });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al eliminar', error: err.message });
    }
};

module.exports = { getAll, create, update, remove };
