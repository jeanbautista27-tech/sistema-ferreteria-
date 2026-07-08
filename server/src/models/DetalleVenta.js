const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DetalleVenta = sequelize.define('DetalleVenta', {
    venta_id: { type: DataTypes.INTEGER, allowNull: false },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    descuento: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { tableName: 'detalle_ventas', timestamps: true, underscored: true, updatedAt: false });

module.exports = DetalleVenta;
