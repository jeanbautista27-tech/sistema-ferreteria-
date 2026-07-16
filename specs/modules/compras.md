# Especificación — Módulo: Compras

**Versión:** 1.0 | **Sprint:** 2 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Gestionar el ciclo de adquisición de mercancía a proveedores: registro de órdenes por el Administrador, recepción física por el Almacenero con actualización automática del stock y creación de cuentas por pagar en compras al crédito.

---

## Descripción funcional

El Administrador registra órdenes de compra indicando proveedor, productos, cantidades y tipo de pago. Las compras al crédito generan CxP; las al contado descuentan la caja activa. El Almacenero marca las compras como Recibidas actualizando el stock de cada producto.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-05.1 | Solo Administrador registra nuevas órdenes | `requireRole('Administrador')` en POST |
| RF-05.2 | Proveedor es obligatorio | `if (!proveedor_id) return 400` |
| RF-05.3 | Al menos un ítem obligatorio | `if (!items || items.length === 0) return 400` |
| RF-05.4 | Número de orden `OC-${Date.now()}` autogenerado | `const numero_orden = \`OC-\${Date.now()}\`` |
| RF-05.5 | Contado requiere caja abierta | `Caja.findOne({ where: { estado: 'Abierta' } })` |
| RF-05.6 | Crédito genera CxP con plazo 30 días | `CuentaPagar.create(...)` |
| RF-05.7 | Recepción incrementa stock + movimiento inventario | `prod.update({ stock: antes + cantidad })` |
| RF-05.8 | Compra ya Recibida no se puede recibir de nuevo | `if (compra.estado === 'Recibida') return 400` |

---

## Historias de usuario relacionadas

- **HU-08:** Admin registra órdenes de compra
- **HU-09:** Almacenero recibe la mercancía y actualiza el stock

---

## Criterios de aceptación

```
CA-COMP-01
DADO que Admin envía proveedor_id, ítems, tipo_pago='Crédito'
CUANDO hace POST /api/compras
ENTONCES HTTP 201 + CuentaPagar creada con saldo_pendiente = total + IGV

CA-COMP-02
DADO que Admin envía tipo_pago='Efectivo' y hay caja abierta
CUANDO hace POST /api/compras
ENTONCES HTTP 201 + CajaEgreso creado + compra registrada

CA-COMP-03
DADO que Admin envía tipo_pago='Efectivo' y NO hay caja abierta
CUANDO hace POST /api/compras
ENTONCES HTTP 500 + rollback completo (ningún dato persiste)

CA-COMP-04
DADO que no se envía proveedor_id
CUANDO hace POST /api/compras
ENTONCES HTTP 400 + { ok: false, msg: 'Proveedor es requerido' }

CA-COMP-05
DADO que la compra existe en estado 'Pendiente'
CUANDO Almacenero hace PUT /api/compras/:id/recibir
ENTONCES HTTP 200 + stock de cada producto incrementado + movimiento inventario 'Compra'

CA-COMP-06
DADO que la compra ya está en estado 'Recibida'
CUANDO hace PUT /api/compras/:id/recibir
ENTONCES HTTP 400 + { ok: false, msg: 'La compra ya fue recibida' }
```

---

## Reglas de negocio

1. Solo el Administrador puede crear órdenes de compra. Almacenero solo puede recibirlas.
2. El IGV se calcula fijo al 18% sobre el subtotal (`total * 0.18`), no desde configuración.
3. Para compras al contado, la caja buscada es cualquier caja abierta (`where: { estado: 'Abierta' }`), no la del usuario específico.
4. Si el estado inicial es `Recibida` al crear, el stock se actualiza en el mismo `create`.
5. Los `return 400` antes de la transacción no activan rollback porque la transacción aún no ha escrito nada.

---

## Dependencias

- Modelos: `Compra`, `DetalleCompra`, `Producto`, `Proveedor`, `Usuario`, `InventarioMovimiento`, `CuentaPagar`, `Caja`, `CajaEgreso`
- `sequelize.transaction()`

---

## Endpoints involucrados

| Método | Ruta | Roles |
| --- | --- | --- |
| GET | `/api/compras` | Admin + Almacenero |
| GET | `/api/compras/:id` | Admin + Almacenero |
| POST | `/api/compras` | **Solo Admin** |
| PUT | `/api/compras/:id/recibir` | Admin + Almacenero |

---

## Modelos Sequelize utilizados

`Compra` · `DetalleCompra` · `Producto` · `Proveedor` · `Usuario` · `InventarioMovimiento` · `CuentaPagar` · `Caja` · `CajaEgreso`

---

## Controladores relacionados

- `server/src/controllers/comprasController.js` — `getAll`, `getOne`, `create`, `recibirCompra`
- `server/src/routes/comprasRoutes.js` — POST solo Admin; GET y recibir Admin+Almacenero

---

## Componentes React relacionados

- `client/src/pages/Compras.jsx` — lista, crea (solo Admin ve botón), recibe

---

## Pruebas unitarias existentes

**Archivo:** `server/tests/controllers/comprasController.test.js` (12 pruebas)

Cubre: getAll (200, filtro estado, 500), getOne (200, 404), create (400 sin proveedor, 400 sin items, 201 crédito+CxP, 201 contado+caja, 500 rollback sin caja), recibirCompra (404, 400 ya recibida, 200 stock actualizado).

---

## Pruebas de integración existentes

**Archivo:** `server/tests/integration/compras.integration.test.js` (16 pruebas)

Suites: seguridad (401 sin token ×2), GET (3), POST (5), PUT recibir (3).

---

## Impacto sobre otros módulos

- **Inventario:** `InventarioMovimiento` tipo `Compra` al recibir.
- **CxP:** Compras al crédito generan la cuenta por pagar.
- **Caja:** Compras al contado crean egreso en caja activa.
- **Dashboard:** `Compra.findAll` alimenta gráficos comparativos.

---

## Observaciones

- El botón "Nueva Compra" en `Compras.jsx` solo es visible para `rol === 'Administrador'`.
- El IGV en compras (18% fijo) difiere del IGV en ventas (configurable). Consideración de mejora futura.
