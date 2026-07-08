const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
    usuario_id: { type: DataTypes.INTEGER },
    accion: { type: DataTypes.STRING(100), allowNull: false },
    tabla_afectada: { type: DataTypes.STRING(100) },
    registro_id: { type: DataTypes.INTEGER },
    datos_anteriores: { type: DataTypes.JSON },
    datos_nuevos: { type: DataTypes.JSON },
    ip: { type: DataTypes.STRING(50) }
}, { tableName: 'audit_logs', timestamps: true, underscored: true, updatedAt: false });

module.exports = AuditLog;
