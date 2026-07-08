const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const CajaEgreso = sequelize.define('CajaEgreso', {
    caja_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    concepto: { type: DataTypes.STRING(255), allowNull: false },
    monto: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    tipo: { type: DataTypes.ENUM('Egreso', 'Ingreso'), defaultValue: 'Egreso' }
}, { tableName: 'caja_egresos', timestamps: true, underscored: true, updatedAt: false });

module.exports = CajaEgreso;
