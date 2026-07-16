# 00 — Visión del Proyecto

**Sistema:** Sistema de Gestión para Ferretería
**Versión:** 1.0
**Enfoque:** Specification Driven Development (SDD)
**Repositorio:** https://github.com/jeanbautista27-tech/sistema-ferreteria-
**Fecha:** Julio 2026

---

## Declaración de visión

El sistema es una plataforma web de gestión integral (ERP) para ferreterías,
desarrollada con el objetivo de digitalizar y centralizar los procesos comerciales
del negocio. Elimina el registro manual, reduce errores en el inventario, mejora
el control de cobros y pagos, y proporciona información financiera consolidada en
tiempo real para la toma de decisiones.

---

## Problema que resuelve

| Problema | Impacto | Módulo que lo resuelve |
| --- | --- | --- |
| Registro manual de ventas | Errores y lentitud | POS / Ventas |
| Descontrol del inventario | Quiebres de stock | Inventario |
| Sin control de créditos | Deudas no cobradas | CxC / CxP |
| Caja sin conciliación | Descuadres | Caja |
| Sin reportes financieros | Decisiones sin datos | Reportes |
| Acceso sin control | Riesgo de seguridad | Auth / Usuarios |

---

## Objetivo general

Proveer una aplicación web completa, segura y desplegada en la nube que permita
al personal de la ferretería operar el ciclo comercial completo desde cualquier
dispositivo con navegador web, sin instalación local.

---

## Objetivos específicos

1. Implementar un Punto de Venta (POS) con soporte para lector de código de barras.
2. Controlar el inventario en tiempo real con trazabilidad de movimientos.
3. Gestionar el ciclo de compras a proveedores con control de recepciones.
4. Administrar créditos otorgados (CxC) y deudas con proveedores (CxP).
5. Proveer reportes exportables en Excel y PDF.
6. Implementar control de acceso por roles (Administrador, Almacenero, Cajero).
7. Desplegar el sistema completo en Railway (cloud) sin infraestructura local.
8. Validar el desarrollo mediante 290 pruebas automatizadas (SDD).

---

## Alcance del sistema

### Incluido

- Módulos: Autenticación, POS, Ventas, Compras, Inventario, Caja, Clientes,
  Proveedores, Productos, Categorías, Cotizaciones, Devoluciones,
  Cuentas por Cobrar, Cuentas por Pagar, Reportes, Usuarios, Configuración,
  Dashboard, Logs de auditoría.
- Tres roles de usuario: Administrador, Almacenero, Cajero.
- Despliegue en Railway (frontend + backend + MySQL).
- 290 pruebas automatizadas (235 unitarias + 55 integración).

### Excluido

- Aplicación móvil nativa.
- Integración con SUNAT (facturación electrónica).
- Módulo de RRHH o planillas.
- Notificaciones por correo o SMS.

---

## Usuarios del sistema

| Rol | Descripción | Módulos principales |
| --- | --- | --- |
| **Administrador** | Acceso total. Gestiona el negocio. | Todos |
| **Almacenero** | Gestiona inventario y compras. | Productos, Categorías, Inventario, Proveedores, Compras (recepción) |
| **Cajero** | Opera el punto de venta. | POS, Ventas, Caja, Cotizaciones, Devoluciones, Clientes, CxC |

---

## Tecnologías del sistema

| Componente | Tecnología |
| --- | --- |
| Frontend | React 18 + Vite 5 + Zustand + Axios |
| Backend | Node.js + Express 4 + Sequelize 6 |
| Base de datos | MySQL 8 |
| Autenticación | JWT + bcryptjs |
| Testing | Jest 30 + Supertest 7 |
| Despliegue | Railway (cloud) |
| Repositorio | GitHub |

---

## Indicadores de éxito

- Sistema desplegado en producción y accesible desde cualquier navegador.
- 290 pruebas automatizadas pasando al 100%.
- Cobertura de código ≥ 90% en controllers y middlewares.
- Los tres roles operan exclusivamente en sus módulos asignados.
- El ciclo completo ventas → CxC → abono funciona end-to-end.
- El ciclo compras → recepción → stock funciona end-to-end.
