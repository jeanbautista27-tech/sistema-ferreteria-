# Especificación — Módulo: Proveedores

**Versión:** 1.0 | **Sprint:** 1 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Mantener el directorio de proveedores de la ferretería. Los proveedores son referenciados en los productos (proveedor principal) y en las órdenes de compra.

---

## Descripción funcional

CRUD de proveedores con eliminación lógica. Filtrado automático a `activo: 1` en el listado. La razón social (`empresa`) es el único campo obligatorio. La escritura está restringida a Admin y Almacenero.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-PROV-01 | Listar proveedores activos ordenados por empresa | `where: { activo: 1 }, order: [['empresa','ASC']]` |
| RF-PROV-02 | Crear con empresa (razón social) obligatoria | `if (!empresa) return 400` |
| RF-PROV-03 | Actualizar datos del proveedor | `proveedor.update(req.body)` |
| RF-PROV-04 | Soft delete | `proveedor.update({ activo: 0 })` |

---

## Criterios de aceptación

```
CA-PROV-01 — GET → lista solo proveedores activos
CA-PROV-02 — POST sin empresa → HTTP 400 + { ok: false, msg: 'Razón social es requerida' }
CA-PROV-03 — POST con empresa → HTTP 201 + { ok: true, msg: 'Proveedor creado', proveedor }
CA-PROV-04 — PUT id inexistente → HTTP 404
CA-PROV-05 — DELETE → HTTP 200 + proveedor.activo = 0
```

---

## Reglas de negocio

1. El listado filtra `activo: 1` — proveedores desactivados no aparecen.
2. Lectura: todos los autenticados (Almacenero los necesita en el formulario de compras).
3. Escritura: Admin + Almacenero.

---

## Endpoints | Modelos | Controller | Tests

- **Endpoints:** GET/POST/PUT/DELETE `/api/proveedores`
- **Modelo:** `Proveedor`
- **Controller:** `proveedoresController.js` — `getAll`, `create`, `update`, `remove`
- **Test unitario:** `proveedoresController.test.js` (11 pruebas)
- **Componente React:** `client/src/pages/Proveedores.jsx`

---

## Impacto sobre otros módulos

- **Productos:** `proveedor_id` FK para proveedor principal del producto.
- **Compras:** `proveedor_id` FK en la orden de compra.
- **CxP:** `proveedor_id` FK en la cuenta por pagar.
