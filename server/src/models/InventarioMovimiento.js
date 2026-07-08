const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const InventarioMovimiento = sequelize.define('InventarioMovimiento', {
    producto_id: { type: DataTypes.INTEGER, allowNull: false },
    usuario_id: { type: DataTypes.INTEGER, allowNull: false },
    tipo: { type: DataTypes.ENUM('Entrada', 'Salida', 'Ajuste', 'Venta', 'Compra'), allowNull: false },
    cantidad: { type: DataTypes.INTEGER, allowNull: false },
    stock_antes: { type: DataTypes.INTEGER },
    stock_despues: { type: DataTypes.INTEGER },
    motivo: { type: DataTypes.STRING(255) },
    referencia_id: { type: DataTypes.INTEGER },
    referencia_tipo: { type: DataTypes.STRING(50) }
}, { tableName: 'inventario_movimientos', timestamps: true, underscored: true, updatedAt: false });

module.exports = InventarioMovimiento;
