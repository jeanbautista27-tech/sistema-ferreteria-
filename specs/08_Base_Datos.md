# 08 — Base de Datos

**Versión:** 1.0 | **Motor:** MySQL 8 | **ORM:** Sequelize 6.37.1

---

## Configuración de conexión

```js
// server/src/config/db.js
host:    process.env.DB_HOST
port:    parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306')
dialect: 'mysql'
logging: false
timezone: '-05:00'
pool:    { max: 10, min: 0, acquire: 30000, idle: 10000 }
ssl:     process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
```

---

## Convenciones de modelos

- `underscored: true` — columnas `snake_case` en BD, serialización `camelCase` en JSON
- `timestamps: true` — `created_at` / `updated_at` en todas las tablas
- Soft delete — campo `activo TINYINT(1) DEFAULT 1` en entidades maestras
- Claves foráneas en todos los modelos
- `tableName` explícito en cada modelo para evitar inferencia incorrecta

---

## Inventario de modelos (23)

### Dominio: Seguridad

**Rol** — `roles`
- `id` PK AUTO_INCREMENT
- `nombre` VARCHAR(50) UNIQUE NOT NULL
- `descripcion` VARCHAR(200)

**Usuario** — `usuarios`
- `id` PK · `nombre` NOT NULL · `email` UNIQUE NOT NULL
- `password_hash` NOT NULL · `rol_id` FK→roles NOT NULL
- `activo` DEFAULT 1 · `ultimo_login` DATETIME

**AuditLog** — `audit_logs`
- `id` PK · `usuario_id` FK→usuarios
- `accion` NOT NULL · `tabla_afectada` · `registro_id`
- `datos_anteriores` JSON · `datos_nuevos` JSON · `ip`

---

### Dominio: Catálogo

**Categoria** — `categorias`
- `id` PK · `nombre` NOT NULL · `descripcion` · `activo` DEFAULT 1

**Proveedor** — `proveedores`
- `id` PK · `empresa` NOT NULL · `ruc` · `contacto` · `telefono` · `email` · `direccion` · `activo` DEFAULT 1

**Producto** — `productos`
- `id` PK · `codigo` UNIQUE · `nombre` NOT NULL
- `categoria_id` FK→categorias · `proveedor_id` FK→proveedores
- `precio_compra` DECIMAL(10,2) · `precio_venta` NOT NULL DECIMAL(10,2)
- `stock` INT DEFAULT 0 · `stock_minimo` INT DEFAULT 5
- `unidad` VARCHAR(30) DEFAULT 'und' · `imagen` · `activo` DEFAULT 1

**Cliente** — `clientes`
- `id` PK · `nombre` NOT NULL · `tipo_documento` ENUM(DNI,RUC,CE)
- `numero_documento` · `telefono` · `email` · `direccion`
- `tipo_cliente` ENUM(Regular,Mayorista,VIP) · `activo` DEFAULT 1

---

### Dominio: Ventas

**Venta** — `ventas`
- `id` PK · `numero_comprobante` UNIQUE
- `tipo_comprobante` ENUM(Boleta,Factura,Ticket) · `cliente_id` FK
- `usuario_id` FK NOT NULL · `subtotal` · `igv` · `total` · `descuento`
- `tipo_pago` ENUM(Efectivo,Tarjeta,Yape,Plin,Credito)
- `monto_recibido` · `vuelto`
- `estado` ENUM(Completada,Anulada,Pendiente) DEFAULT 'Completada'

**DetalleVenta** — `detalle_ventas`
- `id` PK · `venta_id` FK NOT NULL · `producto_id` FK NOT NULL
- `cantidad` NOT NULL · `precio_unitario` NOT NULL · `descuento` · `subtotal`

---

### Dominio: Compras

**Compra** — `compras`
- `id` PK · `numero_orden` UNIQUE · `proveedor_id` FK NOT NULL
- `usuario_id` FK NOT NULL · `subtotal` · `igv` · `total`
- `estado` ENUM(Pendiente,Recibida,Parcial,Anulada)
- `tipo_pago` VARCHAR(30) · `fecha_esperada` DATE

**DetalleCompra** — `detalle_compras`
- `id` PK · `compra_id` FK · `producto_id` FK
- `cantidad` · `precio_unitario` · `subtotal`

