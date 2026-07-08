const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cotizacion = sequelize.define('Cotizacion', {
    numero_comprobante: { type: DataTypes.STRING(30), unique: true },
    cliente_id: { type: DataTypes.INTEGER },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    igv: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    descuento: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    validez_dias: { type: DataTypes.INTEGER, defaultValue: 15 },
    estado: { type: DataTypes.ENUM('Pendiente', 'Convertida', 'Vencida', 'Anulada'), defaultValue: 'Pendiente' },
    observaciones: { type: DataTypes.TEXT }
}, { tableName: 'cotizaciones', timestamps: true, underscored: true });

module.exports = Cotizacion;
