const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Devolucion = sequelize.define('Devolucion', {
    venta_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    numero_comprobante: { type: DataTypes.STRING(30), unique: true },
    motivo: { type: DataTypes.TEXT, allowNull: false },
    total_reembolso: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    tipo_reembolso: { type: DataTypes.ENUM('Efectivo', 'Nota Credito'), defaultValue: 'Nota Credito' },
    estado: { type: DataTypes.ENUM('Completada', 'Anulada'), defaultValue: 'Completada' }
}, { tableName: 'devoluciones', timestamps: true, underscored: true });

module.exports = Devolucion;
