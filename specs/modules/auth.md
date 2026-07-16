# Especificación — Módulo: Autenticación (auth)

**Versión:** 1.0 | **Sprint:** 1 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Gestionar el acceso seguro al sistema mediante autenticación basada en JWT,
control de credenciales con hash bcrypt, protección contra fuerza bruta y
trazabilidad de sesiones mediante logs de auditoría.

---

## Descripción funcional

El módulo de autenticación expone dos endpoints:
- `POST /api/auth/login` — valida credenciales, genera JWT y registra log de auditoría.
- `GET /api/auth/me` — retorna los datos del usuario autenticado a partir del token.

El módulo también provee los middlewares `verifyToken`, `requireAdmin` y `requireRole`
que protegen todas las demás rutas del sistema.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-01.1 | Login con email y contraseña | `authController.login` |
| RF-01.2 | Contraseñas almacenadas con bcrypt (cost 10) | `bcrypt.compare(password, usuario.password_hash)` |
| RF-01.3 | JWT con payload `{id, nombre, email, rol}` | `jwt.sign(...)` |
| RF-01.4 | Todas las rutas protegidas validan JWT | `verifyToken` middleware |
| RF-01.5 | Rutas admin requieren rol `Administrador` | `requireAdmin` middleware |
| RF-01.6 | Máximo 10 intentos de login por IP en 15 min | `rateLimit` en `app.js` sobre `/api/auth` |
| RF-01.7 | Registro de audit log en cada login exitoso | `AuditLog.create({ accion: 'LOGIN' })` |
| RF-01.8 | Actualización de `ultimo_login` al autenticarse | `usuario.update({ ultimo_login: new Date() })` |

---

## Requerimientos no funcionales

| ID | Descripción |
| --- | --- |
| RNF-01 | Contraseñas nunca en texto plano — solo hash bcrypt |
| RNF-02 | JWT_SECRET de mínimo 64 caracteres aleatorios |
| RNF-03 | Token expira según `JWT_EXPIRES_IN` (default 8h) |
| RNF-04 | Stack trace oculto en producción en errores 500 |

---

## Historias de usuario relacionadas

- **HU-01:** Como administrador, quiero iniciar sesión con email y contraseña para acceder al sistema.

---

## Criterios de aceptación

```
CA-AUTH-01
DADO que el usuario envía email y contraseña válidos
CUANDO hace POST /api/auth/login
ENTONCES responde HTTP 200 con { ok: true, token: "eyJ...", usuario: { id, nombre, email, rol } }
  Y actualiza usuario.ultimo_login
  Y crea registro en audit_logs con accion='LOGIN'

CA-AUTH-02
DADO que el usuario envía email o password vacío
CUANDO hace POST /api/auth/login
ENTONCES responde HTTP 400 con { ok: false, msg: 'Email y contraseña requeridos' }

CA-AUTH-03
DADO que el usuario envía credenciales incorrectas (usuario no existe o contraseña inválida)
CUANDO hace POST /api/auth/login
ENTONCES responde HTTP 401 con { ok: false, msg: 'Credenciales incorrectas' }

CA-AUTH-04
DADO que el usuario ya realizó 10 intentos en 15 minutos desde la misma IP
CUANDO hace POST /api/auth/login una vez más
ENTONCES responde HTTP 429 con mensaje de rate limit

CA-AUTH-05
DADO que el cliente no envía el header Authorization
CUANDO hace GET a cualquier ruta protegida
ENTONCES responde HTTP 401 con { ok: false, msg: 'Token no proporcionado' }

CA-AUTH-06
DADO que el cliente envía un token expirado o inválido
CUANDO hace GET a cualquier ruta protegida
ENTONCES responde HTTP 401 con { ok: false, msg: 'Token inválido o expirado' }

CA-AUTH-07
DADO que el usuario autenticado envía un token válido con rol != 'Administrador'
CUANDO accede a una ruta protegida con requireAdmin
ENTONCES responde HTTP 403 con { ok: false, msg: 'Acceso denegado...' }

CA-AUTH-08
DADO que el usuario tiene un token válido
CUANDO hace GET /api/auth/me
ENTONCES responde HTTP 200 con { ok: true, usuario: { id, nombre, email, rol, ... } } sin password_hash
```

---

