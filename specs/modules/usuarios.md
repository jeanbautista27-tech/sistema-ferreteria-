# Especificación — Módulo: Usuarios

**Versión:** 1.0 | **Sprint:** 1 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Gestionar el ciclo de vida de los usuarios del sistema: creación, consulta, actualización y desactivación, manteniendo la integridad referencial mediante eliminación lógica y garantizando que las contraseñas siempre se almacenen cifradas.

---

## Descripción funcional

Permite al Administrador mantener el directorio de usuarios activos del sistema. Cada usuario tiene un rol asignado (Administrador, Almacenero o Cajero) que determina su acceso a los módulos. La eliminación es lógica (`activo = 0`).

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-02.1 | Listar todos los usuarios con su rol (sin password_hash) | `usuariosController.getAll` |
| RF-02.2 | Listar roles disponibles | `usuariosController.getRoles` |
| RF-02.3 | Crear usuario validando email único | `usuariosController.create` |
| RF-02.4 | Hash bcrypt al crear usuario | `bcrypt.hash(password, 10)` |
| RF-02.5 | Actualizar usuario; si incluye password, hashearla | `usuariosController.update` |
| RF-02.6 | Soft delete (`activo = 0`) | `usuariosController.remove` |

---

## Historias de usuario relacionadas

- **HU-02:** Como administrador, quiero crear y gestionar usuarios con diferentes roles.

---

## Criterios de aceptación

```
CA-USR-01
DADO que el admin envía nombre, email, password y rol_id válidos
CUANDO hace POST /api/usuarios
ENTONCES responde HTTP 201 con { ok: true, msg: 'Usuario creado', usuario: { id, nombre, email } }
  Y el password_hash en BD comienza con '$2a$10$'

CA-USR-02
DADO que el admin envía un email ya registrado
CUANDO hace POST /api/usuarios
ENTONCES responde HTTP 400 con { ok: false, msg: 'El email ya está registrado' }

CA-USR-03
DADO que el admin omite nombre, email, password o rol_id
CUANDO hace POST /api/usuarios
ENTONCES responde HTTP 400 con { ok: false, msg: 'Todos los campos son requeridos' }

CA-USR-04
DADO que el admin envía una nueva contraseña al editar
CUANDO hace PUT /api/usuarios/:id
ENTONCES la contraseña se hashea y el campo password_hash se actualiza; nunca se almacena texto plano

CA-USR-05
DADO que el admin elimina un usuario
CUANDO hace DELETE /api/usuarios/:id
ENTONCES responde HTTP 200 con { ok: true, msg: 'Usuario desactivado' }
  Y usuario.activo = 0 en BD (no se borra físicamente)
```

---

## Reglas de negocio

1. Solo el Administrador puede gestionar usuarios (`requireAdmin`).
2. El email debe ser único en la tabla `usuarios`.
3. El campo `password` del request nunca llega a la BD — siempre se hashea antes.
4. Al actualizar, si no se envía `password`, el hash existente se preserva.
5. Los usuarios desactivados no pueden autenticarse (consulta login filtra `activo: 1`).

---

## Dependencias

- `bcryptjs` 2.4.3
- Modelos: `Usuario`, `Rol`
- Middleware: `requireAdmin`

---

## Endpoints involucrados

| Método | Ruta | Roles |
| --- | --- | --- |
| GET | `/api/usuarios` | Admin |
| GET | `/api/usuarios/roles` | Admin |
| POST | `/api/usuarios` | Admin |
| PUT | `/api/usuarios/:id` | Admin |
| DELETE | `/api/usuarios/:id` | Admin |

---

## Modelos Sequelize utilizados

- `Usuario` — `findAll`, `findByPk`, `findOne`, `create`, `update`
- `Rol` — `findAll` (listar roles), incluido en `findAll` de usuarios

---

## Controladores relacionados

- `server/src/controllers/usuariosController.js` — `getAll`, `getRoles`, `create`, `update`, `remove`
- `server/src/routes/usuariosRoutes.js` — aplica `requireAdmin` en todas las rutas

---

## Componentes React relacionados

- `client/src/pages/Usuarios.jsx`
- `client/src/components/layout/Sidebar.jsx` — muestra módulo solo a Administrador

---

## Pruebas unitarias existentes

**Archivo:** `server/tests/controllers/usuariosController.test.js` (14 pruebas)

| Test | Escenario |
| --- | --- |
| `200 retorna lista sin password_hash` | CA-USR-01 lectura |
| `200 retorna lista de roles` | RF-02.2 |
| `400 cuando faltan campos obligatorios` | CA-USR-03 |
| `400 cuando email ya está registrado` | CA-USR-02 |
| `201 crea usuario con password hasheada` | CA-USR-01 |
| `404 usuario no encontrado (update)` | Error path |
| `200 actualiza sin cambiar contraseña` | CA-USR-04 |
| `200 actualiza hasheando nueva contraseña` | CA-USR-04 |
| `404 usuario no encontrado (remove)` | Error path |
| `200 desactiva usuario (soft delete)` | CA-USR-05 |

---

## Pruebas de integración existentes

No tiene suite propia. Cubierto parcialmente por `auth.integration.test.js` (token con rol Administrador).

---

## Impacto sobre otros módulos

- **Auth:** Los usuarios desactivados no pueden hacer login.
- **Ventas / Compras / Caja:** `usuario_id` en transacciones referencia esta tabla.
- **AuditLog:** `usuario_id` en logs referencia esta tabla.

---

## Observaciones

- El listado de usuarios excluye `password_hash` mediante `attributes: { exclude: ['password_hash'] }`.
- Al eliminar un usuario con `activo=0`, sus transacciones históricas (ventas, compras, etc.) se preservan con la referencia al usuario.
