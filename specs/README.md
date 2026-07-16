# Repositorio de Especificaciones — Sistema de Gestión para Ferretería

> **Enfoque:** Specification Driven Development (SDD)
> **Versión:** 1.0
> **Proyecto:** Sistema ERP Web para Ferretería
> **Repositorio:** https://github.com/jeanbautista27-tech/sistema-ferreteria-

---

## ¿Qué es este directorio?

Este directorio contiene el **repositorio de especificaciones** del sistema, organizado
siguiendo los principios de **Specification Driven Development (SDD)**.

En SDD, las especificaciones son el artefacto central del proceso de desarrollo:

```
ESPECIFICACIÓN  →  PRUEBA  →  IMPLEMENTACIÓN  →  VERIFICACIÓN
     (specs/)      (tests/)      (src/)           (jest --coverage)
```

Las especificaciones en este directorio son **contratos vivos** — documentan el
comportamiento esperado del sistema y tienen trazabilidad directa hacia las pruebas
y el código de producción.

---

## Principios SDD aplicados en este proyecto

| Principio | Aplicación concreta |
| --- | --- |
| **Spec-first** | Cada módulo tiene su spec antes que su implementación |
| **Contrato como verdad** | Las specs definen qué debe hacer el sistema, no cómo |
| **Trazabilidad total** | Cada spec enlaza a su test y a su controller |
| **Verificación automática** | `npm test` valida que las specs se cumplen (290 tests) |
| **Documentación viva** | Las specs evolucionan junto con el código |

---

## Estructura del repositorio de especificaciones

```
specs/
│
├── README.md                          ← Este archivo (índice general)
│
├── arquitectura/
│   ├── arquitectura-sistema.md        ← Visión arquitectónica completa
│   ├── decisiones-tecnicas.md         ← ADR (Architecture Decision Records)
│   └── roles-y-permisos.md            ← Matriz de roles y acceso por módulo
│
├── modulos/                           ← Especificaciones por módulo de negocio
│   ├── autenticacion.md
│   ├── ventas.md
│   ├── compras.md
│   ├── inventario.md
│   ├── caja.md
│   ├── cotizaciones.md
│   ├── devoluciones.md
│   ├── cuentas-cobrar.md
│   ├── cuentas-pagar.md
│   ├── productos.md
│   ├── usuarios.md
│   ├── reportes.md
│   └── configuracion.md
│
├── api/
│   └── contratos-api.md               ← Contratos de todos los endpoints REST
│
├── pruebas/
│   ├── plan-pruebas.md                ← Estrategia y plan de pruebas
│   ├── trazabilidad.md                ← Matriz requerimiento → test → cobertura
│   └── cobertura.md                   ← Reporte de cobertura y análisis
│
└── despliegue/
    └── railway.md                     ← Especificación de despliegue en Railway
```

---

## Estado de verificación

```bash
cd server && npm test
```

| Métrica | Resultado |
| --- | --- |
| Test Suites | 22 passed |
| Tests totales | **290 passed** |
| Fallos | **0** |
| Cobertura controllers | 96.59% statements |
| Cobertura middlewares | 95.65% statements |

---

## Cómo leer una especificación

Cada archivo de módulo sigue esta estructura:

```
1. Descripción del módulo
2. Actores involucrados
3. Precondiciones
4. Especificaciones funcionales (con ID)
5. Reglas de negocio
6. Escenarios de error
7. Criterios de aceptación
8. Trazabilidad hacia tests
```

---

## Índice de especificaciones

### Arquitectura
- [Arquitectura del sistema](./arquitectura/arquitectura-sistema.md)
- [Decisiones técnicas (ADR)](./arquitectura/decisiones-tecnicas.md)
- [Roles y permisos](./arquitectura/roles-y-permisos.md)

### Módulos de negocio
- [Autenticación](./modulos/autenticacion.md)
- [Ventas / POS](./modulos/ventas.md)
- [Compras](./modulos/compras.md)
- [Inventario](./modulos/inventario.md)
- [Caja](./modulos/caja.md)
- [Cotizaciones](./modulos/cotizaciones.md)
- [Devoluciones](./modulos/devoluciones.md)
- [Cuentas por Cobrar](./modulos/cuentas-cobrar.md)
- [Cuentas por Pagar](./modulos/cuentas-pagar.md)
- [Productos](./modulos/productos.md)
- [Usuarios](./modulos/usuarios.md)
- [Reportes](./modulos/reportes.md)
- [Configuración](./modulos/configuracion.md)

### API REST
- [Contratos de API](./api/contratos-api.md)

### Pruebas
- [Plan de pruebas](./pruebas/plan-pruebas.md)
- [Trazabilidad](./pruebas/trazabilidad.md)
- [Cobertura](./pruebas/cobertura.md)

### Despliegue
- [Railway](./despliegue/railway.md)
