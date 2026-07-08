const { Producto, InventarioMovimiento, Usuario, Categoria } = require('../models');
const { Op } = require('sequelize');

const getStock = async (req, res) => {
    try {
        const { search, categoria_id, stock_bajo } = req.query;
        const where = { activo: 1 };
        if (search) where.nombre = { [Op.like]: `%${search}%` };
        if (categoria_id) where.categoria_id = categoria_id;
        const productos = await Producto.findAll({
            where,
            include: [{ model: Categoria, as: 'categoria', attributes: ['id', 'nombre'] }],
            order: [['nombre', 'ASC']]
        });
        const resultado = stock_bajo === 'true'
            ? productos.filter(p => p.stock <= p.stock_minimo)
            : productos;
        res.json({ ok: true, productos: resultado });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

const ajustarStock = async (req, res) => {
    try {
        const { producto_id, cantidad, motivo } = req.body;
        const producto = await Producto.findByPk(producto_id);
        if (!producto) return res.status(404).json({ ok: false, msg: 'Producto no encontrado' });
        const stockAntes = producto.stock;
        const stockDespues = parseInt(cantidad);
        await producto.update({ stock: stockDespues });
        await InventarioMovimiento.create({
            producto_id, usuario_id: req.user.id,
            tipo: 'Ajuste', cantidad: stockDespues - stockAntes,
            stock_antes: stockAntes, stock_despues: stockDespues,
            motivo: motivo || 'Ajuste manual'
        });
        res.json({ ok: true, msg: 'Stock ajustado', producto });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al ajustar stock', error: err.message });
    }
};

const getMovimientos = async (req, res) => {
    try {
        const where = {};
        if (req.query.producto_id) where.producto_id = req.query.producto_id;
        const movimientos = await InventarioMovimiento.findAll({
            where,
            include: [
                { model: Producto, as: 'producto', attributes: ['id', 'nombre', 'codigo'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
            ],
            order: [['created_at', 'DESC']],
            limit: 200
        });
        res.json({ ok: true, movimientos });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

module.exports = { getStock, ajustarStock, getMovimientos };
