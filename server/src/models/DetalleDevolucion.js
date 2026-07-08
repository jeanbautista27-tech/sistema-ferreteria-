const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DetalleDevolucion = sequelize.define('DetalleDevolucion', {
    devolucion_id: { type: DataTypes.INTEGER, allowNull: false },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { tableName: 'detalle_devoluciones', timestamps: true, underscored: true, updatedAt: false });

module.exports = DetalleDevolucion;
