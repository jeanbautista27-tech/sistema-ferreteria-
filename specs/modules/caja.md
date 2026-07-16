# Especificación — Módulo: Caja

**Versión:** 1.0 | **Sprint:** 3 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Controlar el efectivo del turno operativo: apertura con monto inicial, registro de egresos durante el turno y cierre con cálculo automático del monto final. Provee historial de los últimos 30 turnos.

---

## Descripción funcional

Permite abrir un turno de caja con un monto inicial. Durante el turno se registran egresos (gastos, pagos). Al cerrar, el sistema calcula: `monto_final = monto_inicial + total_ventas - total_egresos`. Solo puede haber una caja abierta en el sistema en un momento dado.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-CAJ-01 | Solo una caja abierta simultáneamente | `if (abierta) return 400` |
| RF-CAJ-02 | Apertura con monto inicial (default 0) | `monto_inicial: req.body.monto_inicial \|\| 0` |
| RF-CAJ-03 | Cierre calcula `total_ventas` desde ventas completadas | `Venta.findAll({ estado: 'Completada', >=fecha_apertura })` |
| RF-CAJ-04 | Cierre calcula `total_egresos` desde `caja_egresos` tipo `Egreso` | `CajaEgreso.findAll({ caja_id, tipo: 'Egreso' })` |
| RF-CAJ-05 | Registro de movimientos de egreso/ingreso | `CajaEgreso.create(...)` |
| RF-CAJ-06 | Historial últimos 30 turnos con movimientos | `limit: 30, include: CajaEgreso` |

---

## Criterios de aceptación

```
CA-CAJ-01
DADO que no hay caja abierta
CUANDO hace POST /api/caja/abrir con { monto_inicial: 500 }
ENTONCES HTTP 201 + caja con estado='Abierta' y usuario_id del solicitante

CA-CAJ-02
DADO que ya hay una caja abierta
CUANDO hace POST /api/caja/abrir
ENTONCES HTTP 400 + { ok: false, msg: 'Ya hay una caja abierta' }

CA-CAJ-03
DADO que la caja existe y está abierta
CUANDO hace PUT /api/caja/cerrar/:id
ENTONCES HTTP 200 + monto_final = monto_inicial + total_ventas - total_egresos

CA-CAJ-04
DADO que la caja no existe o ya está cerrada
CUANDO hace PUT /api/caja/cerrar/:id
ENTONCES HTTP 400 + { ok: false, msg: 'Caja no encontrada o ya cerrada' }
```

---

## Reglas de negocio

1. `total_ventas` en el cierre suma las ventas completadas **desde la fecha de apertura de la caja**.
2. Solo se suman egresos de tipo `'Egreso'` (hay registros tipo `'Ingreso'` también).
3. Las compras al contado, devoluciones en efectivo y pagos CxP crean `CajaEgreso` automáticamente.
4. La caja activa la verifica `devolucionesController` con `{ estado: 'Abierta', usuario_id: req.user.id }`.

---

## Endpoints | Modelos | Controller | Tests

- **Endpoints:** GET actual, POST abrir, PUT cerrar, POST movimiento, GET historial bajo `/api/caja`
- **Roles:** Admin + Cajero
- **Modelos:** `Caja`, `CajaEgreso`, `Venta`, `Usuario`
- **Controller:** `cajaController.js` — `getCajaActual`, `abrir`, `cerrar`, `registrarMovimiento`, `getHistorial`
- **Test unitario:** `cajaController.test.js` (15 pruebas)
- **Componente React:** `client/src/pages/Caja.jsx`

---

## Impacto sobre otros módulos

- **Compras (contado):** Requiere caja abierta → crea `CajaEgreso`.
- **Devoluciones (efectivo):** Requiere caja del usuario → crea `CajaEgreso`.
- **CxC (abonos):** Incrementa `total_ventas` de la caja activa.
- **CxP (pagos):** Crea `CajaEgreso` en la caja activa.
