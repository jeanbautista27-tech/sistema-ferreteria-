# Especificación — Módulo: Cuentas por Pagar (CxP)

**Versión:** 1.0 | **Sprint:** 3 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Gestionar las deudas de la ferretería con proveedores originadas por compras al crédito. Registrar pagos parciales o totales con descuento de la caja activa.

---

## Descripción funcional

Las CxP se generan automáticamente al registrar una compra al crédito. Solo el Administrador puede registrar pagos. Cada pago requiere caja abierta y se registra como egreso en dicha caja. Al saldar la deuda, el estado cambia a `Pagado`.

---

## Requerimientos funcionales

Mismas reglas que CxC con estas diferencias:

| Diferencia | CxC | CxP |
| --- | --- | --- |
| Quién puede gestionar | Admin + Cajero | **Solo Admin** |
| El pago afecta la caja | Suma a `total_ventas` (ingreso) | Crea `CajaEgreso` (egreso) |
| Origen de la cuenta | Venta al crédito | Compra al crédito |
| Mensaje cuenta pagada | 'Esta cuenta ya está completamente pagada' | 'Esta cuenta ya ha sido cancelada al proveedor en su totalidad.' |

---

## Criterios de aceptación

```
CA-CXP-01 — Monto 'abc' → HTTP 400 + rollback
CA-CXP-02 — Sin caja → HTTP 400 + rollback
CA-CXP-03 — Cuenta no existe → HTTP 400 + rollback
CA-CXP-04 — Cuenta Pagado → HTTP 400 + rollback
CA-CXP-05 — Abono > saldo → HTTP 400 + rollback
CA-CXP-06 — Pago parcial → saldo_pendiente disminuye + CajaEgreso creado
CA-CXP-07 — Pago total → estado = Pagado + CajaEgreso creado
```

---

## Endpoints | Modelos | Controller | Tests

- **Endpoints:** GET, GET/:id, POST/:id/abonos bajo `/api/cuentas-pagar`
- **Roles:** **Solo Admin**
- **Modelos:** `CuentaPagar`, `AbonoPagar`, `Proveedor`, `Compra`, `Usuario`, `Caja`, `CajaEgreso`
- **Controller:** `cuentasPagarController.js` — `listar`, `detalle`, `registrarAbono`
- **Test unitario:** `cuentasPagarController.test.js` (10 pruebas)
- **Componente React:** `client/src/pages/CuentasPagar.jsx`

---

## Impacto sobre otros módulos

- **Compras:** Las compras al crédito crean CxP automáticamente.
- **Caja:** Los pagos crean `CajaEgreso` en la caja activa del Administrador.
