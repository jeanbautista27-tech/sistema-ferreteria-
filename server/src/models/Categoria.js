const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Categoria = sequelize.define('Categoria', {
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    descripcion: { type: DataTypes.STRING(255) },
    activo: { type: DataTypes.TINYINT(1), defaultValue: 1 }
}, { tableName: 'categorias', timestamps: true, underscored: true });

module.exports = Categoria;
