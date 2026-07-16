# 12 — Reglas SDD del Proyecto

**Sistema:** Sistema de Gestión para Ferretería
**Documento:** RULES_SDD
**Versión:** 2.0
**Última actualización:** Julio 2026
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

---

## FLUJO OBLIGATORIO DE MODIFICACIONES

> **A partir de la versión 2.0 de este documento, toda modificación futura
> del sistema — sin excepción — debe seguir este flujo de 8 pasos en orden.**

### Principio central

```
Ningún cambio al código es válido si la especificación no lo precede.
Ninguna especificación es válida si no tiene pruebas que la verifiquen.
```

---

### PASO 1 — Actualizar la especificación

**¿Qué hacer?**
Abrir el archivo de especificación del módulo afectado en `/specs/modules/<modulo>.md`
y documentar el cambio antes de escribir una sola línea de código.

**¿Qué actualizar?**
- Incrementar el número de versión del documento (`**Versión:** X.X → X.X+1`)
- Actualizar o agregar los requerimientos funcionales afectados (RF-XX)
- Actualizar o agregar los criterios de aceptación en formato DADO/CUANDO/ENTONCES
- Actualizar las reglas de negocio si cambian
- Actualizar la sección de endpoints si el contrato de la API cambia
- Actualizar la sección de modelos si el schema de BD cambia

**Archivos que pueden requerir actualización adicional:**
- `02_Requerimientos.md` — si se agrega o modifica un RF
- `07_Arquitectura.md` — si cambia la arquitectura, middlewares o control de acceso
- `08_Base_Datos.md` — si se modifica algún modelo Sequelize
- `09_API_REST.md` — si cambia algún endpoint (método, ruta, roles)
- `11_Despliegue.md` — si cambian variables de entorno o configuración de Railway

**Commit de especificación:**
```bash
git commit -m "spec: actualizar <modulo> — <descripción breve del cambio>"
```

---

### PASO 2 — Actualizar la Historia de Usuario

**¿Qué hacer?**
Abrir `03_Historias_Usuario.md` y verificar si la modificación:

- **Afecta una HU existente:** actualizar su descripción o criterios de aceptación.
- **Requiere una nueva HU:** agregar una fila con el siguiente ID disponible (HU-XX).
- **No requiere cambio en HU:** documentar la razón (ej: "cambio técnico interno sin impacto en comportamiento del usuario").

**Campos a actualizar en la tabla:**
```
| ID | Rol | Historia | Criterios de aceptación clave | Story Points | Estado |
```

**Estado válido tras la modificación:** `🔄 En progreso` hasta completar el flujo completo.

---

### PASO 3 — Actualizar el Product Backlog

**¿Qué hacer?**
Abrir `04_Product_Backlog.md` y agregar o modificar el ítem correspondiente.

- Si es una **nueva funcionalidad:** agregar al backlog con prioridad, HU vinculada, módulo, SP estimados y estado `🔄 En progreso`.
- Si es una **corrección o mejora:** actualizar el estado del ítem existente.
- Si es un **bug fix:** agregar como ítem con prefijo `[BUG]` y prioridad alta.

**Regla:** Ningún ítem puede pasar a `✅ Done` sin haber completado los 8 pasos de este flujo.

---

### PASO 4 — Actualizar el Sprint

**¿Qué hacer?**
Abrir `05_Sprint_Planning.md` e identificar el sprint activo o crear un nuevo sprint si corresponde.

- Agregar el ítem al sprint con su estimación en Story Points.
- Si el sprint actual está cerrado, crear una nueva entrada `Sprint N+1`.
- Actualizar el resumen de Story Points del sprint afectado.

**Formato de entrada en el sprint:**
```markdown
| N | HU-XX | Descripción del cambio | Módulo | SP | Sprint N | Estado |
```

---

### PASO 5 — Identificar el impacto

**¿Qué hacer?**
Antes de modificar el código, analizar qué otros módulos se ven afectados.

**Checklist de impacto:**

