# 03 — Historias de Usuario

**Versión:** 1.0 | **Estado:** Verificado en producción

---

## Formato

```
Como [rol], quiero [funcionalidad], para [objetivo de negocio].
```

---

| ID | Rol | Historia | Criterios de aceptación clave | Story Points | Estado |
| --- | --- | --- | --- | --- | --- |
| HU-01 | Administrador | Como administrador, quiero iniciar sesión con email y contraseña para acceder al sistema de forma segura. | Login exitoso → JWT. Credenciales incorrectas → 401. 10+ intentos → 429. | 2 | ✅ Prod |
| HU-02 | Administrador | Como administrador, quiero crear y gestionar usuarios con diferentes roles para controlar el acceso. | Crear con nombre/email/contraseña/rol. Email único. Soft delete. | 3 | ✅ Prod |
| HU-03 | Administrador | Como administrador, quiero configurar los datos de la empresa, IGV y series de comprobantes. | Cambios persisten. Se reflejan en comprobantes y cálculos. | 2 | ✅ Prod |
| HU-04 | Cajero | Como cajero, quiero registrar una venta desde el POS seleccionando productos del catálogo. | Agregar por clic o barras. Calcular subtotal/IGV/total. Descontar stock. | 8 | ✅ Prod |
| HU-05 | Cajero | Como cajero, quiero registrar ventas al crédito indicando el cliente para generar la CxC. | Requiere cliente. Crea CxC con plazo 30 días. | 5 | ✅ Prod |
| HU-06 | Cajero | Como cajero, quiero generar proformas sin registrar la venta para que el cliente evalúe. | Número PROF-XXXXXX. Detalle de precios e IGV. Imprimible. | 3 | ✅ Prod |
| HU-07 | Cajero | Como cajero, quiero anular una venta por error para que el stock se revierta. | Stock restaurado. No anular ya anulada → 400. | 3 | ✅ Prod |
| HU-08 | Administrador | Como administrador, quiero registrar órdenes de compra a proveedores para gestionar reabastecimiento. | Proveedor + ítems + tipo pago. Crédito → CxP. Contado → egreso caja. | 8 | ✅ Prod |
| HU-09 | Almacenero | Como almacenero, quiero marcar una compra como recibida para actualizar el stock. | Stock aumenta. Movimiento inventario registrado. | 5 | ✅ Prod |
| HU-10 | Almacenero | Como almacenero, quiero consultar el inventario con alertas de stock bajo. | Filtro stock bajo muestra `stock ≤ stock_minimo`. | 3 | ✅ Prod |
| HU-11 | Almacenero | Como almacenero, quiero ajustar el stock manualmente con registro del motivo. | Stock actualizado. Movimiento tipo `Ajuste` creado. | 3 | ✅ Prod |
| HU-12 | Cajero | Como cajero, quiero abrir y cerrar la caja diaria para controlar el efectivo del turno. | Monto inicial. Solo una caja abierta. Cierre calcula monto final. | 5 | ✅ Prod |
| HU-13 | Cajero | Como cajero, quiero registrar egresos de caja durante el turno para documentar gastos. | Egreso creado en `caja_egresos`. | 2 | ✅ Prod |
| HU-14 | Administrador | Como administrador, quiero registrar abonos de clientes a sus cuentas pendientes. | Abono ≤ saldo. Al saldar → Pagado. Ingreso en caja. | 5 | ✅ Prod |
| HU-15 | Administrador | Como administrador, quiero registrar pagos a proveedores contra las CxP. | Pago = egreso en caja. Saldo reducido. Al saldar → Pagado. | 5 | ✅ Prod |
| HU-16 | Cajero | Como cajero, quiero registrar devoluciones de ventas para reintegrar stock y emitir nota de crédito. | Solo ventas Completadas. Cantidad ≤ vendida. Stock reintegrado. NC001-XXXXXX. | 8 | ✅ Prod |
| HU-17 | Administrador | Como administrador, quiero exportar reportes en Excel y PDF para analizar el desempeño financiero. | Archivos descargables. Excel 4 hojas. PDF con datos del período. | 5 | ✅ Prod |
| HU-18 | Administrador | Como administrador, quiero ver el dashboard con KPIs del negocio en tiempo real. | KPIs día, stock crítico, tendencia 7 días, comparativa ventas/compras. | 5 | ✅ Prod |
| HU-19 | Administrador | Como administrador, quiero gestionar el catálogo de productos con filtros por nombre y categoría. | Crear/editar/eliminar (soft). Filtrar por nombre y categoría. | 5 | ✅ Prod |
| HU-20 | Administrador | Como administrador, quiero ver el historial de acciones del sistema para auditoría. | Logs con usuario, acción, IP, fecha. | 2 | ✅ Prod |
| HU-21 | Todos los roles | Como usuario del sistema, quiero que el menú lateral tenga fondo negro para mayor contraste y legibilidad. | El sidebar muestra fondo negro en todas las vistas y dispositivos. | 1 | ✅ Prod |
