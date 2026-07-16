# Especificación — Módulo: Reportes

**Versión:** 1.0 | **Sprint:** 4 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Generar y exportar informes financieros en formatos Excel (.xlsx) y PDF para análisis gerencial. Incluye reporte consolidado (ventas, compras, CxC, CxP), reporte de ventas y reporte de inventario valorizado.

---

## Descripción funcional

El módulo genera archivos descargables directamente desde el servidor. Usa ExcelJS para los reportes Excel con múltiples hojas y PDFKit para los PDF. Todos los reportes aceptan filtro por rango de fechas opcional.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-REP-01 | Resumen de ventas (total, IGV, cantidad) | `reportesController.resumenVentas` |
| RF-REP-02 | Top 20 productos más vendidos por cantidad | `reportesController.productosVendidos` |
| RF-REP-03 | Excel consolidado con 4 hojas | `exportarExcel` → `ExcelJS.Workbook` |
| RF-REP-04 | PDF de ventas (máximo 50 registros) | `exportarPDF` → `PDFDocument` |
| RF-REP-05 | Excel inventario valorizado | `exportarInventarioExcel` |
| RF-REP-06 | PDF inventario valorizado | `exportarInventarioPDF` |
| RF-REP-07 | Filtro opcional por `?desde=&hasta=` | `where.created_at = { Op.between }` |

---

## Criterios de aceptación

```
CA-REP-01
DADO GET /api/reportes/ventas
ENTONCES HTTP 200 + { ok: true, total_ventas, total_igv, cantidad_ventas }

CA-REP-02
DADO GET /api/reportes/exportar-excel
ENTONCES Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
  Y Content-Disposition: attachment; filename=Reporte_Consolidado_Financiero.xlsx
  Y archivo con 4 hojas: '1. Ingresos (Ventas)', '2. Egresos (Compras)', '3. Activos (CxC)', '4. Pasivos (CxP)'

CA-REP-03
DADO GET /api/reportes/exportar-pdf
ENTONCES Content-Type: application/pdf
  Y Content-Disposition: attachment; filename=reporte_ventas.pdf

CA-REP-04
DADO GET /api/reportes/exportar-inventario-excel
ENTONCES archivo .xlsx con columnas: Código, Producto, Categoría, Stock Físico, Precio Unidad, Valorización Total
```

---

## Reglas de negocio

1. El Excel consolidado incluye el **TOTAL CAJA REAL** excluyendo ventas al crédito del cómputo de efectivo.
2. El PDF de ventas muestra máximo 50 registros por documento.
3. El PDF de inventario incluye control de salto de página automático cada 700pt.
4. Solo Administrador accede a todos los reportes.

---

## Endpoints | Modelos | Controller | Tests

- **Endpoints:** 6 endpoints bajo `/api/reportes`
- **Roles:** **Solo Admin**
- **Modelos:** `Venta`, `DetalleVenta`, `Producto`, `Categoria`, `Compra`, `Proveedor`, `Cliente`, `CuentaCobrar`, `CuentaPagar`
- **Controller:** `reportesController.js` — `resumenVentas`, `productosVendidos`, `exportarExcel`, `exportarPDF`, `exportarInventarioExcel`, `exportarInventarioPDF`
- **Dependencias:** `exceljs` 4.4.0, `pdfkit` 0.15.0
- **Test unitario:** `reportesController.test.js` (15 pruebas — incluye mocks de ExcelJS y PDFKit)
- **Componente React:** `client/src/pages/Reportes.jsx`

---

## Impacto sobre otros módulos

Solo lectura. Consulta datos de: Ventas, Compras, Productos, CxC y CxP. No modifica ninguna tabla.
