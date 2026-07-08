const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Venta = sequelize.define('Venta', {
    numero_comprobante: { type: DataTypes.STRING(30), unique: true },
    tipo_comprobante: { type: DataTypes.ENUM('Boleta', 'Factura', 'Ticket'), defaultValue: 'Boleta' },
    cliente_id: { type: DataTypes.INTEGER },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    subtotal: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    igv: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    total: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    descuento: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    tipo_pago: { type: DataTypes.ENUM('Efectivo', 'Tarjeta', 'Yape', 'Plin', 'Credito'), defaultValue: 'Efectivo' },
    monto_recibido: { type: DataTypes.DECIMAL(10, 2) },
    vuelto: { type: DataTypes.DECIMAL(10, 2) },
    estado: { type: DataTypes.ENUM('Completada', 'Anulada', 'Pendiente'), defaultValue: 'Completada' },
    observaciones: { type: DataTypes.TEXT }
}, { tableName: 'ventas', timestamps: true, underscored: true });

module.exports = Venta;
