const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DetalleCompra = sequelize.define('DetalleCompra', {
    compra_id: { type: DataTypes.INTEGER, allowNull: false },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { tableName: 'detalle_compras', timestamps: true, underscored: true, updatedAt: false });

module.exports = DetalleCompra;
