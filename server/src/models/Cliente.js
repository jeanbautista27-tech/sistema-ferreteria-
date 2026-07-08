const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Cliente = sequelize.define('Cliente', {
    nombre: { type: DataTypes.STRING(200), allowNull: false },
    tipo_documento: { type: DataTypes.ENUM('DNI', 'RUC', 'CE'), defaultValue: 'DNI' },
    numero_documento: { type: DataTypes.STRING(20) },
    telefono: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING(150) },
    direccion: { type: DataTypes.STRING(255) },
    tipo_cliente: { type: DataTypes.ENUM('Regular', 'Mayorista', 'VIP'), defaultValue: 'Regular' },
    activo: { type: DataTypes.TINYINT(1), defaultValue: 1 }
}, { tableName: 'clientes', timestamps: true, underscored: true });

module.exports = Cliente;
