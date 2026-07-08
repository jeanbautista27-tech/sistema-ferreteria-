const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { Cotizacion, DetalleCotizacion, Producto, Cliente, Usuario, Configuracion } = require('../models');

const getAll = async (req, res) => {
    try {
        const { estado } = req.query;
        const where = {};
        if (estado) where.estado = estado;

        const cotizaciones = await Cotizacion.findAll({
            where,
            include: [
                { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'numero_documento'] },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json({ ok: true, cotizaciones });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al obtener cotizaciones', error: err.message });
    }
};

const getOne = async (req, res) => {
    try {
        const cotizacion = await Cotizacion.findByPk(req.params.id, {
            include: [
                { model: Cliente, as: 'cliente' },
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
                { model: DetalleCotizacion, as: 'detalles', include: [{ model: Producto, as: 'producto', attributes: ['id', 'nombre', 'codigo', 'unidad'] }] }
            ]
        });
        if (!cotizacion) return res.status(404).json({ ok: false, msg: 'Cotización no encontrada' });
        res.json({ ok: true, cotizacion });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al obtener detalle', error: err.message });
    }
};

const create = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { cliente_id, descuento, validez_dias, items, observaciones } = req.body;
        if (!items || items.length === 0) return res.status(400).json({ ok: false, msg: 'No hay productos en la cotización' });

        // Obtener configuración para IGV
        const igvConf = await Configuracion.findOne({ where: { clave: 'igv_porcentaje' } });
        const igvPorc = parseFloat(igvConf?.valor || 18) / 100;

        let subtotalBruto = 0;
        const detallesData = [];

        for (const item of items) {
            const producto = await Producto.findByPk(item.producto_id);
            if (!producto) throw new Error(`Producto ID ${item.producto_id} no encontrado`);

            const subtotal = parseFloat(item.precio_unitario) * item.cantidad - (item.descuento || 0);
            subtotalBruto += subtotal;

            detallesData.push({
                cotizacion_id: null,
                producto_id: item.producto_id,
                cantidad: item.cantidad,
                precio_unitario: item.precio_unitario,
                descuento: item.descuento || 0,
                subtotal
            });
        }

        const descuentoTotal = parseFloat(descuento || 0);
        const subtotalFinal = subtotalBruto - descuentoTotal;
        const igvMonto = parseFloat((subtotalFinal * igvPorc / (1 + igvPorc)).toFixed(2));
        const total = parseFloat(subtotalFinal.toFixed(2));

        // Autogenerar Correlativo PROFORMA
        const count = await Cotizacion.count();
        const numCorrelativo = String(count + 1).padStart(6, '0');
        const numComprobante = `PROF-${numCorrelativo}`;

        const cotizacion = await Cotizacion.create({
            numero_comprobante: numComprobante,
            cliente_id: cliente_id || null,
            usuario_id: req.user.id,
            subtotal: total - igvMonto,
            igv: igvMonto,
            total,
            descuento: descuentoTotal,
            validez_dias: validez_dias || 15,
            estado: 'Pendiente',
            observaciones
        }, { transaction: t });

        for (const d of detallesData) {
            d.cotizacion_id = cotizacion.id;
            await DetalleCotizacion.create(d, { transaction: t });
        }

        await t.commit();
        res.status(201).json({ ok: true, msg: 'Cotización guardada exitosamente', cotizacion });
    } catch (err) {
        await t.rollback();
        res.status(500).json({ ok: false, msg: err.message || 'Error al guardar cotización', error: err.message });
    }
};

const anular = async (req, res) => {
    try {
        const cotizacion = await Cotizacion.findByPk(req.params.id);
        if (!cotizacion) return res.status(404).json({ ok: false, msg: 'Cotización no encontrada' });

        await cotizacion.update({ estado: 'Anulada' });
        res.json({ ok: true, msg: 'Cotización anulada' });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al anular cotización', error: err.message });
    }
};

module.exports = { getAll, getOne, create, anular };
