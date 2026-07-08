const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Rol = sequelize.define('Rol', {
    nombre: { type: DataTypes.STRING(50), allowNull: false, unique: true },
    descripcion: { type: DataTypes.STRING(200) }
}, { tableName: 'roles', timestamps: true, underscored: true });

module.exports = Rol;
