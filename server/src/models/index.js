const Rol = require('./Rol');
const Usuario = require('./Usuario');
const Categoria = require('./Categoria');
const Proveedor = require('./Proveedor');
const Producto = require('./Producto');
const Cliente = require('./Cliente');
const Venta = require('./Venta');
const DetalleVenta = require('./DetalleVenta');
const Compra = require('./Compra');
const DetalleCompra = require('./DetalleCompra');
const Caja = require('./Caja');
const CajaEgreso = require('./CajaEgreso');
const InventarioMovimiento = require('./InventarioMovimiento');
const Configuracion = require('./Configuracion');
const AuditLog = require('./AuditLog');
const Devolucion = require('./Devolucion');
const DetalleDevolucion = require('./DetalleDevolucion');
const Cotizacion = require('./Cotizacion');
const DetalleCotizacion = require('./DetalleCotizacion');
const CuentaCobrar = require('./CuentaCobrar');
const AbonoCuenta = require('./AbonoCuenta');
const CuentaPagar = require('./CuentaPagar');
const AbonoPagar = require('./AbonoPagar');

// Usuario <-> Rol
Usuario.belongsTo(Rol, { foreignKey: 'rol_id', as: 'rol' });
Rol.hasMany(Usuario, { foreignKey: 'rol_id' });

// Producto <-> Categoria
Producto.belongsTo(Categoria, { foreignKey: 'categoria_id', as: 'categoria' });
Categoria.hasMany(Producto, { foreignKey: 'categoria_id' });

// Producto <-> Proveedor
Producto.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
Proveedor.hasMany(Producto, { foreignKey: 'proveedor_id' });

// Venta <-> Cliente
Venta.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Cliente.hasMany(Venta, { foreignKey: 'cliente_id' });

// Venta <-> Usuario
Venta.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(Venta, { foreignKey: 'usuario_id' });

// DetalleVenta <-> Venta
DetalleVenta.belongsTo(Venta, { foreignKey: 'venta_id' });
Venta.hasMany(DetalleVenta, { foreignKey: 'venta_id', as: 'detalles' });

// DetalleVenta <-> Producto
DetalleVenta.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Producto.hasMany(DetalleVenta, { foreignKey: 'producto_id' });

// Compra <-> Proveedor
Compra.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
Proveedor.hasMany(Compra, { foreignKey: 'proveedor_id' });

// Compra <-> Usuario
Compra.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(Compra, { foreignKey: 'usuario_id' });

// DetalleCompra <-> Compra
DetalleCompra.belongsTo(Compra, { foreignKey: 'compra_id' });
Compra.hasMany(DetalleCompra, { foreignKey: 'compra_id', as: 'detalles' });

// DetalleCompra <-> Producto
DetalleCompra.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Producto.hasMany(DetalleCompra, { foreignKey: 'producto_id' });

// Caja <-> Usuario
Caja.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(Caja, { foreignKey: 'usuario_id' });

// CajaEgreso <-> Caja
CajaEgreso.belongsTo(Caja, { foreignKey: 'caja_id' });
Caja.hasMany(CajaEgreso, { foreignKey: 'caja_id', as: 'movimientos' });

// CajaEgreso <-> Usuario
CajaEgreso.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// InventarioMovimiento
InventarioMovimiento.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
InventarioMovimiento.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// AuditLog
AuditLog.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

// Devolucion <-> Venta
Devolucion.belongsTo(Venta, { foreignKey: 'venta_id', as: 'venta' });
Venta.hasMany(Devolucion, { foreignKey: 'venta_id', as: 'devoluciones' });

// Devolucion <-> Usuario
Devolucion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(Devolucion, { foreignKey: 'usuario_id' });

// DetalleDevolucion <-> Devolucion
DetalleDevolucion.belongsTo(Devolucion, { foreignKey: 'devolucion_id' });
Devolucion.hasMany(DetalleDevolucion, { foreignKey: 'devolucion_id', as: 'detalles' });

// DetalleDevolucion <-> Producto
DetalleDevolucion.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Producto.hasMany(DetalleDevolucion, { foreignKey: 'producto_id' });

// Cotizacion <-> Cliente
Cotizacion.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Cliente.hasMany(Cotizacion, { foreignKey: 'cliente_id' });

// Cotizacion <-> Usuario
Cotizacion.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(Cotizacion, { foreignKey: 'usuario_id' });

// DetalleCotizacion <-> Cotizacion
DetalleCotizacion.belongsTo(Cotizacion, { foreignKey: 'cotizacion_id' });
Cotizacion.hasMany(DetalleCotizacion, { foreignKey: 'cotizacion_id', as: 'detalles' });

// DetalleCotizacion <-> Producto
DetalleCotizacion.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });
Producto.hasMany(DetalleCotizacion, { foreignKey: 'producto_id' });

// Cuentas por Cobrar
CuentaCobrar.belongsTo(Venta, { foreignKey: 'venta_id', as: 'venta' });
Venta.hasOne(CuentaCobrar, { foreignKey: 'venta_id', as: 'cuenta_cobrar' });

CuentaCobrar.belongsTo(Cliente, { foreignKey: 'cliente_id', as: 'cliente' });
Cliente.hasMany(CuentaCobrar, { foreignKey: 'cliente_id' });

AbonoCuenta.belongsTo(CuentaCobrar, { foreignKey: 'cuenta_cobrar_id', as: 'cuenta_cobrar' });
CuentaCobrar.hasMany(AbonoCuenta, { foreignKey: 'cuenta_cobrar_id', as: 'abonos' });

AbonoCuenta.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'cajero' });
AbonoCuenta.belongsTo(Caja, { foreignKey: 'caja_id', as: 'caja' });

// Cuentas por Pagar (Compras a Crédito)
CuentaPagar.belongsTo(Compra, { foreignKey: 'compra_id', as: 'compra' });
Compra.hasOne(CuentaPagar, { foreignKey: 'compra_id', as: 'cuenta_pagar' });

CuentaPagar.belongsTo(Proveedor, { foreignKey: 'proveedor_id', as: 'proveedor' });
Proveedor.hasMany(CuentaPagar, { foreignKey: 'proveedor_id' });

AbonoPagar.belongsTo(CuentaPagar, { foreignKey: 'cuenta_pagar_id', as: 'cuenta_pagar' });
CuentaPagar.hasMany(AbonoPagar, { foreignKey: 'cuenta_pagar_id', as: 'abonos' });

AbonoPagar.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' }); // Quien registra el abono
AbonoPagar.belongsTo(Caja, { foreignKey: 'caja_id', as: 'caja' });

module.exports = {
    Rol, Usuario, Categoria, Proveedor, Producto, Cliente,
    Venta, DetalleVenta, Compra, DetalleCompra,
    Caja, CajaEgreso, InventarioMovimiento, Configuracion, AuditLog,
    Devolucion, DetalleDevolucion, Cotizacion, DetalleCotizacion,
    CuentaCobrar, AbonoCuenta, CuentaPagar, AbonoPagar
};