```
[ ] ¿El cambio modifica algún endpoint existente? → actualizar 09_API_REST.md
[ ] ¿El cambio modifica algún modelo Sequelize?   → actualizar 08_Base_Datos.md
[ ] ¿El cambio afecta el control de acceso?       → actualizar 07_Arquitectura.md
[ ] ¿El cambio afecta el flujo de caja?           → verificar módulo caja.md
[ ] ¿El cambio afecta el stock?                   → verificar módulo inventario.md
[ ] ¿El cambio afecta alguna transacción?         → verificar rollback en tests
[ ] ¿El cambio requiere nueva variable de entorno?→ actualizar 11_Despliegue.md
[ ] ¿El cambio requiere migración de BD?          → documentar en 08_Base_Datos.md
```

**Documentar el impacto** en la sección "Impacto sobre otros módulos" del spec
del módulo modificado.

**Actualizar `06_Matriz_Trazabilidad.md`** con la nueva fila o fila modificada:

```
| RF-XX | HU-XX | Sprint N | Módulo | Endpoint | React | Modelo | Controller | Test | Integración | ✅/🔄 |
```

---

### PASO 6 — Actualizar el código

**¿Qué hacer?**
Solo después de completar los pasos 1 al 5, modificar el código fuente.

**Orden recomendado de modificación:**
1. Modelo Sequelize (si cambia el schema)
2. Controller (lógica de negocio)
3. Ruta (si cambia el endpoint o sus middlewares)
4. Componente React (si cambia la interfaz)
5. Utilidades (`formatDate.js`, `authStore.js`, etc.) si corresponde

**Restricciones absolutas:**

```
❌ NO modificar el código de producción sin spec actualizada (Paso 1)
❌ NO eliminar archivos de código sin documentarlo en la spec
❌ NO cambiar el schema de BD en Railway sin documentarlo en 08_Base_Datos.md
❌ NO alterar el flujo de autenticación sin actualizar auth.md y auth.test.js
❌ NO romper el despliegue en Railway
```

**Commit de código:**
```bash
git commit -m "feat: <descripción> (ref: RF-XX)"
# o
git commit -m "fix: <descripción> (ref: RF-XX)"
```

---

### PASO 7 — Actualizar las pruebas

**¿Qué hacer?**
Toda modificación de código debe estar respaldada por pruebas actualizadas o nuevas.

**Prueba unitaria:**
- Abrir `server/tests/controllers/<modulo>.test.js`
- Agregar o modificar el caso de prueba que valide el nuevo comportamiento
- El test debe verificar exactamente el criterio de aceptación definido en el Paso 1
- Ejecutar `npm test` y confirmar **0 fallos**

**Prueba de integración (si aplica):**
- Si el cambio afecta un flujo crítico (ventas, compras, auth, compras), actualizar
  el archivo correspondiente en `server/tests/integration/`

**Verificación de cobertura:**
```bash
cd server && npm run coverage
# Confirmar que la cobertura no bajó del mínimo:
# Statements ≥ 90% · Branches ≥ 85% · Functions ≥ 90% · Lines ≥ 90%
```

**Commit de pruebas:**
```bash
git commit -m "test: agregar/actualizar pruebas para <modulo> (ref: RF-XX)"
```

**Regla:** El ítem solo puede marcarse como `✅ Done` en el backlog cuando
`npm test` pasa al 100% sin fallos.

---

### PASO 8 — Actualizar el despliegue (si corresponde)

**¿Cuándo aplica este paso?**

| Tipo de cambio | ¿Requiere actualizar despliegue? |
| --- | --- |
| Nueva variable de entorno | ✅ Sí — actualizar en Railway y en `11_Despliegue.md` |
| Cambio de schema de BD | ✅ Sí — ejecutar migración en Railway Console |
| Nueva dependencia npm | ✅ Sí — Railway redespliega al hacer push |
| Cambio de lógica interna | ❌ No — Railway redespliega automáticamente |
| Cambio solo en el frontend | ❌ No — Railway redespliega automáticamente |

