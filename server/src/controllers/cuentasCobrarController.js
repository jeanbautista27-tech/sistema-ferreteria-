const { Op } = require('sequelize');
const sequelize = require('../config/db');
const { CuentaCobrar, AbonoCuenta, Cliente, Venta, Usuario, Caja, CajaEgreso } = require('../models');

const listar = async (req, res) => {
    try {
        const { estado } = req.query;
        const where = {};
        if (estado) where.estado = estado;

        const cuentas = await CuentaCobrar.findAll({
            where,
            include: [
                { model: Cliente, as: 'cliente', attributes: ['id', 'nombre', 'numero_documento'] },
                { model: Venta, as: 'venta', attributes: ['id', 'numero_comprobante', 'created_at'] }
            ],
            order: [['created_at', 'DESC']]
        });
        res.json({ ok: true, cuentas });
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al listar cuentas', error: error.message });
    }
};

const detalle = async (req, res) => {
    try {
        const cuenta = await CuentaCobrar.findByPk(req.params.id, {
            include: [
                { model: Cliente, as: 'cliente' },
                { model: Venta, as: 'venta', attributes: ['numero_comprobante', 'total', 'created_at'] },
                {
                    model: AbonoCuenta,
                    as: 'abonos',
                    include: [{ model: Usuario, as: 'cajero', attributes: ['nombre'] }]
                }
            ],
            order: [[{ model: AbonoCuenta, as: 'abonos' }, 'created_at', 'ASC']]
        });
        if (!cuenta) return res.status(404).json({ ok: false, msg: 'Cuenta por cobrar no encontrada' });

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
        if (!cajaAbierta) throw new Error('Para registrar un abono debes tener una caja abierta activa.');

        const cuenta = await CuentaCobrar.findByPk(cuentaId, { transaction: t });
        if (!cuenta) throw new Error('Cuenta por cobrar no encontrada');
        if (cuenta.estado === 'Pagado') throw new Error('Esta cuenta ya está completamente pagada');

        const saldoPendienteOriginal = parseFloat(cuenta.saldo_pendiente);
        if (montoAbono > saldoPendienteOriginal) throw new Error(`El abono (S/ ${montoAbono}) supera la deuda pendiente (S/ ${saldoPendienteOriginal})`);

        // Registrar el abono
        const abono = await AbonoCuenta.create({
            cuenta_cobrar_id: cuenta.id,
            usuario_id: req.user.id,
            caja_id: cajaAbierta.id,
            monto: montoAbono,
            metodo_pago: metodo_pago || 'Efectivo',
            referencia
        }, { transaction: t });

        // Actualizar CuentaCobrar
        const nuevoAbonado = parseFloat(cuenta.saldo_pagado) + montoAbono;
        const nuevoPendiente = parseFloat(cuenta.monto_total) - nuevoAbonado;

        await cuenta.update({
            saldo_pagado: nuevoAbonado,
            saldo_pendiente: nuevoPendiente,
            estado: nuevoPendiente <= 0 ? 'Pagado' : 'Pendiente'
        }, { transaction: t });

        // Aumentar dinero a la Caja (Es un ingreso)
        // No usaremos CajaEgreso para no mezclar, idealmente tendríamos tabla Ingreso/Egreso.
        // Simularemos un ingreso sumando al total_ingresos_extra o equivalente en la caja, pero como
        // el req era que la caja del usuario cuadre, y actualmente sólo se tiene ventas por caja...
        // Para simplificar sin alterar modelo de caja:

        // Sumaremos a total_ventas si es la unica forma de subir caja? 
        // Mejor añadirlo a `monto_final` y registrar, pero wait. Caja model is:
        // id, fecha, usuario_id, monto_inicial, total_ventas (efectivo), 
        // monto_final_calculado, monto_cierre_real, diferencia, estado.
        // Ok, vamos a sumarlo al total_ventas y recalcular monto_final_calculado.

        const nuevoTotalVentas = parseFloat(cajaAbierta.total_ventas) + montoAbono;
        const egresosResult = await CajaEgreso.sum('monto', { where: { caja_id: cajaAbierta.id }, transaction: t });
        const totalEgresos = egresosResult || 0;
        const montoFinal = parseFloat(cajaAbierta.monto_inicial) + nuevoTotalVentas - parseFloat(totalEgresos);

        await cajaAbierta.update({
            total_ventas: nuevoTotalVentas,
            monto_final_calculado: montoFinal
        }, { transaction: t });

        await t.commit();
        res.json({ ok: true, msg: 'Abono registrado exitosamente', abono, cuenta });
    } catch (error) {
        await t.rollback();
        res.status(400).json({ ok: false, msg: error.message });
    }
};

module.exports = { listar, detalle, registrarAbono };
