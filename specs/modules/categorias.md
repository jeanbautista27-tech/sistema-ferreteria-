# Especificación — Módulo: Categorías

**Versión:** 1.0 | **Sprint:** 1 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Mantener el catálogo de categorías que clasifican los productos de la ferretería. Permite organizar el inventario y habilita el filtro por categoría en el módulo de Productos.

---

## Descripción funcional

CRUD completo de categorías con eliminación lógica. La lectura está disponible para todos los usuarios autenticados (Almacenero las necesita al crear productos). La escritura está restringida a Administrador y Almacenero.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-CAT-01 | Listar categorías ordenadas por nombre | `Categoria.findAll({ order: [['nombre','ASC']] })` |
| RF-CAT-02 | Crear categoría con nombre obligatorio | `if (!nombre) return 400` |
| RF-CAT-03 | Actualizar categoría existente | `categoria.update(req.body)` |
| RF-CAT-04 | Soft delete (`activo = 0`) | `categoria.update({ activo: 0 })` |

---

## Criterios de aceptación

```
CA-CAT-01 — GET todas incluye activas e inactivas (no filtra por activo en getAll)
CA-CAT-02 — POST sin nombre → HTTP 400 + { ok: false, msg: 'Nombre es requerido' }
CA-CAT-03 — POST con nombre → HTTP 201 + { ok: true, msg: 'Categoría creada', categoria }
CA-CAT-04 — PUT id inexistente → HTTP 404 + { ok: false, msg: 'Categoría no encontrada' }
CA-CAT-05 — DELETE → HTTP 200 + categoria.activo = 0
```

---

## Reglas de negocio

1. El listado `getAll` **no filtra por activo** — devuelve todas (activas e inactivas).
2. Lectura: todos los autenticados. Escritura: Admin + Almacenero.
3. Eliminación lógica preserva la relación con productos existentes.

---

## Endpoints | Modelos | Controller | Tests

- **Endpoints:** GET/POST/PUT/DELETE `/api/categorias`
- **Modelo:** `Categoria`
- **Controller:** `categoriasController.js` — `getAll`, `create`, `update`, `remove`
- **Test unitario:** `categoriasController.test.js` (11 pruebas)
- **Componente React:** `client/src/pages/Categorias.jsx`

---

## Impacto sobre otros módulos

- **Productos:** `categoria_id` FK. El filtro por categoría en Productos depende de esta tabla.
- **Dashboard:** `DetalleVenta → Producto → Categoria` para el top de categorías vendidas.

---

## Observaciones

El `getAll` de categorías incluye registros con `activo = 0` a diferencia de `Proveedor` y `Cliente` que filtran `activo: 1`. Considerar unificar en versiones futuras.
