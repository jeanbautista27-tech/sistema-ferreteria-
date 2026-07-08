const { Op } = require('sequelize');
const path = require('path');
const { Producto, Categoria, Proveedor } = require('../models');

const getAll = async (req, res) => {
    try {
        const { search, categoria_id, stock_bajo } = req.query;
        const where = { activo: 1 };
        if (search) where.nombre = { [Op.like]: `%${search}%` };
        if (categoria_id) where.categoria_id = categoria_id;
        if (stock_bajo === 'true') {
            const { sequelize } = require('../config/db');
            where[Op.and] = sequelize.where(
                sequelize.col('stock'), { [Op.lte]: sequelize.col('stock_minimo') }
            );
        }
        const productos = await Producto.findAll({
            where,
            include: [
                { model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] },
                { model: Proveedor, as: 'proveedor', attributes: ['id', 'empresa'] }
            ],
            order: [['nombre', 'ASC']]
        });
        res.json({ ok: true, productos });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al obtener productos', error: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id, {
            include: [
                { model: Categoria, as: 'categoria' },
                { model: Proveedor, as: 'proveedor' }
            ]
        });
        if (!producto) return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
        res.json({ ok: true, producto });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

const create = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) data.imagen = req.file.filename;
        if (!data.nombre) return res.status(400).json({ ok: false, msg: 'Nombre es requerido' });
        if (!data.precio_venta) return res.status(400).json({ ok: false, msg: 'Precio de venta es requerido' });
        const producto = await Producto.create(data);
        res.status(201).json({ ok: true, msg: 'Producto creado', producto });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al crear producto', error: err.message });
    }
};

const update = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
        const data = { ...req.body };
        if (req.file) data.imagen = req.file.filename;
        await producto.update(data);
        res.json({ ok: true, msg: 'Producto actualizado', producto });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al actualizar', error: err.message });
    }
};

const remove = async (req, res) => {
    try {
        const producto = await Producto.findByPk(req.params.id);
        if (!producto) return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
        await producto.update({ activo: 0 });
        res.json({ ok: true, msg: 'Producto eliminado' });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al eliminar', error: err.message });
    }
};

module.exports = { getAll, getOne, create, update, remove };
