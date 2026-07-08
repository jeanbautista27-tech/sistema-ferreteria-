const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const DetalleCotizacion = sequelize.define('DetalleCotizacion', {
    cotizacion_id: { type: DataTypes.INTEGER, allowNull: false },
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    precio_unitario: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    descuento: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    subtotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false }
}, { tableName: 'detalle_cotizaciones', timestamps: true, underscored: true, updatedAt: false });

module.exports = DetalleCotizacion;
