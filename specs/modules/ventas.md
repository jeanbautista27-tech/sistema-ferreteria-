# Especificación — Módulo: Ventas / POS

**Versión:** 1.0 | **Sprint:** 2 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Registrar el ciclo completo de ventas al por menor: desde la selección de productos en el POS hasta la generación del comprobante, el descuento de stock y la creación automática de cuentas por cobrar en ventas al crédito.

---

## Descripción funcional

El POS permite al cajero seleccionar productos del catálogo, calcular el total con IGV configurable, registrar el tipo de pago y emitir el comprobante. Para ventas al crédito es obligatorio indicar el cliente. La anulación revierte el stock automáticamente mediante una transacción atómica.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-04.1 | Registro de venta con múltiples ítems | `ventasController.create` |
| RF-04.2 | Verificar stock suficiente por ítem | `if (producto.stock < item.cantidad) throw` |
| RF-04.3 | Número de comprobante autogenerado serie+correlativo | `${serie}-${num.padStart(8,'0')}` |
| RF-04.4 | IGV configurable desde tabla `configuracion` | `Configuracion.findOne({ clave: 'igv_porcentaje' })` |
| RF-04.5 | 5 tipos de pago: Efectivo/Tarjeta/Yape/Plin/Crédito | ENUM en modelo Venta |
| RF-04.6 | Crédito requiere `cliente_id` no vacío | `if (tipo_pago==='Crédito' && !cliente_id) return 400` |
| RF-04.7 | Crédito genera CxC automáticamente | `CuentaCobrar.create(...)` |
| RF-04.8 | Anulación revierte stock | `prod.update({ stock: antes + cantidad })` |
| RF-04.9 | No anular una venta ya anulada | `if (venta.estado==='Anulada') return 400` |
| RF-04.10 | Movimiento inventario tipo `Venta` por cada ítem | `InventarioMovimiento.create({ tipo: 'Venta' })` |

---

## Historias de usuario relacionadas

- **HU-04:** Registrar venta desde el POS
- **HU-05:** Venta al crédito → CxC automática
- **HU-07:** Anulación de venta con reversión de stock

---

## Criterios de aceptación

```
CA-VENTA-01
DADO que el cajero envía ítems con stock suficiente
CUANDO hace POST /api/ventas
ENTONCES HTTP 201 + { ok: true, msg: 'Venta registrada exitosamente', venta }
  Y stock de cada producto disminuye en la cantidad vendida
  Y se crea movimiento inventario tipo 'Venta' por cada ítem
  Y correlativo se incrementa en 1

CA-VENTA-02
DADO que se envía items: []
CUANDO hace POST /api/ventas
ENTONCES HTTP 400 + { ok: false, msg: 'No hay productos en la venta' }

CA-VENTA-03
DADO tipo_pago='Crédito' y cliente_id vacío o ausente
CUANDO hace POST /api/ventas
ENTONCES HTTP 400 + { ok: false, msg: 'La venta al crédito requiere obligatoriamente un cliente registrado.' }

CA-VENTA-04
DADO que un producto tiene stock=0 y se solicita cantidad=5
CUANDO hace POST /api/ventas
ENTONCES HTTP 500 + rollback (ningún cambio persiste en BD)

CA-VENTA-05
DADO tipo_pago='Crédito' y cliente_id válido
CUANDO hace POST /api/ventas
ENTONCES se crea registro en cuentas_cobrar con saldo_pendiente = total y fecha_vencimiento = +30 días

CA-VENTA-06
DADO que la venta existe y estado='Completada'
CUANDO hace PUT /api/ventas/:id/anular
ENTONCES HTTP 200 + venta.estado = 'Anulada' + stock de productos revertido

CA-VENTA-07
DADO que la venta ya está en estado='Anulada'
CUANDO hace PUT /api/ventas/:id/anular
ENTONCES HTTP 400 + { ok: false, msg: 'La venta ya está anulada' }
```

---

## Reglas de negocio

1. IGV se calcula como porcentaje del total: se lee de `configuracion.igv_porcentaje` (default 18).
2. Para ventas al crédito: `monto_recibido = 0` y `vuelto = 0`.
3. El correlativo se incrementa en `configuracion` solo tras `t.commit()`.
4. La anulación usa transacción separada. Si falla algún `prod.update`, hace rollback.
5. Los `return res.status(4xx)` dentro del `try` NO activan el `catch`, por eso no hay `rollback` en validaciones 400.

---

## Dependencias

- Modelos: `Venta`, `DetalleVenta`, `Producto`, `Cliente`, `Usuario`, `InventarioMovimiento`, `Configuracion`, `CuentaCobrar`
- `sequelize.transaction()`

---

## Endpoints involucrados

| Método | Ruta | Roles |
| --- | --- | --- |
| GET | `/api/ventas` | Admin + Cajero |
| GET | `/api/ventas/:id` | Admin + Cajero |
| POST | `/api/ventas` | Admin + Cajero |
| PUT | `/api/ventas/:id/anular` | Admin + Cajero |

---

## Modelos Sequelize utilizados

`Venta` · `DetalleVenta` · `Producto` · `Cliente` · `Usuario` · `InventarioMovimiento` · `Configuracion` · `CuentaCobrar`

---

## Controladores relacionados

- `server/src/controllers/ventasController.js` — `getAll`, `getOne`, `create`, `anular`

---

## Componentes React relacionados

- `client/src/pages/POS.jsx` — interfaz de registro de venta
- `client/src/pages/Ventas.jsx` — historial, detalle, anulación, devolución
- `client/src/components/ventas/TicketVenta.jsx` — ticket imprimible
- `client/src/hooks/useBarcodeScanner.js` — soporte lector de código de barras

---

## Pruebas unitarias existentes

**Archivo:** `server/tests/controllers/ventasController.test.js` (12 pruebas)

Cubre: getAll (listado, vacío, filtro estado), getOne (200, 404), create (400 sin items, 400 crédito sin cliente, 201 contado, 201 crédito+CxC, 500 rollback sin stock), anular (404, 400 ya anulada, 200 con reversión de stock).

---

## Pruebas de integración existentes

**Archivo:** `server/tests/integration/ventas.integration.test.js` (16 pruebas)

Suites: seguridad (401 sin token), GET /api/ventas (3), GET /api/ventas/:id (2), POST /api/ventas (5), PUT /api/ventas/:id/anular (3).

---

## Impacto sobre otros módulos

- **Inventario:** Movimientos tipo `Venta` se registran por cada ítem vendido.
- **CxC:** Ventas al crédito generan automáticamente la cuenta.
- **Devoluciones:** Solo se pueden devolver ventas en estado `Completada`.
- **Dashboard:** `Venta.count()` y `SUM(total)` alimentan los KPIs del día.
- **Reportes:** `exportarExcel` y `exportarPDF` consultan la tabla ventas.
- **Configuración:** Lee `igv_porcentaje`, `serie_boleta`, `serie_factura`, `numero_correlativo`.

---

## Observaciones

- El calculo del IGV usa la fórmula: `igv = subtotalFinal * igvPorc / (1 + igvPorc)` — el precio incluye IGV.
- El correlativo se actualiza dentro de la misma transacción para garantizar atomicidad.
- El `getAll` acepta `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&estado=` como query params.
