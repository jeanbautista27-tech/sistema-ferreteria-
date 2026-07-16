# Especificación — Módulo: Clientes

**Versión:** 1.0 | **Sprint:** 1 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Mantener el directorio de clientes de la ferretería. Los clientes son opcionales en ventas al contado pero obligatorios en ventas al crédito.

---

## Descripción funcional

CRUD de clientes con búsqueda por nombre o número de documento. Eliminación lógica. La lectura está disponible para Cajero (necesita buscar clientes en el POS). La escritura solo para Administrador.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-CLI-01 | Listar clientes activos con búsqueda por nombre o documento | `Op.or: [{ nombre }, { numero_documento }]` |
| RF-CLI-02 | Crear con nombre obligatorio | `if (!req.body.nombre) return 400` |
| RF-CLI-03 | Actualizar datos del cliente | `cliente.update(req.body)` |
| RF-CLI-04 | Soft delete | `cliente.update({ activo: 0 })` |

---

## Criterios de aceptación

```
CA-CLI-01 — GET → lista clientes activos, soporta ?search=texto
CA-CLI-02 — POST sin nombre → HTTP 400 + { ok: false, msg: 'Nombre es requerido' }
CA-CLI-03 — POST con nombre → HTTP 201 + { ok: true, msg: 'Cliente creado', cliente }
CA-CLI-04 — PUT id inexistente → HTTP 404
CA-CLI-05 — DELETE → HTTP 200 + cliente.activo = 0
```

---

## Reglas de negocio

1. Filtro `activo: 1` en el listado.
2. `?search` busca simultáneamente en `nombre` y `numero_documento` con `Op.or`.
3. Lectura: todos los autenticados. Escritura: solo Administrador.
4. El sistema incluye un "Cliente General" como cliente por defecto para ventas sin cliente.

---

## Endpoints | Modelos | Controller | Tests

- **Endpoints:** GET/POST/PUT/DELETE `/api/clientes`
- **Modelo:** `Cliente`
- **Controller:** `clientesController.js` — `getAll`, `create`, `update`, `remove`
- **Test unitario:** `clientesController.test.js` (12 pruebas)
- **Test integración:** parcial en `ventas.integration.test.js`
- **Componente React:** `client/src/pages/Clientes.jsx`, `client/src/pages/POS.jsx`

---

## Impacto sobre otros módulos

- **Ventas:** `cliente_id` FK. Obligatorio en ventas al crédito.
- **CxC:** `cliente_id` FK en la cuenta por cobrar.
- **Cotizaciones:** `cliente_id` FK opcional.
