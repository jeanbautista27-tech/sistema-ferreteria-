const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Usuario = sequelize.define('Usuario', {
    nombre: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING(255), allowNull: false },
    rol_id: { type: DataTypes.INTEGER, allowNull: false },
    activo: { type: DataTypes.TINYINT(1), defaultValue: 1 },
    ultimo_login: { type: DataTypes.DATE }
}, { tableName: 'usuarios', timestamps: true, underscored: true });

module.exports = Usuario;
