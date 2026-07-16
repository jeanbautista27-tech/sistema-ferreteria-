# Especificación — Módulo: Cuentas por Cobrar (CxC)

**Versión:** 1.0 | **Sprint:** 3 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Gestionar la cartera de créditos otorgados a clientes. Registrar abonos parciales o totales actualizando saldos y cerrando la cuenta al saldar completamente la deuda.

---

## Descripción funcional

Las CxC se generan automáticamente al registrar una venta al crédito. El Cajero o Administrador registra abonos. Cada abono requiere una caja abierta (el abono ingresa a la caja). Al saldar el saldo pendiente, el estado cambia a `Pagado`.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-CXC-01 | Listar con filtro por estado | `where.estado = estado` |
| RF-CXC-02 | Ver detalle con historial de abonos | `include: [AbonoCuenta]` |
| RF-CXC-03 | Monto inválido (NaN o ≤ 0) rechazado | `if (isNaN(montoAbono) \|\| montoAbono <= 0) throw` |
| RF-CXC-04 | Requiere caja abierta del usuario | `Caja.findOne({ usuario_id, estado: 'Abierta' })` |
| RF-CXC-05 | Abono no puede exceder saldo pendiente | `if (montoAbono > saldo) throw` |
| RF-CXC-06 | Al saldar: estado → `Pagado` | `nuevoPendiente <= 0 ? 'Pagado' : 'Pendiente'` |
| RF-CXC-07 | Cuenta `Pagado` no acepta más abonos | `if (cuenta.estado === 'Pagado') throw` |
| RF-CXC-08 | Abono suma al `total_ventas` de la caja | `cajaAbierta.update({ total_ventas: nuevo })` |

---

## Criterios de aceptación

```
CA-CXC-01 — Monto 'abc' → HTTP 400 + { ok: false, msg: 'Monto inválido' } + rollback
CA-CXC-02 — Sin caja abierta → HTTP 400 + rollback
CA-CXC-03 — Cuenta no existe → HTTP 400 + rollback
CA-CXC-04 — Cuenta ya Pagado → HTTP 400 + rollback
CA-CXC-05 — Abono > saldo → HTTP 400 + rollback
CA-CXC-06 — Abono parcial → saldo_pendiente disminuye, estado sigue Pendiente
CA-CXC-07 — Abono total → saldo_pendiente = 0, estado = Pagado
```

---

## Reglas de negocio

1. Todos los errores en `registrarAbono` usan `throw` → activan `catch` → `rollback`.
2. El abono se suma al `total_ventas` de la caja como ingreso (no usa `CajaEgreso`).
3. La creación de CxC es automática desde `ventasController.create` con `saldo_pendiente = total` y `fecha_vencimiento = +30 días`.

---

## Endpoints | Modelos | Controller | Tests

- **Endpoints:** GET, GET/:id, POST/:id/abonos bajo `/api/cuentas-cobrar`
- **Roles:** Admin + Cajero
- **Modelos:** `CuentaCobrar`, `AbonoCuenta`, `Cliente`, `Venta`, `Usuario`, `Caja`, `CajaEgreso`
- **Controller:** `cuentasCobrarController.js` — `listar`, `detalle`, `registrarAbono`
- **Test unitario:** `cuentasCobrarController.test.js` (10 pruebas)
- **Componente React:** `client/src/pages/CuentasCobrar.jsx`

---

## Impacto sobre otros módulos

- **Ventas:** Las ventas al crédito crean CxC automáticamente.
- **Caja:** Los abonos incrementan `total_ventas` de la caja activa.
