const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { CuentaPagar, AbonoPagar, Proveedor, Compra, Usuario, Caja, CajaEgreso } = require('../models');

const listar = async (req, res) => {
    try {
        const { estado } = req.query;
        const where = {};
        if (estado) where.estado = estado;

        const cuentas = await CuentaPagar.findAll({
            where,
            include: [
                { model: Proveedor, as: 'proveedor', attributes: ['id', 'empresa', 'ruc'] },
                { model: Compra, as: 'compra', attributes: ['id', 'numero_orden', 'created_at'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json({ ok: true, cuentas });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al listar cuentas por pagar', error: error.message });
    }
};

const detalle = async (req, res) => {
    try {
        const cuenta = await CuentaPagar.findByPk(req.params.id, {
            include: [
                { model: Proveedor, as: 'proveedor' },
                { model: Compra, as: 'compra', attributes: ['numero_orden', 'total', 'created_at'] },
                {
                    model: AbonoPagar,
                    as: 'abonos',
                    include: [{ model: Usuario, as: 'usuario', attributes: ['nombre'] }]
                }
            ],
            order: [[{ model: AbonoPagar, as: 'abonos' }, 'created_at', 'ASC']]
        });
        if (!cuenta) return res.status(404).json({ ok: false, msg: 'Cuenta por pagar no encontrada' });

        res.json({ ok: true, cuenta });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al obtener detalle', error: error.message });
    }
};

const registrarAbono = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const cuentaId = req.params.id;
        const { monto, metodo_pago, referencia } = req.body;
        const montoAbono = parseFloat(monto);

        if (isNaN(montoAbono) || montoAbono <= 0) throw new Error('Monto inválido');

        // Buscar caja abierta
        const cajaAbierta = await Caja.findOne({
            where: { usuario_id: req.user.id, estado: 'Abierta' },
            transaction: t
        });
        if (!cajaAbierta) throw new Error('Para registrar un pago a proveedor (egreso) debes tener una caja activa.');

        const cuenta = await CuentaPagar.findByPk(cuentaId, { transaction: t });
        if (!cuenta) throw new Error('Cuenta por pagar no encontrada');
        if (cuenta.estado === 'Pagado') throw new Error('Esta cuenta ya ha sido cancelada al proveedor en su totalidad.');

        const saldoPendienteOriginal = parseFloat(cuenta.saldo_pendiente);
        if (montoAbono > saldoPendienteOriginal) throw new Error(`El abono (S/ ${montoAbono}) supera la deuda por pagar (S/ ${saldoPendienteOriginal})`);

        // Registrar el abono (Historial técnico)
        const abono = await AbonoPagar.create({
            cuenta_pagar_id: cuenta.id,
            usuario_id: req.user.id,
            caja_id: cajaAbierta.id,
            monto: montoAbono,
            metodo_pago: metodo_pago || 'Efectivo',
            referencia
        }, { transaction: t });

        // Actualizar CuentaPagar
        const nuevoAbonado = parseFloat(cuenta.saldo_pagado) + montoAbono;
        const nuevoPendiente = parseFloat(cuenta.monto_total) - nuevoAbonado;

        await cuenta.update({
            saldo_pagado: nuevoAbonado,
            saldo_pendiente: nuevoPendiente,
            estado: nuevoPendiente <= 0 ? 'Pagado' : 'Pendiente'
        }, { transaction: t });

        // Al generarse un abono (salida de dinero), afectamos la CAJA CHICA inmediatamente a través de un Egreso.
        const compraRef = await Compra.findByPk(cuenta.compra_id, { transaction: t });
        await CajaEgreso.create({
            caja_id: cajaAbierta.id,
            usuario_id: req.user.id,
            motivo: `Pago al crédito (proveedor). Ref Compra: ${compraRef ? compraRef.numero_orden : 'S/N'}`,
            monto: montoAbono
        }, { transaction: t });

        await t.commit();
        res.json({ ok: true, msg: 'Pago/Abono a proveedor registrado exitosamente', abono, cuenta });
    } catch (error) {
        await t.rollback();
        res.status(400).json({ ok: false, msg: error.message });
    }
};

module.exports = { listar, detalle, registrarAbono };
