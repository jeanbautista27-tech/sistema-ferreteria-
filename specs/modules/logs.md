# Especificación — Módulo: Logs de Auditoría

**Versión:** 1.0 | **Sprint:** 4 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Proveer trazabilidad de las acciones realizadas en el sistema. Actualmente registra automáticamente los eventos de login. Permite al Administrador consultar el historial de auditoría.

---

## Descripción funcional

Los logs se crean automáticamente por el sistema (no por el usuario). El módulo expone un único endpoint de lectura que retorna los últimos 200 logs con información del usuario que los generó.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-LOG-01 | Listar los últimos 200 logs ordenados por fecha desc | `findAll({ limit: 200, order: [['created_at','DESC']] })` |
| RF-LOG-02 | Incluir datos del usuario: id, nombre, email | `include: [{ model: Usuario, attributes: ['id','nombre','email'] }]` |
| RF-LOG-03 | Crear log en cada login exitoso | `authController.login → AuditLog.create({ accion: 'LOGIN' })` |

---

## Criterios de aceptación

```
CA-LOG-01
DADO GET /api/logs (Admin)
ENTONCES HTTP 200 + { ok: true, logs: [ { id, usuario_id, accion, tabla_afectada, ip, created_at, usuario: {...} } ] }
```

---

## Endpoints | Modelos | Controller | Tests

- **Endpoint:** GET `/api/logs`
- **Roles:** Solo Admin
- **Modelos:** `AuditLog`, `Usuario`
- **Controller:** `logController.js` — `getAll`
- **Test unitario:** No tiene suite propia (logController sin tests aún)
- **Componente React:** `client/src/pages/Logs.jsx`

---

## Observaciones

- El módulo `Mantenimiento` fue eliminado del sistema — los logs son el único rastro de auditoría disponible.
- Las acciones registradas actualmente: solo `'LOGIN'`. En versiones futuras se puede extender a `'CREAR'`, `'MODIFICAR'`, `'ELIMINAR'`.
- `logController.js` no tiene prueba unitaria propia — es el único controller sin cobertura.
