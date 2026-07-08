const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CuentaPagar = sequelize.define('CuentaPagar', {
    compra_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    proveedor_id: { type: DataTypes.INTEGER, allowNull: false },
    monto_total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    saldo_pagado: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    saldo_pendiente: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    fecha_vencimiento: { type: DataTypes.DATE, allowNull: true },
    estado: { type: DataTypes.ENUM('Pendiente', 'Pagado', 'Anulado'), defaultValue: 'Pendiente' }
}, { tableName: 'cuentas_pagar', timestamps: true, underscored: true });

module.exports = CuentaPagar;
