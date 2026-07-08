const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Configuracion = sequelize.define('Configuracion', {
    clave: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    valor: { type: DataTypes.TEXT },
    descripcion: { type: DataTypes.STRING(255) }
}, { tableName: 'configuracion', timestamps: false, underscored: true });

module.exports = Configuracion;
