# 05 — Sprint Planning

**Versión:** 1.0 | **Metodología:** Scrum | **Estado:** Completado

---

## Sprint 1 — Fundamentos del sistema

**Duración:** 2 semanas | **Objetivo:** Base técnica + módulos maestros
**Story Points:** 15 SP

| Item | HU | Descripción | SP | Estado |
| --- | --- | --- | --- | --- |
| 1 | HU-01 | Autenticación JWT con rate limiting | 2 | ✅ Done |
| 2 | HU-02 | Gestión de usuarios (CRUD + roles) | 3 | ✅ Done |
| 3 | HU-03 | Configuración del sistema | 2 | ✅ Done |
| 4 | HU-19 | Catálogo de productos + filtro categoría | 5 | ✅ Done |
| 5 | HU-10 | Inventario con alerta de stock bajo | 3 | ✅ Done |

**Entregables del Sprint 1:**
- API REST funcional con autenticación JWT
- Control de acceso por roles (verifyToken + requireRole)
- Módulos Usuarios, Productos, Categorías, Proveedores, Clientes, Configuración
- 61 pruebas unitarias aprobadas

---

## Sprint 2 — Ciclo comercial core

**Duración:** 2 semanas | **Objetivo:** Ventas y compras operativas
**Story Points:** 29 SP

| Item | HU | Descripción | SP | Estado |
| --- | --- | --- | --- | --- |
| 6 | HU-11 | Ajuste manual de stock + movimientos | 3 | ✅ Done |
| 7 | HU-04 | POS — Registro de venta al contado | 8 | ✅ Done |
| 8 | HU-05 | Venta al crédito → CxC automática | 5 | ✅ Done |
| 9 | HU-07 | Anulación de venta + reversión stock | 3 | ✅ Done |
| 10 | HU-08 | Registro de órdenes de compra (Admin) | 8 | ✅ Done |
| 11 | HU-09 | Recepción mercancía → stock (Almacenero) | 5 | ✅ Done |

**Entregables del Sprint 2:**
- POS completo con soporte lector de código de barras
- Flujo de ventas al contado y al crédito
- Flujo de compras con recepción de mercancía
- Movimientos de inventario trazables
- 95 pruebas unitarias + 55 pruebas integración

---

## Sprint 3 — Finanzas y operaciones

**Duración:** 2 semanas | **Objetivo:** Caja, créditos, devoluciones
**Story Points:** 23 SP

| Item | HU | Descripción | SP | Estado |
| --- | --- | --- | --- | --- |
| 12 | HU-12 | Apertura y cierre de caja | 5 | ✅ Done |
| 13 | HU-13 | Registro de egresos en caja | 2 | ✅ Done |
| 14 | HU-14 | Abonos a Cuentas por Cobrar | 5 | ✅ Done |
| 15 | HU-15 | Pagos a Cuentas por Pagar | 5 | ✅ Done |
| 16 | HU-16 | Devoluciones con nota de crédito | 8 | ✅ Done |
| 17 | HU-06 | Cotizaciones / Proformas | 3 | ✅ Done |

**Entregables del Sprint 3:**
- Control de caja diaria completo
- Gestión de créditos CxC y CxP con abonos
- Devoluciones con reembolso efectivo o nota de crédito
- Cotizaciones con número correlativo

---

## Sprint 4 — Reportes, dashboard y despliegue

**Duración:** 2 semanas | **Objetivo:** Inteligencia de negocio + producción
**Story Points:** 12 SP

| Item | HU | Descripción | SP | Estado |
| --- | --- | --- | --- | --- |
| 18 | HU-17 | Reportes Excel (4 hojas) y PDF | 5 | ✅ Done |
| 19 | HU-18 | Dashboard con KPIs y gráficos | 5 | ✅ Done |
| 20 | HU-20 | Logs de auditoría | 2 | ✅ Done |
| — | — | Despliegue en Railway (backend + frontend + MySQL) | — | ✅ Done |
| — | — | Importación de base de datos en Railway | — | ✅ Done |
| — | — | Configuración de variables de entorno producción | — | ✅ Done |

**Entregables del Sprint 4:**
- Sistema completo desplegado en Railway
- Dashboard con 4 gráficos y KPIs en tiempo real
- Exportación Excel y PDF funcional
- 362 pruebas automatizadas — 0 fallos

---

## Sprint 5 — Mejoras de interfaz solicitadas por el cliente

**Duración:** 1 semana | **Objetivo:** Ajustes visuales según retroalimentación del cliente
**Story Points:** 1 SP

| Item | HU | Descripción | SP | Estado |
| --- | --- | --- | --- | --- |
| 21 | HU-21 | Cambio de color del sidebar de morado a negro | 1 | ✅ Done |

**Entregables del Sprint 5:**
- Sidebar con fondo negro (`#111827` → `#1f2937`) en lugar de degradado morado
- Cambio visible en producción (Railway) tras push automático
- Sin impacto en pruebas existentes — 362/362 siguen pasando

---

## Velocity del proyecto

| Sprint | SP Planeados | SP Completados | Velocidad |
| --- | --- | --- | --- |
| Sprint 1 | 15 | 15 | 100% |
| Sprint 2 | 29 | 29 | 100% |
| Sprint 3 | 23 | 23 | 100% |
| Sprint 4 | 12 | 12 | 100% |
| **Total** | **79** | **79** | **100%** |
