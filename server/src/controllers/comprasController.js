const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { Compra, DetalleCompra, Producto, Proveedor, Usuario, InventarioMovimiento, CuentaPagar, Caja, CajaEgreso } = require('../models');

const getAll = async (req, res) => {
    try {
        const { desde, hasta, estado } = req.query;
        const where = {};
        if (estado) where.estado = estado;
        if (desde && hasta) where.created_at = { [Op.between]: [new Date(desde), new Date(hasta + ' 23:59:59')] };
        const compras = await Compra.findAll({
            where,
            include: [
                { model: Proveedor, as: 'proveedor', attributes: ['id', 'empresa'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json({ ok: true, compras });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al obtener compras', error: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const compra = await Compra.findByPk(req.params.id, {
            include: [
                { model: Proveedor, as: 'proveedor' },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
                { model: DetalleCompra, as: 'detalles', include: [{ model: Producto, as: 'producto' }] }
            ]
        });
        if (!compra) return res.status(404).json({ ok: false, msg: 'Compra no encontrada' });
        res.json({ ok: true, compra });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

const create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { proveedor_id, items, fecha_esperada, observaciones, estado, tipo_pago } = req.body;
        if (!proveedor_id) return res.status(400).json({ ok: false, msg: 'Proveedor es requerido' });
        if (!items || items.length === 0) return res.status(400).json({ ok: false, msg: 'No hay productos' });

        let total = 0;
        const detalles = items.map(item => {
            const sub = item.cantidad * parseFloat(item.precio_unitario);
            total += sub;
            return { ...item, subtotal: sub };
        });
        const igv = parseFloat((total * 0.18).toFixed(2));
        const numero_orden = `OC-${Date.now()}`;

        const compra = await Compra.create({
            numero_orden, proveedor_id, usuario_id: req.user.id,
            subtotal: total - igv, igv, total: total + igv,
            fecha_esperada, observaciones,
            estado: estado || 'Pendiente',
            tipo_pago: tipo_pago || 'Efectivo'
        }, { transaction: t });

        // Si es al crédito, generamos la deuda en CuentaPagar en vez de descontar la caja
        if (tipo_pago === 'Crédito') {
            await CuentaPagar.create({
                compra_id: compra.id,
                proveedor_id: proveedor_id,
                monto_total: total + igv,
                saldo_pagado: 0,
                saldo_pendiente: total + igv,
                fecha_vencimiento: new Date(new Date().setDate(new Date().getDate() + 30)), // 30 días default
                estado: 'Pendiente'
            }, { transaction: t });
        } else {
            // Si es al contado (Efectivo), debemos extraer el dinero de la Caja de inmediato
            const cajaAbierta = await Caja.findOne({ where: { usuario_id: req.user.id, estado: 'Abierta' }, transaction: t });
            if (!cajaAbierta) throw new Error('Se requiere una caja activa para procesar compras al contado. O envíe la compra al Crédito.');

            await CajaEgreso.create({
                caja_id: cajaAbierta.id,
                usuario_id: req.user.id,
                motivo: `Pago por Compra ${numero_orden}`,
                monto: total + igv
            }, { transaction: t });
        }

        for (const d of detalles) {
            await DetalleCompra.create({ ...d, compra_id: compra.id }, { transaction: t });
            if ((estado || 'Pendiente') === 'Recibida') {
                const prod = await Producto.findByPk(d.producto_id, { transaction: t });
                const stockAntes = prod.stock;
                await prod.update({ stock: stockAntes + d.cantidad }, { transaction: t });
                await InventarioMovimiento.create({
                    producto_id: d.producto_id, usuario_id: req.user.id,
                    tipo: 'Compra', cantidad: d.cantidad,
                    stock_antes: stockAntes, stock_despues: stockAntes + d.cantidad,
                    motivo: `Compra ${numero_orden}`, referencia_id: compra.id, referencia_tipo: 'compra'
                }, { transaction: t });
            }
        }

        await t.commit();
        res.status(201).json({ ok: true, msg: 'Compra registrada', compra });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ ok: false, msg: 'Error al registrar compra', error: err.message });
    }
};

const recibirCompra = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const compra = await Compra.findByPk(req.params.id, {
            include: [{ model: DetalleCompra, as: 'detalles' }]
        });
        if (!compra) return res.status(404).json({ ok: false, msg: 'Compra no encontrada' });
        if (compra.estado === 'Recibida') return res.status(400).json({ ok: false, msg: 'La compra ya fue recibida' });

        for (const detalle of compra.detalles) {
            const prod = await Producto.findByPk(detalle.producto_id, { transaction: t });
            const stockAntes = prod.stock;
            await prod.update({ stock: stockAntes + detalle.cantidad }, { transaction: t });
            await InventarioMovimiento.create({
                producto_id: detalle.producto_id, usuario_id: req.user.id,
                tipo: 'Compra', cantidad: detalle.cantidad,
                stock_antes: stockAntes, stock_despues: stockAntes + detalle.cantidad,
                motivo: `Recepción ${compra.numero_orden}`, referencia_id: compra.id, referencia_tipo: 'compra'
            }, { transaction: t });
        }
        await compra.update({ estado: 'Recibida' }, { transaction: t });
        await t.commit();
        res.json({ ok: true, msg: 'Compra recibida y stock actualizado' });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ ok: false, msg: 'Error al recibir compra', error: err.message });
    }
};

module.exports = { getAll, getOne, create, recibirCompra };
