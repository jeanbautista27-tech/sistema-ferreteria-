# 12 — Reglas SDD del Proyecto

**Sistema:** Sistema de Gestión para Ferretería
**Documento:** RULES_SDD
**Versión:** 1.0
**Vigencia:** Obligatorio para todo el equipo de desarrollo

---

## Declaración de principios

Este proyecto sigue **Specification Driven Development (SDD)**. Las especificaciones
son el artefacto central del proceso: se crean antes del código, guían las pruebas,
y se mantienen actualizadas con cada cambio.

> **SDD no es documentación posterior al código.**
> **SDD es el contrato que el código debe cumplir.**

---

## REGLA 01 — Spec-First

**Toda nueva funcionalidad comienza en `/specs`, no en el código.**

Antes de escribir una sola línea de código, se debe:

1. Identificar o crear el archivo de especificación del módulo en `/specs/modules/`.
2. Documentar el objetivo, descripción funcional y requerimientos.
3. Definir los criterios de aceptación verificables.
4. Registrar las reglas de negocio.

**Violación:** Crear un controller, ruta o componente React sin especificación previa.

---

## REGLA 02 — Sin código sin especificación actualizada

**No se modifica código fuente sin antes actualizar la especificación correspondiente.**

Si se modifica:
- Un controller → actualizar el archivo `.md` correspondiente en `/specs/modules/`.
- Una ruta → actualizar `09_API_REST.md` y el módulo afectado.
- Un modelo Sequelize → actualizar `08_Base_Datos.md` y el módulo afectado.
- Un middleware → actualizar `07_Arquitectura.md`.
- Las variables de entorno → actualizar `11_Despliegue.md`.

---

## REGLA 03 — Criterios de aceptación obligatorios

**Toda especificación funcional debe tener criterios de aceptación verificables.**

Los criterios de aceptación deben:

- Ser concretos y medibles (no ambiguos).
- Describir el comportamiento esperado (HTTP status, campo de respuesta, estado de BD).
- Tener correspondencia con al menos un caso de prueba.

**Formato obligatorio:**

```
DADO [precondición]
CUANDO [acción]
ENTONCES [resultado esperado con código HTTP y estructura de respuesta]
```

---

## REGLA 04 — Trazabilidad completa

**Toda especificación debe ser trazable desde el requerimiento hasta el despliegue.**

Cada funcionalidad debe aparecer en la `06_Matriz_Trazabilidad.md` con:

| Campo | Obligatorio |
| --- | --- |
| ID de requerimiento | ✅ |
| Historia de usuario | ✅ |
| Sprint | ✅ |
| Módulo | ✅ |
| Endpoint API | ✅ |
| Componente React | ✅ |
| Modelo Sequelize | ✅ |
| Controller | ✅ |
| Prueba unitaria | ✅ |
| Prueba integración | Si aplica |
| Estado de despliegue | ✅ |

---

## REGLA 05 — Toda funcionalidad debe tener pruebas

**No se considera implementada una funcionalidad que no tenga pruebas automatizadas.**

### Pruebas unitarias (obligatorias)

- Deben existir en `server/tests/controllers/<modulo>.test.js`.
- Deben cubrir: escenario exitoso, validaciones 400, not found 404, error 500.
- Usan `jest.mock()` — sin conexión real a BD.
- Deben verificar el comportamiento exacto especificado en los criterios de aceptación.

### Pruebas de integración (para módulos críticos)

- Deben existir en `server/tests/integration/`.
- Ejercitan la cadena completa: HTTP → middleware → controller → respuesta.
- Usan `app-test.js` (Express sin `listen`) + `tokenHelper.js` + Supertest.
- Son obligatorias para: autenticación, ventas, compras y cualquier flujo transaccional.

### Cobertura mínima requerida

| Métrica | Mínimo |
| --- | --- |
| Statements | 90% |
| Branches | 85% |
| Functions | 90% |
| Lines | 90% |

---

## REGLA 06 — Convenciones de nomenclatura

### Archivos de especificación

```
specs/modules/<nombre-modulo>.md     → en minúsculas y guiones
specs/00_Vision.md                   → prefijo numérico para orden
```

### Identificadores de requerimiento

```
RF-XX     → Requerimiento Funcional (01, 02, 03...)
RNF-XX    → Requerimiento No Funcional
HU-XX     → Historia de Usuario
CA-XX-YY  → Criterio de Aceptación (módulo-número)
```

### Pruebas

```
describe('ModuloController › funcion', () => {
    test('HTTP_STATUS descripción del escenario', async () => { ... });
});
```

---

## REGLA 07 — Control de versiones de especificaciones

Cada archivo de especificación debe incluir en su encabezado:

```markdown
**Versión:** X.X
**Última actualización:** YYYY-MM-DD
**Estado:** Borrador | En revisión | Aprobado | Implementado | Verificado
```

Los estados válidos son:

| Estado | Significado |
| --- | --- |
| **Borrador** | En construcción, no revisado |
| **En revisión** | Pendiente de validación |
| **Aprobado** | Validado, listo para implementar |
| **Implementado** | Código escrito, pendiente de pruebas |
| **Verificado** | Pruebas pasando, desplegado en producción |

---

## REGLA 08 — Gestión de cambios

Cuando se requiere un cambio en una funcionalidad existente:

1. Actualizar el archivo de spec del módulo afectado.
2. Actualizar `06_Matriz_Trazabilidad.md`.
3. Actualizar o agregar pruebas que validen el nuevo comportamiento.
4. Verificar que `npm test` pasa al 100%.
5. Hacer commit con el mensaje: `spec: actualizar <modulo> — <descripción del cambio>`.
6. Hacer commit del código con: `feat/fix: <descripción> (ref: RF-XX)`.

---

## REGLA 09 — Roles y autorizaciones deben estar especificados

Cualquier restricción de acceso debe estar documentada en:

- `specs/07_Arquitectura.md` — sección de control de acceso.
- El archivo del módulo afectado — sección "Actores".
- La implementación en `server/src/routes/<modulo>Routes.js`.

No se acepta que un endpoint tenga una restricción de rol que no esté documentada.

---

## REGLA 10 — Reglas de negocio son contratos

Las reglas de negocio documentadas en las especificaciones son **contratos del sistema**.
Deben estar implementadas en el controller correspondiente y verificadas por pruebas.

Ejemplo de contrato especificado y verificado:

```
SPEC: Una venta al crédito requiere cliente_id obligatorio.
CODE: if (tipo_pago === 'Crédito' && !cliente_id) return 400
TEST: test('400 cuando venta al crédito no tiene cliente') → ✅
```

---

## Resumen de reglas

| # | Regla | Obligatorio |
| --- | --- | --- |
| 01 | Spec-First: toda funcionalidad inicia en `/specs` | ✅ |
| 02 | Sin código sin especificación actualizada | ✅ |
| 03 | Criterios de aceptación en formato DADO/CUANDO/ENTONCES | ✅ |
| 04 | Trazabilidad completa en `06_Matriz_Trazabilidad.md` | ✅ |
| 05 | Toda funcionalidad tiene pruebas automatizadas | ✅ |
| 06 | Convenciones de nomenclatura RF-XX / HU-XX / CA-XX | ✅ |
| 07 | Control de versiones en cada spec | ✅ |
| 08 | Proceso de cambio documentado | ✅ |
| 09 | Roles y permisos siempre documentados | ✅ |
| 10 | Reglas de negocio son contratos verificados por tests | ✅ |
