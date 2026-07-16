# Especificación — Módulo: Cotizaciones

**Versión:** 1.0 | **Sprint:** 3 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Generar proformas o cotizaciones para clientes antes de concretar la venta. No afectan el stock ni generan comprobante fiscal. Número correlativo automático formato `PROF-XXXXXX`.

---

## Descripción funcional

El Cajero o Administrador crea cotizaciones con productos, precios e IGV. Tienen una validez en días configurable (default 15). Pueden anularse. El POS puede generar una proforma antes de confirmar la venta.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-COT-01 | Al menos un ítem obligatorio | `if (!items \|\| items.length===0) return 400` |
| RF-COT-02 | Número `PROF-XXXXXX` autogenerado | `\`PROF-\${String(count+1).padStart(6,'0')}\`` |
| RF-COT-03 | IGV desde `configuracion.igv_porcentaje` (default 18%) | `Configuracion.findOne({ clave: 'igv_porcentaje' })` |
| RF-COT-04 | Validez en días configurable (default 15) | `validez_dias: validez_dias \|\| 15` |
| RF-COT-05 | Anular cotización | `cotizacion.update({ estado: 'Anulada' })` |
| RF-COT-06 | Filtrar por estado | `where.estado = estado` |

---

## Criterios de aceptación

```
CA-COT-01 — POST sin items → HTTP 400 + { ok: false, msg: 'No hay productos en la cotización' }
CA-COT-02 — POST válido → HTTP 201 + número correlativo PROF-XXXXXX + estado='Pendiente'
CA-COT-03 — PUT anular → HTTP 200 + cotizacion.estado = 'Anulada'
CA-COT-04 — GET /:id inexistente → HTTP 404
```

---

## Reglas de negocio

1. Las cotizaciones **no afectan el stock** — son documentos informativos.
2. El correlativo usa `Cotizacion.count()` como base — no garantiza unicidad ante concurrencia alta.
3. Solo Cajero y Administrador crean y anulan cotizaciones.

---

## Endpoints | Modelos | Controller | Tests

- **Endpoints:** GET, GET/:id, POST, PUT/:id/anular bajo `/api/cotizaciones`
- **Roles:** Admin + Cajero
- **Modelos:** `Cotizacion`, `DetalleCotizacion`, `Producto`, `Cliente`, `Usuario`, `Configuracion`
- **Controller:** `cotizacionesController.js` — `getAll`, `getOne`, `create`, `anular`
- **Test unitario:** `cotizacionesController.test.js` (11 pruebas)
- **Componente React:** `client/src/pages/Cotizaciones.jsx`, `client/src/components/ventas/TicketCotizacion.jsx`

---

## Impacto sobre otros módulos

- **POS:** El POS puede generar proformas antes de registrar la venta.
- **Configuración:** Lee `igv_porcentaje` igual que ventas.
