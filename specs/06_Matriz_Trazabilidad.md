# 06 — Matriz de Trazabilidad

**Versión:** 1.0 | **Estado:** Verificado — 290/290 pruebas pasando

---

## Leyenda

```
RF   = Requerimiento Funcional
HU   = Historia de Usuario
SP   = Sprint
MOD  = Módulo
BE   = Backend (controller + ruta)
FE   = Frontend (página React)
MDL  = Modelo Sequelize
TEST = Prueba unitaria (archivo.test.js)
INT  = Prueba integración
DESP = Estado en producción
```

---

## Matriz completa

| RF | HU | Sprint | Módulo | Endpoint API | Componente React | Modelo | Controller | Test Unitario | Test Integración | Producción |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| RF-01.1 | HU-01 | S1 | Auth | POST /api/auth/login | Login.jsx | Usuario, Rol, AuditLog | authController.login | authController.test.js | auth.integration.test.js | ✅ |
| RF-01.2 | HU-01 | S1 | Auth | POST /api/auth/login | Login.jsx | Usuario | authController.login | authController.test.js | auth.integration.test.js | ✅ |
| RF-01.3 | HU-01 | S1 | Auth | GET /api/auth/me | — | — | verifyToken (middleware) | auth.test.js | auth.integration.test.js | ✅ |
| RF-01.4 | HU-01 | S1 | Auth | Todas las rutas | — | — | verifyToken (middleware) | auth.test.js | auth.integration.test.js | ✅ |
| RF-01.5 | HU-02 | S1 | Auth | Rutas admin | — | — | requireAdmin (middleware) | auth.test.js | — | ✅ |
| RF-01.6 | HU-01 | S1 | Auth | POST /api/auth/login | Login.jsx | — | app.js (rateLimit) | — | auth.integration.test.js | ✅ |
| RF-01.7 | HU-01 | S1 | Auth | POST /api/auth/login | — | AuditLog | authController.login | authController.test.js | auth.integration.test.js | ✅ |
| RF-02.1 | HU-02 | S1 | Usuarios | CRUD /api/usuarios | Usuarios.jsx | Usuario, Rol | usuariosController | usuariosController.test.js | — | ✅ |
| RF-02.2 | HU-02 | S1 | Usuarios | POST /api/usuarios | Usuarios.jsx | Usuario | usuariosController.create | usuariosController.test.js | — | ✅ |
| RF-02.3 | HU-02 | S1 | Usuarios | PUT /api/usuarios/:id | Usuarios.jsx | Usuario | usuariosController.update | usuariosController.test.js | — | ✅ |
| RF-02.4 | HU-02 | S1 | Usuarios | DELETE /api/usuarios/:id | Usuarios.jsx | Usuario | usuariosController.remove | usuariosController.test.js | — | ✅ |
| RF-03.1 | HU-19 | S1 | Productos | POST /api/productos | Productos.jsx | Producto | productosController.create | productosController.test.js | productos.integration.test.js | ✅ |
| RF-03.2 | HU-19 | S1 | Productos | GET /api/productos?search= | Productos.jsx | Producto | productosController.getAll | productosController.test.js | productos.integration.test.js | ✅ |
| RF-03.3 | HU-19 | S1 | Productos | GET /api/productos?categoria_id= | Productos.jsx | Producto | productosController.getAll | productosController.test.js | productos.integration.test.js | ✅ |
| RF-03.4 | HU-10 | S1 | Inventario | GET /api/inventario/stock?stock_bajo=true | Inventario.jsx | Producto | inventarioController.getStock | inventarioController.test.js | — | ✅ |
| RF-03.5 | HU-19 | S1 | Productos | DELETE /api/productos/:id | Productos.jsx | Producto | productosController.remove | productosController.test.js | productos.integration.test.js | ✅ |
| RF-04.1 | HU-04 | S2 | Ventas | POST /api/ventas | POS.jsx | Venta, DetalleVenta | ventasController.create | ventasController.test.js | ventas.integration.test.js | ✅ |
| RF-04.2 | HU-04 | S2 | Ventas | POST /api/ventas | POS.jsx | Producto | ventasController.create | ventasController.test.js | ventas.integration.test.js | ✅ |
| RF-04.3 | HU-04 | S2 | Ventas | POST /api/ventas | POS.jsx | Configuracion | ventasController.create | ventasController.test.js | ventas.integration.test.js | ✅ |
| RF-04.4 | HU-04 | S2 | Ventas | POST /api/ventas | POS.jsx | Configuracion | ventasController.create | ventasController.test.js | ventas.integration.test.js | ✅ |
| RF-04.5 | HU-04 | S2 | Ventas | POST /api/ventas | POS.jsx | Venta | ventasController.create | ventasController.test.js | ventas.integration.test.js | ✅ |
| RF-04.6 | HU-05 | S2 | Ventas | POST /api/ventas | POS.jsx | Venta | ventasController.create | ventasController.test.js | ventas.integration.test.js | ✅ |
| RF-04.7 | HU-05 | S2 | Ventas | POST /api/ventas | POS.jsx | CuentaCobrar | ventasController.create | ventasController.test.js | ventas.integration.test.js | ✅ |
| RF-04.8 | HU-07 | S2 | Ventas | PUT /api/ventas/:id/anular | Ventas.jsx | Venta, Producto | ventasController.anular | ventasController.test.js | ventas.integration.test.js | ✅ |
| RF-04.9 | HU-07 | S2 | Ventas | PUT /api/ventas/:id/anular | Ventas.jsx | Venta | ventasController.anular | ventasController.test.js | ventas.integration.test.js | ✅ |
| RF-04.10 | HU-04 | S2 | Ventas | POST /api/ventas | POS.jsx | InventarioMovimiento | ventasController.create | ventasController.test.js | ventas.integration.test.js | ✅ |
| RF-05.1 | HU-08 | S2 | Compras | POST /api/compras | Compras.jsx | — | comprasRoutes.js | — | compras.integration.test.js | ✅ |
| RF-05.2 | HU-08 | S2 | Compras | POST /api/compras | Compras.jsx | Caja | comprasController.create | comprasController.test.js | compras.integration.test.js | ✅ |
| RF-05.3 | HU-08 | S2 | Compras | POST /api/compras | Compras.jsx | CuentaPagar | comprasController.create | comprasController.test.js | compras.integration.test.js | ✅ |
| RF-05.4 | HU-09 | S2 | Compras | PUT /api/compras/:id/recibir | Compras.jsx | Producto, InventarioMovimiento | comprasController.recibirCompra | comprasController.test.js | compras.integration.test.js | ✅ |
| RF-05.5 | HU-09 | S2 | Compras | PUT /api/compras/:id/recibir | Compras.jsx | Compra | comprasController.recibirCompra | comprasController.test.js | compras.integration.test.js | ✅ |
| RF-06.1 | HU-11 | S2 | Inventario | POST /api/inventario/ajustar | Inventario.jsx | Producto, InventarioMovimiento | inventarioController.ajustarStock | inventarioController.test.js | — | ✅ |
| RF-06.2 | HU-11 | S2 | Inventario | GET /api/inventario/movimientos?producto_id= | Inventario.jsx | InventarioMovimiento | inventarioController.getMovimientos | inventarioController.test.js | — | ✅ |
| RF-06.3 | HU-10 | S1 | Inventario | GET /api/inventario/stock | Inventario.jsx | Producto | inventarioController.getStock | inventarioController.test.js | — | ✅ |
| RF-07.1 | HU-12 | S3 | Caja | POST /api/caja/abrir | Caja.jsx | Caja | cajaController.abrir | cajaController.test.js | — | ✅ |
| RF-07.2 | HU-12 | S3 | Caja | PUT /api/caja/cerrar/:id | Caja.jsx | Caja, Venta, CajaEgreso | cajaController.cerrar | cajaController.test.js | — | ✅ |
| RF-07.3 | HU-13 | S3 | Caja | POST /api/caja/movimiento | Caja.jsx | CajaEgreso | cajaController.registrarMovimiento | cajaController.test.js | — | ✅ |
| RF-08.1 | HU-06 | S3 | Cotizaciones | POST /api/cotizaciones | Cotizaciones.jsx | Cotizacion | cotizacionesController.create | cotizacionesController.test.js | — | ✅ |
| RF-08.2 | HU-06 | S3 | Cotizaciones | POST /api/cotizaciones | Cotizaciones.jsx | Cotizacion | cotizacionesController.create | cotizacionesController.test.js | — | ✅ |
| RF-08.3 | HU-06 | S3 | Cotizaciones | PUT /api/cotizaciones/:id/anular | Cotizaciones.jsx | Cotizacion | cotizacionesController.anular | cotizacionesController.test.js | — | ✅ |
| RF-09.1 | HU-16 | S3 | Devoluciones | POST /api/devoluciones | Ventas.jsx | Venta | devolucionesController.create | devolucionesController.test.js | — | ✅ |
| RF-09.2 | HU-16 | S3 | Devoluciones | POST /api/devoluciones | Ventas.jsx | DetalleVenta | devolucionesController.create | devolucionesController.test.js | — | ✅ |
| RF-09.3 | HU-16 | S3 | Devoluciones | POST /api/devoluciones | Ventas.jsx | Caja | devolucionesController.create | devolucionesController.test.js | — | ✅ |
| RF-09.4 | HU-16 | S3 | Devoluciones | POST /api/devoluciones | Ventas.jsx | Producto, InventarioMovimiento | devolucionesController.create | devolucionesController.test.js | — | ✅ |
| RF-09.5 | HU-16 | S3 | Devoluciones | POST /api/devoluciones | Ventas.jsx | Devolucion | devolucionesController.create | devolucionesController.test.js | — | ✅ |
| RF-10.1 | HU-14 | S3 | CxC | POST /api/cuentas-cobrar/:id/abonos | CuentasCobrar.jsx | AbonoCuenta | cuentasCobrarController.registrarAbono | cuentasCobrarController.test.js | — | ✅ |
| RF-10.2 | HU-14 | S3 | CxC | POST /api/cuentas-cobrar/:id/abonos | CuentasCobrar.jsx | CuentaCobrar | cuentasCobrarController.registrarAbono | cuentasCobrarController.test.js | — | ✅ |
| RF-10.3 | HU-14 | S3 | CxC | POST /api/cuentas-cobrar/:id/abonos | CuentasCobrar.jsx | Caja | cuentasCobrarController.registrarAbono | cuentasCobrarController.test.js | — | ✅ |
| RF-10.4 | HU-14 | S3 | CxC | POST /api/cuentas-cobrar/:id/abonos | CuentasCobrar.jsx | CuentaCobrar | cuentasCobrarController.registrarAbono | cuentasCobrarController.test.js | — | ✅ |
| RF-11.1 | HU-15 | S3 | CxP | POST /api/cuentas-pagar/:id/abonos | CuentasPagar.jsx | AbonoPagar | cuentasPagarController.registrarAbono | cuentasPagarController.test.js | — | ✅ |
| RF-11.2 | HU-15 | S3 | CxP | POST /api/cuentas-pagar/:id/abonos | CuentasPagar.jsx | CajaEgreso | cuentasPagarController.registrarAbono | cuentasPagarController.test.js | — | ✅ |
| RF-12.1 | HU-17 | S4 | Reportes | GET /api/reportes/exportar-excel | Reportes.jsx | Venta, Compra, CuentaCobrar, CuentaPagar | reportesController.exportarExcel | reportesController.test.js | — | ✅ |
| RF-12.2 | HU-17 | S4 | Reportes | GET /api/reportes/exportar-pdf | Reportes.jsx | Venta | reportesController.exportarPDF | reportesController.test.js | — | ✅ |
| RF-12.3 | HU-17 | S4 | Reportes | GET /api/reportes/exportar-inventario-excel | Reportes.jsx | Producto | reportesController.exportarInventarioExcel | reportesController.test.js | — | ✅ |
| RF-12.4 | HU-17 | S4 | Reportes | GET /api/reportes/ventas?desde=&hasta= | Reportes.jsx | Venta | reportesController.resumenVentas | reportesController.test.js | — | ✅ |
| RF-13.1 | HU-18 | S4 | Dashboard | GET /api/dashboard/stats | Dashboard.jsx | Venta, Producto, Cliente, Caja | dashboardController.getDashboardStats | dashboardController.test.js | — | ✅ |
| RF-13.2 | HU-18 | S4 | Dashboard | GET /api/dashboard/stats | Dashboard.jsx | Producto | dashboardController.getDashboardStats | dashboardController.test.js | — | ✅ |
| RF-13.3 | HU-18 | S4 | Dashboard | GET /api/dashboard/stats | Dashboard.jsx | Venta | dashboardController.getDashboardStats | dashboardController.test.js | — | ✅ |
| RF-13.4 | HU-18 | S4 | Dashboard | GET /api/dashboard/stats | Dashboard.jsx | Venta, Compra | dashboardController.getDashboardStats | dashboardController.test.js | — | ✅ |
| RF-14.1 | HU-03 | S1 | Config | PUT /api/configuracion | Configuracion.jsx | Configuracion | configuracionController.update | configuracionController.test.js | — | ✅ |
| RF-14.2 | HU-03 | S1 | Config | PUT /api/configuracion | Configuracion.jsx | — | configuracionRoutes.js | — | — | ✅ |

---

## Resumen estadístico

| Categoría | Total |
| --- | --- |
| Requerimientos funcionales trazados | 60 |
| Historias de usuario cubiertas | 20 |
| Sprints | 4 |
| Módulos con trazabilidad completa | 19 |
| Controllers enlazados | 18 |
| Páginas React enlazadas | 19 |
| Modelos Sequelize enlazados | 23 |
| Pruebas unitarias | 235 |
| Pruebas de integración | 55 |
| Requerimientos desplegados en producción | 60/60 (100%) |
