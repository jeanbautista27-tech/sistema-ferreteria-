# Especificación — Módulo: Configuración

**Versión:** 1.0 | **Sprint:** 1 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Centralizar los parámetros operativos del sistema (datos de empresa, IGV, series de comprobantes) en un modelo clave-valor persistido en BD. La lectura es global; la escritura está restringida al Administrador.

---

## Descripción funcional

El módulo retorna todas las configuraciones como un objeto `{ clave: valor }`. La actualización usa `upsert` (inserta si no existe, actualiza si existe), por lo que es idempotente. Soporta subida de logo mediante multer.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-CFG-01 | Retornar config como objeto clave-valor | `config.forEach(c => result[c.clave] = c.valor)` |
| RF-CFG-02 | Actualizar con `upsert` por cada par clave-valor | `Configuracion.upsert({ clave, valor })` |
| RF-CFG-03 | Subir logo de empresa | `req.file → upsert({ clave: 'empresa_logo', valor: filename })` |

---

## Criterios de aceptación

```
CA-CFG-01
DADO GET /api/configuracion (cualquier usuario autenticado)
ENTONCES HTTP 200 + { ok: true, configuracion: { empresa_nombre: '...', igv_porcentaje: '18', ... } }

CA-CFG-02
DADO PUT /api/configuracion con { empresa_nombre: 'Nueva Ferretería', igv_porcentaje: '18' } (Admin)
ENTONCES HTTP 200 + { ok: true, msg: 'Configuración actualizada' }
  Y Configuracion.upsert llamado 2 veces (una por cada par clave-valor)

CA-CFG-03
DADO PUT sin body y sin archivo (Admin)
ENTONCES HTTP 200 + Configuracion.upsert NO llamado
```

---

## Claves de configuración usadas por el sistema

| Clave | Usado por |
| --- | --- |
| `empresa_nombre` | Sidebar, tickets |
| `empresa_logo` | Sidebar |
| `igv_porcentaje` | `ventasController`, `cotizacionesController` |
| `serie_boleta` | `ventasController` |
| `serie_factura` | `ventasController` |
| `numero_correlativo` | `ventasController` |

---

## Endpoints | Modelos | Controller | Tests

- **Endpoints:** GET `/api/configuracion`, PUT `/api/configuracion`
- **Roles lectura:** Todos. **Roles escritura:** Solo Admin
- **Modelo:** `Configuracion`
- **Controller:** `configuracionController.js` — `getAll`, `update`
- **Test unitario:** `configuracionController.test.js` (7 pruebas)
- **Componente React:** `client/src/pages/Configuracion.jsx`, `client/src/components/layout/Sidebar.jsx`

---

## Impacto sobre otros módulos

- **Ventas / Cotizaciones:** Leen `igv_porcentaje`, `serie_boleta`, `serie_factura`, `numero_correlativo`.
- **Sidebar:** Lee `empresa_nombre` y `empresa_logo` en cada render.
