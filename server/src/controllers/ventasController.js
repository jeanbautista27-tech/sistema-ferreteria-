const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { Venta, DetalleVenta, Producto, Cliente, Usuario, InventarioMovimiento, Configuracion, CuentaCobrar } = require('../models');

const getAll = async (req, res) => {
    try {
        const { desde, hasta, estado } = req.query;
        const where = {};
        if (estado) where.estado = estado;
        if (desde && hasta) where.created_at = { [Op.between]: [new Date(desde), new Date(hasta + ' 23:59:59')] };
        const ventas = await Venta.findAll({
            where,
            include: [
                { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'numero_documento'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json({ ok: true, ventas });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al obtener ventas', error: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const venta = await Venta.findByPk(req.params.id, {
            include: [
                { model: Cliente, as: 'cliente' },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
                { model: DetalleVenta, as: 'detalles', include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre', 'codigo', 'unidad'] }] }
            ]
        });
        if (!venta) return res.status(404).json({ ok: false, msg: 'Venta no encontrada' });
        res.json({ ok: true, venta });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

const create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { cliente_id, tipo_comprobante, tipo_pago, monto_recibido, descuento, items, observaciones } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ ok: false, msg: 'No hay productos en la venta' });

        if (tipo_pago === 'Crédito' && (!cliente_id || cliente_id === '')) {
            return res.status(400).json({ ok: false, msg: 'La venta al crédito requiere obligatoriamente un cliente registrado.' });
        }

        // Obtener configuración
        const serieConf = await Configuracion.findOne({ where: { clave: tipo_comprobante === 'Factura' ? 'serie_factura' : 'serie_boleta' } });
        const numConf = await Configuracion.findOne({ where: { clave: 'numero_correlativo' } });
        const igvConf = await Configuracion.findOne({ where: { clave: 'igv_porcentaje' } });
        const serie = serieConf?.valor || 'B001';
        const num = String(parseInt(numConf?.valor || 1)).padStart(8, '0');
        const igvPorc = parseFloat(igvConf?.valor || 18) / 100;

        let subtotalBruto = 0;
        const detallesData = [];

        for (const item of items) {
            const producto = await Producto.findByPk(item.producto_id, { transaction: t });
            if (!producto) throw new Error(`Producto ID ${item.producto_id} no encontrado`);
            if (producto.stock < item.cantidad) throw new Error(`Stock insuficiente para ${producto.nombre}`);
            const subtotal = parseFloat(item.precio_unitario) * item.cantidad - (item.descuento || 0);
            subtotalBruto += subtotal;
            detallesData.push({ venta_id: null, producto_id: item.producto_id, cantidad: item.cantidad, precio_unitario: item.precio_unitario, descuento: item.descuento || 0, subtotal });
        }

        const descuentoTotal = parseFloat(descuento || 0);
        const subtotalFinal = subtotalBruto - descuentoTotal;
        const igvMonto = parseFloat((subtotalFinal * igvPorc / (1 + igvPorc)).toFixed(2));
        const total = parseFloat(subtotalFinal.toFixed(2));
        const vuelto = monto_recibido ? parseFloat(monto_recibido) - total : 0;

        const venta = await Venta.create({
            numero_comprobante: `${serie}-${num}`,
            tipo_comprobante: tipo_comprobante || 'Boleta',
            cliente_id: cliente_id || null,
            usuario_id: req.user.id,
            subtotal: total - igvMonto,
            igv: igvMonto,
            total,
            descuento: descuentoTotal,
            tipo_pago,
            monto_recibido: tipo_pago === 'Crédito' ? 0 : (monto_recibido || total), // Si es al crédito, dinero en caja es 0
            vuelto: tipo_pago === 'Crédito' ? 0 : Math.max(vuelto, 0),
            estado: 'Completada',
            observaciones
        }, { transaction: t });

        // Si es al crédito, generamos la deuda en CuentaCobrar
        if (tipo_pago === 'Crédito') {
            await CuentaCobrar.create({
                venta_id: venta.id,
                cliente_id: cliente_id,
                monto_total: total,
                saldo_pagado: 0,
                saldo_pendiente: total,
                fecha_vencimiento: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 días de plazo por defecto
                estado: 'Pendiente'
            }, { transaction: t });
        }

        for (const d of detallesData) {
            d.venta_id = venta.id;
            await DetalleVenta.create(d, { transaction: t });
            const prod = await Producto.findByPk(d.producto_id, { transaction: t });
            const stockAntes = prod.stock;
            const stockDespues = stockAntes - d.cantidad;
            await prod.update({ stock: stockDespues }, { transaction: t });
            await InventarioMovimiento.create({
                producto_id: d.producto_id, usuario_id: req.user.id,
                tipo: 'Venta', cantidad: -d.cantidad,
                stock_antes: stockAntes, stock_despues: stockDespues,
                motivo: `Venta ${venta.numero_comprobante}`, referencia_id: venta.id, referencia_tipo: 'venta'
            }, { transaction: t });
        }

        // Actualizar correlativo
        await Configuracion.update({ valor: String(parseInt(num) + 1) }, { where: { clave: 'numero_correlativo' }, transaction: t });

        await t.commit();
        const ventaCompleta = await Venta.findByPk(venta.id, {
            include: [{ model: DetalleVenta, as: 'detalles', include: [{ model: Producto, as: 'producto' }] }, { model: Cliente, as: 'cliente' }]
        });
        res.status(201).json({ ok: true, msg: 'Venta registrada exitosamente', venta: ventaCompleta });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ ok: false, msg: err.message || 'Error al registrar venta', error: err.message });
    }
};

const anular = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const venta = await Venta.findByPk(req.params.id, {
            include: [{ model: DetalleVenta, as: 'detalles' }]
        });
        if (!venta) return res.status(404).json({ ok: false, msg: 'Venta no encontrada' });
        if (venta.estado === 'Anulada') return res.status(400).json({ ok: false, msg: 'La venta ya está anulada' });

        for (const detalle of venta.detalles) {
            const prod = await Producto.findByPk(detalle.producto_id, { transaction: t });
            const stockAntes = prod.stock;
            await prod.update({ stock: stockAntes + detalle.cantidad }, { transaction: t });
        }
        await venta.update({ estado: 'Anulada' }, { transaction: t });
        await t.commit();
        res.json({ ok: true, msg: 'Venta anulada y stock revertido' });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ ok: false, msg: 'Error al anular venta', error: err.message });
    }
};

module.exports = { getAll, getOne, create, anular };
