# Especificación — Módulo: Devoluciones

**Versión:** 1.0 | **Sprint:** 3 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Procesar devoluciones de mercancía vendida, reintegrar el stock automáticamente y gestionar el reembolso ya sea en efectivo (contra la caja activa) o mediante nota de crédito. Número de nota de crédito formato `NC001-XXXXXX`.

---

## Descripción funcional

El Cajero o Administrador registra la devolución indicando la venta origen, los productos a devolver con sus cantidades y el tipo de reembolso. El sistema verifica las reglas de negocio, reintegra el stock y registra el movimiento de inventario.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-DEV-01 | Solo de ventas `Completada` | `if (venta.estado !== 'Completada') return 400` |
| RF-DEV-02 | Cantidad ≤ cantidad vendida | `if (numCant > detalleVenta.cantidad) throw` |
| RF-DEV-03 | Reintegro de stock por cada ítem | `prod.update({ stock: antes + cantidad })` |
| RF-DEV-04 | Movimiento inventario tipo `Entrada` | `InventarioMovimiento.create({ tipo: 'Entrada' })` |
| RF-DEV-05 | Número `NC001-XXXXXX` autogenerado | `\`NC001-\${String(count+1).padStart(6,'0')}\`` |
| RF-DEV-06 | Reembolso Efectivo requiere caja del usuario | `Caja.findOne({ estado:'Abierta', usuario_id })` |
| RF-DEV-07 | Reembolso Efectivo crea egreso en caja | `CajaEgreso.create({ concepto: 'Reembolso...' })` |

---

## Criterios de aceptación

```
CA-DEV-01 — POST items vacío → HTTP 400 + { ok: false, msg: 'No se enviaron productos para devolver' }
CA-DEV-02 — POST venta no existe → HTTP 404 + rollback NO llamado (return directo)
CA-DEV-03 — POST venta estado != Completada → HTTP 400 + rollback NO llamado
CA-DEV-04 — POST cantidad excede vendida → HTTP 500 + rollback completo
CA-DEV-05 — POST Efectivo sin caja del usuario → HTTP 500 + rollback
CA-DEV-06 — POST válido → HTTP 201 + stock reintegrado + NC001-XXXXXX
```

---

## Reglas de negocio

1. Los `return 404` y `return 400` **antes de modificar datos** son `return` directos en el `try` — NO llaman `rollback`.
2. `tipo_reembolso` acepta `'Efectivo'` o `'Nota Credito'`.
3. Para Efectivo la caja se busca por `{ estado: 'Abierta', usuario_id: req.user.id }` — más restrictivo que en compras.
4. La cantidad de ítems con `cantidad = 0` se ignora (`if (numCant <= 0) continue`).

---

## Endpoints | Modelos | Controller | Tests

- **Endpoints:** GET, GET/:id, POST bajo `/api/devoluciones`
- **Roles:** Admin + Cajero
- **Modelos:** `Devolucion`, `DetalleDevolucion`, `Venta`, `DetalleVenta`, `Producto`, `Usuario`, `Cliente`, `InventarioMovimiento`, `Caja`, `CajaEgreso`
- **Controller:** `devolucionesController.js` — `getAll`, `getOne`, `create`
- **Test unitario:** `devolucionesController.test.js` (10 pruebas)
- **Componente React:** `client/src/pages/Devoluciones.jsx`, modal en `Ventas.jsx`

---

## Impacto sobre otros módulos

- **Ventas:** El modal de devolución se accede desde el detalle de una venta.
- **Inventario:** Movimiento tipo `Entrada` con referencia a la devolución.
- **Caja:** Reembolso en efectivo crea egreso en la caja del usuario.
