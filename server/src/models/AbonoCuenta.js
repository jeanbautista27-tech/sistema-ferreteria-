const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AbonoCuenta = sequelize.define('AbonoCuenta', {
    cuenta_cobrar_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false }, // Cajero que recibió
    caja_id: { type: DataTypes.INTEGER, allowNull: false },    // Caja destino del dinero
    monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    metodo_pago: { type: DataTypes.STRING(30), defaultValue: 'Efectivo' },
    referencia: { type: DataTypes.STRING(100), allowNull: true } // Opcional, nro de transferencia, etc.
}, { tableName: 'abonos_cuenta', timestamps: true, underscored: true, updatedAt: false });

module.exports = AbonoCuenta;
