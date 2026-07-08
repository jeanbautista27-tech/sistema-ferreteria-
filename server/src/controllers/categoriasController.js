const { Categoria } = require('../models');

const getAll = async (req, res) => {
    try {
        const categorias = await Categoria.findAll({ order: [['nombre', 'ASC']] });
        res.json({ ok: true, categorias });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al obtener categorías', error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const { nombre, descripcion } = req.body;
        if (!nombre) return res.status(400).json({ ok: false, msg: 'Nombre es requerido' });
        const categoria = await Categoria.create({ nombre, descripcion });
        res.status(201).json({ ok: true, msg: 'Categoría creada', categoria });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al crear categoría', error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);
        if (!categoria) return res.status(404).json({ ok: false, msg: 'Categoría no encontrada' });
        await categoria.update(req.body);
        res.json({ ok: true, msg: 'Categoría actualizada', categoria });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al actualizar', error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const categoria = await Categoria.findByPk(req.params.id);
        if (!categoria) return res.status(404).json({ ok: false, msg: 'Categoría no encontrada' });
        await categoria.update({ activo: 0 });
        res.json({ ok: true, msg: 'Categoría eliminada' });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al eliminar', error: err.message });
    }
};

module.exports = { getAll, create, update, remove };
