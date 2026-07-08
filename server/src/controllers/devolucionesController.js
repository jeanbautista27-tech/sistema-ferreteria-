const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { Devolucion, DetalleDevolucion, Venta, DetalleVenta, Producto, Usuario, Cliente, InventarioMovimiento, Caja, CajaEgreso } = require('../models');

const getAll = async (req, res) => {
    try {
        const devoluciones = await Devolucion.findAll({
            include: [
                { model: Venta, as: 'venta', include: [{ model: Cliente, as: 'cliente', attributes: ['nombre', 'numero_documento'] }] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json({ ok: true, devoluciones });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al listar devoluciones', error: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const devolucion = await Devolucion.findByPk(req.params.id, {
            include: [
                { model: Venta, as: 'venta', include: [{ model: Cliente, as: 'cliente' }] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
                { model: DetalleDevolucion, as: 'detalles', include: [{ model: Producto, as: 'producto' }] }
            ]
        });
        if (!devolucion) return res.status(404).json({ ok: false, msg: 'Devolución no encontrada' });
        res.json({ ok: true, devolucion });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al obtener detalle', error: err.message });
    }
};

const create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { venta_id, motivo, tipo_reembolso, items } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ ok: false, msg: 'No se enviaron productos para devolver' });

        const venta = await Venta.findByPk(venta_id, { include: [{ model: DetalleVenta, as: 'detalles' }] });
        if (!venta) return res.status(404).json({ ok: false, msg: 'Venta no encontrada' });
        if (venta.estado !== 'Completada') return res.status(400).json({ ok: false, msg: 'Solo se pueden devolver ventas completadas' });

        // Verificar cantidades válidas
        let total_reembolso = 0;
        const detallesData = [];

        for (const item of items) {
            const numCant = parseInt(item.cantidad);
            if (numCant <= 0) continue;

            // Comprobar si exceden la compra original
            const detalleVenta = venta.detalles.find(d => d.producto_id === item.producto_id);
            if (!detalleVenta || numCant > detalleVenta.cantidad) {
                throw new Error('Cantidad a devolver excede lo vendido o el producto no pertenece a la venta');
            }

            // Verificar si ya se devolvieron (para evitar multidevoluciones de lo mismo) - Tarea opcional/futura: guardar un acumulado en el detalle, 
            // pero para esta versión validamos solo sobre el tope base.

            const subtotal = numCant * parseFloat(detalleVenta.precio_unitario);
            total_reembolso += subtotal;

            detallesData.push({
                devolucion_id: null,
                producto_id: item.producto_id,
                cantidad: numCant,
                precio_unitario: detalleVenta.precio_unitario,
                subtotal
            });
        }

        if (detallesData.length === 0) throw new Error('Las cantidades a devolver deben ser mayores a cero');

        // Generar Correlativo automático temporal (NC-XXXX)
        const count = await Devolucion.count();
        const numComp = `NC001-${String(count + 1).padStart(6, '0')}`;

        const devolucion = await Devolucion.create({
            venta_id,
            usuario_id: req.user.id,
            numero_comprobante: numComp,
            motivo,
            total_reembolso,
            tipo_reembolso
        }, { transaction: t });

        for (const d of detallesData) {
            d.devolucion_id = devolucion.id;
            await DetalleDevolucion.create(d, { transaction: t });

            // Devolver Stock
            const prod = await Producto.findByPk(d.producto_id, { transaction: t });
            const stockAntes = prod.stock;
            const stockDespues = stockAntes + d.cantidad;
            await prod.update({ stock: stockDespues }, { transaction: t });

            // Movimiento Inventario
            await InventarioMovimiento.create({
                producto_id: d.producto_id, usuario_id: req.user.id,
                tipo: 'Entrada', cantidad: d.cantidad,
                stock_antes: stockAntes, stock_despues: stockDespues,
                motivo: `Devolución ${numComp} s/ Venta ${venta.numero_comprobante}`,
                referencia_id: devolucion.id, referencia_tipo: 'devolucion'
            }, { transaction: t });
        }

        // Si tipo es Efectivo, se registra como egreso de la caja activa
        if (tipo_reembolso === 'Efectivo') {
            const cajaFiltro = await Caja.findOne({ where: { estado: 'Abierta', usuario_id: req.user.id }, transaction: t });
            if (!cajaFiltro) throw new Error('No tienes una caja abierta para procesar el reembolso en efectivo');

            const montoNuevo = parseFloat(cajaFiltro.total_egresos) + total_reembolso;
            await cajaFiltro.update({ total_egresos: montoNuevo }, { transaction: t });

            await CajaEgreso.create({
                caja_id: cajaFiltro.id,
                usuario_id: req.user.id,
                monto: total_reembolso,
                motivo: `Reembolso por Devolución ${numComp}`
            }, { transaction: t });
        }

        await t.commit();
        res.status(201).json({ ok: true, msg: 'Devolución registrada correctamente', devolucion });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ ok: false, msg: err.message || 'Error al procesar devolución', error: err.message });
    }
};

module.exports = { getAll, getOne, create };
