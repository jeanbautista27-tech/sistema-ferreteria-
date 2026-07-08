const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AbonoPagar = sequelize.define('AbonoPagar', {
    cuenta_pagar_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false }, // Empleado que registró el egreso
    caja_id: { type: DataTypes.INTEGER, allowNull: false },    // Caja origen del dinero
    monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    metodo_pago: { type: DataTypes.STRING(30), defaultValue: 'Efectivo' },
    referencia: { type: DataTypes.STRING(100), allowNull: true } // Opcional, comprobante de pago
}, { tableName: 'abonos_pagar', timestamps: true, underscored: true, updatedAt: false });

module.exports = AbonoPagar;