---

### Dominio: Cotizaciones y Devoluciones

**Cotizacion** — `cotizaciones`
- `id` PK · `numero_comprobante` UNIQUE · `cliente_id` FK · `usuario_id` FK
- `subtotal` · `igv` · `total` · `descuento` · `validez_dias` DEFAULT 15
- `estado` ENUM(Pendiente,Aceptada,Anulada,Vencida)

**DetalleCotizacion** — `detalle_cotizaciones`
- `id` PK · `cotizacion_id` FK · `producto_id` FK
- `cantidad` · `precio_unitario` · `descuento` · `subtotal`

**Devolucion** — `devoluciones`
- `id` PK · `venta_id` FK NOT NULL · `usuario_id` FK NOT NULL
- `numero_comprobante` UNIQUE · `motivo` NOT NULL
- `total_reembolso` · `tipo_reembolso` ENUM(Efectivo,'Nota Credito')
- `estado` ENUM(Completada,Anulada)

**DetalleDevolucion** — `detalle_devoluciones`
- `id` PK · `devolucion_id` FK · `producto_id` FK
- `cantidad` · `precio_unitario` · `subtotal`

---

### Dominio: Inventario y Caja

**InventarioMovimiento** — `inventario_movimientos`
- `id` PK · `producto_id` FK NOT NULL · `usuario_id` FK NOT NULL
- `tipo` ENUM(Entrada,Salida,Ajuste,Venta,Compra) NOT NULL
- `cantidad` · `stock_antes` · `stock_despues` · `motivo`
- `referencia_id` · `referencia_tipo`

**Caja** — `caja`
- `id` PK · `usuario_id` FK NOT NULL · `monto_inicial` · `monto_final`
- `total_ventas` · `total_egresos`
- `estado` ENUM(Abierta,Cerrada) · `observaciones`
- `fecha_apertura` DATETIME · `fecha_cierre` DATETIME

**CajaEgreso** — `caja_egresos`
- `id` PK · `caja_id` FK NOT NULL · `usuario_id` FK NOT NULL
- `concepto` NOT NULL · `monto` NOT NULL
- `tipo` ENUM(Egreso,Ingreso) DEFAULT 'Egreso'

---

### Dominio: Créditos

**CuentaCobrar** — `cuentas_cobrar`
- `id` PK · `venta_id` FK UNIQUE · `cliente_id` FK NOT NULL
- `monto_total` · `saldo_pagado` · `saldo_pendiente`
- `fecha_vencimiento` · `estado` ENUM(Pendiente,Pagado,Anulado)

**AbonoCuenta** — `abonos_cuenta`
- `id` PK · `cuenta_cobrar_id` FK · `usuario_id` FK · `caja_id` FK
- `monto` · `metodo_pago` · `referencia`

**CuentaPagar** — `cuentas_pagar`
- `id` PK · `compra_id` FK UNIQUE · `proveedor_id` FK NOT NULL
- `monto_total` · `saldo_pagado` · `saldo_pendiente`
- `fecha_vencimiento` · `estado` ENUM(Pendiente,Pagado,Anulado)

**AbonoPagar** — `abonos_pagar`
- `id` PK · `cuenta_pagar_id` FK · `usuario_id` FK · `caja_id` FK
- `monto` · `metodo_pago` · `referencia`

---

### Dominio: Sistema

**Configuracion** — `configuracion`
- `id` PK · `clave` VARCHAR(100) UNIQUE NOT NULL · `valor` TEXT

---

## Relaciones principales

```
roles          1:N  usuarios
usuarios       1:N  ventas, compras, cotizaciones, devoluciones, caja
categorias     1:N  productos
proveedores    1:N  productos, compras
clientes       1:N  ventas, cuentas_cobrar, cotizaciones
ventas         1:N  detalle_ventas, devoluciones
ventas         1:1  cuentas_cobrar
compras        1:N  detalle_compras
compras        1:1  cuentas_pagar
cuentas_cobrar 1:N  abonos_cuenta
cuentas_pagar  1:N  abonos_pagar
caja           1:N  caja_egresos
productos      1:N  inventario_movimientos
```
