const { Caja, CajaEgreso, Venta, Usuario } = require('../models');
const { Op } = require('sequelize');

const getCajaActual = async (req, res) => {
    try {
        const caja = await Caja.findOne({
            where: { estado: 'Abierta' },
            include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] }]
        });
        res.json({ ok: true, caja });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

const abrir = async (req, res) => {
    try {
        const abierta = await Caja.findOne({ where: { estado: 'Abierta' } });
        if (abierta) return res.status(400).json({ ok: false, msg: 'Ya hay una caja abierta' });
        const caja = await Caja.create({
            usuario_id: req.user.id,
            monto_inicial: req.body.monto_inicial || 0,
            estado: 'Abierta',
            fecha_apertura: new Date()
        });
        res.status(201).json({ ok: true, msg: 'Caja abierta', caja });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al abrir caja', error: err.message });
    }
};

const cerrar = async (req, res) => {
    try {
        const caja = await Caja.findByPk(req.params.id);
        if (!caja || caja.estado !== 'Abierta') return res.status(400).json({ ok: false, msg: 'Caja no encontrada o ya cerrada' });

        const ventas = await Venta.findAll({ where: { estado: 'Completada', created_at: { [Op.gte]: caja.fecha_apertura } } });
        const totalVentas = ventas.reduce((acc, v) => acc + parseFloat(v.total), 0);

        const egresos = await CajaEgreso.findAll({ where: { caja_id: caja.id, tipo: 'Egreso' } });
        const totalEgresos = egresos.reduce((acc, e) => acc + parseFloat(e.monto), 0);
        const monto_final = parseFloat(caja.monto_inicial) + totalVentas - totalEgresos;

        await caja.update({
            estado: 'Cerrada', fecha_cierre: new Date(),
            total_ventas: totalVentas, total_egresos: totalEgresos,
            monto_final, observaciones: req.body.observaciones
        });
        res.json({ ok: true, msg: 'Caja cerrada', caja });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al cerrar caja', error: err.message });
    }
};

const registrarMovimiento = async (req, res) => {
    try {
        const { caja_id, concepto, monto, tipo } = req.body;
        const mov = await CajaEgreso.create({ caja_id, usuario_id: req.user.id, concepto, monto, tipo: tipo || 'Egreso' });
        res.status(201).json({ ok: true, msg: 'Movimiento registrado', movimiento: mov });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

const getHistorial = async (req, res) => {
    try {
        const cajas = await Caja.findAll({
            include: [
                { model: Usuario, as: 'usuario', attributes: ['id', 'nombre'] },
                { model: CajaEgreso, as: 'movimientos' }
            ],
            order: [['created_at', 'DESC']],
            limit: 30
        });
        res.json({ ok: true, cajas });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

module.exports = { getCajaActual, abrir, cerrar, registrarMovimiento, getHistorial };