**Checklist de despliegue:**
```
[ ] Variables de entorno actualizadas en Railway si corresponde
[ ] Migración de BD ejecutada en Railway Console si hay cambios de schema
[ ] Push a master ejecutado (Railway autodespliega)
[ ] Health check verificado: GET /api/health → { ok: true }
[ ] Funcionalidad verificada en producción desde la URL de Railway
[ ] 11_Despliegue.md actualizado con los cambios
```

**Commit final (push a Railway):**
```bash
git push origin master
# Railway detecta el commit y redespliega automáticamente
```

---

### Diagrama del flujo completo

```
┌─────────────────────────────────────────────────────────────────┐
│              FLUJO SDD — MODIFICACIÓN DEL SISTEMA               │
└─────────────────────────────────────────────────────────────────┘

  SOLICITUD DE CAMBIO
         │
         ▼
  ┌─────────────┐
  │  PASO 1     │  Actualizar /specs/modules/<modulo>.md
  │  SPEC       │  + 02_Requerimientos.md si aplica
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  PASO 2     │  Actualizar 03_Historias_Usuario.md
  │  HU         │  (nueva o existente)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  PASO 3     │  Actualizar 04_Product_Backlog.md
  │  BACKLOG    │  (agregar ítem o actualizar estado)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  PASO 4     │  Actualizar 05_Sprint_Planning.md
  │  SPRINT     │  (asignar al sprint activo)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  PASO 5     │  Checklist de impacto
  │  IMPACTO    │  Actualizar 06_Matriz_Trazabilidad.md
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  PASO 6     │  Modificar código fuente
  │  CÓDIGO     │  (modelo → controller → ruta → frontend)
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  PASO 7     │  Actualizar/agregar pruebas
  │  PRUEBAS    │  npm test → 0 fallos ✅
  └──────┬──────┘
         │
         ▼
  ┌─────────────┐
  │  PASO 8     │  Si aplica: Railway, variables, BD
  │  DESPLIEGUE │  git push → Railway autodespliega
  └──────┬──────┘
         │
         ▼
  CAMBIO COMPLETADO ✅
  Ítem marcado como Done en el Backlog
```

---

### Resumen de comandos SDD

```bash
# Verificar que las pruebas pasan antes de cualquier push
cd server && npm test

# Verificar cobertura
cd server && npm run coverage

# Commit de spec (siempre el primero)
git commit -m "spec: actualizar <modulo> — <descripción>"

# Commit de código
git commit -m "feat/fix: <descripción> (ref: RF-XX)"

# Commit de pruebas
git commit -m "test: <descripción> (ref: RF-XX)"

# Push a producción (Railway autodespliega)
git push origin master

# Verificar despliegue
curl https://sistema-ferreteria-production-ffd7.up.railway.app/api/health
```

---

## Resumen de reglas (actualizado v2.0)

| # | Regla | Obligatorio |
| --- | --- | --- |
| 01 | Spec-First: toda funcionalidad inicia en `/specs` | ✅ |
| 02 | Sin código sin especificación actualizada | ✅ |
| 03 | Criterios de aceptación en formato DADO/CUANDO/ENTONCES | ✅ |
| 04 | Trazabilidad completa en `06_Matriz_Trazabilidad.md` | ✅ |
| 05 | Toda funcionalidad tiene pruebas automatizadas | ✅ |
| 06 | Convenciones de nomenclatura RF-XX / HU-XX / CA-XX | ✅ |
| 07 | Control de versiones en cada spec | ✅ |
| 08 | Proceso de cambio en 8 pasos obligatorios | ✅ |
| 09 | Roles y permisos siempre documentados | ✅ |
| 10 | Reglas de negocio son contratos verificados por tests | ✅ |
| 11 | Paso 1 (spec) siempre antes que Paso 6 (código) | ✅ |
| 12 | Paso 7 (pruebas) siempre antes que Paso 8 (despliegue) | ✅ |
