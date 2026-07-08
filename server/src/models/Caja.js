const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Caja = sequelize.define('Caja', {
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    monto_inicial: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    monto_final: { type: DataTypes.DECIMAL(10, 2) },
    total_ventas: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total_egresos: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    estado: { type: DataTypes.ENUM('Abierta', 'Cerrada'), defaultValue: 'Abierta' },
    observaciones: { type: DataTypes.TEXT },
    fecha_apertura: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    fecha_cierre: { type: DataTypes.DATE }
}, { tableName: 'caja', timestamps: true, underscored: true });

module.exports = Caja;
