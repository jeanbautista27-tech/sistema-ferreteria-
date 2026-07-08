const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Compra = sequelize.define('Compra', {
    numero_orden: { type: DataTypes.STRING(30), unique: true },
    proveedor_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    igv: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    estado: { type: DataTypes.ENUM('Pendiente', 'Recibida', 'Parcial', 'Anulada'), defaultValue: 'Pendiente' },
    tipo_pago: { type: DataTypes.STRING(30), defaultValue: 'Efectivo' },
    fecha_esperada: { type: DataTypes.DATEONLY },
    observaciones: { type: DataTypes.TEXT }
}, { tableName: 'compras', timestamps: true, underscored: true });

module.exports = Compra;
