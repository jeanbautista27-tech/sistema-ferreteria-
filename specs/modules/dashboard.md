# Especificación — Módulo: Dashboard

**Versión:** 1.0 | **Sprint:** 4 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Proveer una vista unificada de los indicadores clave de desempeño (KPIs) del negocio en tiempo real, con gráficos de tendencia y análisis comparativo para la toma de decisiones.

---

## Descripción funcional

El dashboard realiza múltiples consultas paralelas a la BD y consolida los resultados en una sola respuesta JSON. Incluye KPIs del día, stock crítico, tendencia de ventas (7 días), comparativa ventas vs compras (6 días), últimas ventas y distribución financiera global.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-DASH-01 | Total productos activos | `Producto.count()` |
| RF-DASH-02 | Total clientes | `Cliente.count()` |
| RF-DASH-03 | Ventas del día (conteo) | `Venta.count({ created_at >= hoy })` |
| RF-DASH-04 | Monto de ventas del día | `SUM(total) WHERE estado='Completada' AND hoy` |
| RF-DASH-05 | Estado de caja (abierta/cerrada) | `Caja.findOne({ estado: 'Abierta' })` |
| RF-DASH-06 | Stock crítico (top 5 productos) | `stock <= col('stock_minimo') LIMIT 5` |
| RF-DASH-07 | Tendencia ventas 7 días | `GROUP BY DATE(created_at) últimos 7 días` |
| RF-DASH-08 | Comparativa ventas vs compras 6 días | Ventas y Compras agrupadas por fecha |
| RF-DASH-09 | Últimas 5 ventas completadas | `ORDER BY created_at DESC LIMIT 5` |
| RF-DASH-10 | Distribución financiera global | `SUM(ventas)`, `SUM(compras)`, `MAX(0, ventas-compras)` |

---

## Criterios de aceptación

```
CA-DASH-01
DADO que se llama GET /api/dashboard/stats
ENTONCES responde HTTP 200 con:
  - kpis: { totalProductos, totalClientes, ventasHoy, ventasHoyMonto, cajaAbierta: bool }
  - stockCritico: array de productos con stock bajo
  - tendenciaVentas: { fechas: [], totales: [] }
  - comparativa6Dias: { fechas: [], ventas: [], compras: [] }
  - ultimasVentas: array de 5 ventas
  - distribucion: { ventas, compras, margen: MAX(0, ventas-compras) }

CA-DASH-02
DADO que BD falla
CUANDO se llama GET /api/dashboard/stats
ENTONCES HTTP 500 + { ok: false, msg: 'Error al generar dashboard stats' }
```

---

## Reglas de negocio

1. El margen se calcula como `Math.max(0, globalVenta - globalCompra)` — nunca negativo en el display.
2. `cajaAbierta` es un booleano: `!!cajaActiva`.
3. La tendencia de ventas usa los 7 días anteriores al día actual.
4. La comparativa de 6 días incluye el día actual.

---

## Endpoints | Modelos | Controller | Tests

- **Endpoint:** GET `/api/dashboard/stats`
- **Roles:** Todos los autenticados
- **Modelos:** `Venta`, `DetalleVenta`, `Compra`, `Producto`, `Categoria`, `Cliente`, `Caja`
- **Controller:** `dashboardController.js` — `getDashboardStats`
- **Test unitario:** `dashboardController.test.js` (4 pruebas)
- **Componente React:** `client/src/pages/Dashboard.jsx`

---

## Impacto sobre otros módulos

Consulta datos de: Ventas, Compras, Productos, Clientes y Caja. Solo lectura — no modifica ninguna tabla.
