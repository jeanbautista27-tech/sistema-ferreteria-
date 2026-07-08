const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Producto = sequelize.define('Producto', {
    codigo: { type: DataTypes.STRING(50), unique: true },
    nombre: { type: DataTypes.STRING(200), allowNull: false },
    descripcion: { type: DataTypes.TEXT },
    categoria_id: { type: DataTypes.INTEGER },
    proveedor_id: { type: DataTypes.INTEGER },
    precio_compra: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    precio_venta: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    stock: { type: DataTypes.INTEGER, defaultValue: 0 },
    stock_minimo: { type: DataTypes.INTEGER, defaultValue: 5 },
    unidad: { type: DataTypes.STRING(30), defaultValue: 'und' },
    imagen: { type: DataTypes.STRING(255) },
    activo: { type: DataTypes.TINYINT(1), defaultValue: 1 }
}, { tableName: 'productos', timestamps: true, underscored: true });

module.exports = Producto;
