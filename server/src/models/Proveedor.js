const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Proveedor = sequelize.define('Proveedor', {
    empresa: { type: DataTypes.STRING(200), allowNull: false },
    ruc: { type: DataTypes.STRING(20) },
    contacto: { type: DataTypes.STRING(100) },
    telefono: { type: DataTypes.STRING(20) },
    email: { type: DataTypes.STRING(150) },
    direccion: { type: DataTypes.STRING(255) },
    activo: { type: DataTypes.TINYINT(1), defaultValue: 1 }
}, { tableName: 'proveedores', timestamps: true, underscored: true });

module.exports = Proveedor;