## Reglas de negocio

1. Solo usuarios con `activo = 1` pueden autenticarse (`where: { email, activo: 1 }`).
2. El mensaje de error de credenciales es genérico (`'Credenciales incorrectas'`) tanto si el usuario no existe como si la contraseña es incorrecta — evita enumeración de usuarios.
3. El payload del JWT incluye exactamente: `{ id, nombre, email, rol }`.
4. El middleware `verifyToken` extrae el token del header `Authorization: Bearer <token>`.
5. `requireRole(...roles)` acepta múltiples roles: pasa si `rolesPermitidos.includes(req.user.rol)`.

---

## Dependencias

- `jsonwebtoken` 9.0.2
- `bcryptjs` 2.4.3
- `express-rate-limit` 7.4.1
- Modelos: `Usuario`, `Rol`, `AuditLog`

---

## Endpoints involucrados

| Método | Ruta | Auth | Roles |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | ❌ Público | — |
| GET | `/api/auth/me` | ✅ verifyToken | Todos |

---

## Modelos Sequelize utilizados

| Modelo | Uso |
| --- | --- |
| `Usuario` | `findOne({ where: { email, activo: 1 }, include: [Rol] })` |
| `Rol` | Incluido en la consulta de usuario para obtener `rol.nombre` |
| `AuditLog` | `create({ accion: 'LOGIN', usuario_id, ip })` |

---

## Controladores relacionados

- `server/src/controllers/authController.js` — funciones: `login`, `me`
- `server/src/middlewares/auth.js` — funciones: `verifyToken`, `requireAdmin`, `requireRole`

---

## Componentes React relacionados

- `client/src/pages/Login.jsx` — formulario de login
- `client/src/store/authStore.js` — almacena `{ token, usuario }` en localStorage
- `client/src/api/axios.js` — interceptor adjunta `Authorization: Bearer <token>` en cada request
- `client/src/routes/ProtectedRoute.jsx` — guard que verifica `isAuthenticated`

---

## Pruebas unitarias existentes

**Archivo:** `server/tests/controllers/authController.test.js` (9 pruebas)
**Archivo:** `server/tests/middlewares/auth.test.js` (8 pruebas)

| Test | Escenario verificado |
| --- | --- |
| `400 cuando no se envía email ni password` | CA-AUTH-02 |
| `400 cuando falta el password` | CA-AUTH-02 |
| `400 cuando falta el email` | CA-AUTH-02 |
| `401 cuando el usuario no existe` | CA-AUTH-03 |
| `401 cuando la contraseña es incorrecta` | CA-AUTH-03 |
| `200 con token cuando credenciales correctas` | CA-AUTH-01 |
| `500 error inesperado` | Error handler |
| `404 cuando usuario del token no existe (me)` | CA-AUTH-08 |
| `200 con datos del usuario (me)` | CA-AUTH-08 |
| `401 sin header Authorization` | CA-AUTH-05 |
| `401 token inválido` | CA-AUTH-06 |
| `403 requireAdmin con rol != Administrador` | CA-AUTH-07 |
| `403 requireAdmin sin req.user` | CA-AUTH-07 |

---

## Pruebas de integración existentes

**Archivo:** `server/tests/integration/auth.integration.test.js` (11 pruebas)

| Suite | Pruebas |
| --- | --- |
| `POST /api/auth/login` | 200 token, 400 sin email, 400 sin password, 401 no existe, 401 contraseña incorrecta, 500 BD falla |
| `GET /api/auth/me` | 401 sin header, 401 formato inválido, 401 token expirado, 200 token válido, 404 usuario no existe |

---

## Impacto sobre otros módulos

Este módulo es la **puerta de entrada a todo el sistema**. Los middlewares
`verifyToken` y `requireRole` son utilizados por los 18 módulos restantes.
Cualquier cambio en el payload del JWT (campos) afecta a todos los módulos
que lean `req.user.id`, `req.user.rol` o `req.user.nombre`.

---

## Observaciones

- El rate limiting se configura en `app.js` (`loginLimiter`) y se aplica solo sobre `/api/auth`.
- En producción, el `JWT_SECRET` debe tener mínimo 64 caracteres aleatorios.
- El campo `activo: 1` en la consulta de login impide el acceso a usuarios desactivados.
