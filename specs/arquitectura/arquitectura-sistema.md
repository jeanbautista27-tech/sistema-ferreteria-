# Especificación de Arquitectura del Sistema

**ID:** ARCH-001
**Versión:** 1.0
**Estado:** Implementado y verificado en producción

---

## 1. Visión general

El sistema es un **ERP web de tres capas desacopladas** para la gestión integral
de una ferretería. Implementa el patrón **SPA + REST API** con separación estricta
de responsabilidades.

```
┌─────────────────────────────────────────────────────┐
│          CAPA DE PRESENTACIÓN — React 18 + Vite 5   │
│  SPA — Single Page Application                      │
│  Estado global: Zustand (authStore)                  │
│  HTTP Client: Axios con interceptores JWT            │
│  URL Prod: successful-grace-production-b275.up...    │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / JSON
                       ▼
┌─────────────────────────────────────────────────────┐
│         CAPA DE NEGOCIO — Node.js + Express 4       │
│  Patrón: MVC (Routes → Middlewares → Controllers)   │
│  Seguridad: helmet + CORS + rate-limit + JWT        │
│  URL Prod: sistema-ferreteria-production-ffd7.up... │
└──────────────────────┬──────────────────────────────┘
                       │ Sequelize ORM (pool: max 10)
                       ▼
┌─────────────────────────────────────────────────────┐
│              CAPA DE DATOS — MySQL 8                │
│  Servicio: Railway MySQL (managed)                  │
│  BD: railway (producción)                           │
│  Zona horaria: -05:00 (Lima, Perú)                  │
│  Tablas: 23 · Charset: utf8mb4                      │
└─────────────────────────────────────────────────────┘
```

---

## 2. Patrón MVC aplicado al backend

### Distribución de responsabilidades

| Capa | Artefacto | Responsabilidad |
| --- | --- | --- |
| **Ruta** | `src/routes/*.js` (18 archivos) | Registrar endpoints, aplicar middlewares |
| **Middleware** | `src/middlewares/auth.js` | Autenticar y autorizar por rol |
| **Controller** | `src/controllers/*.js` (18 archivos) | Lógica de negocio, validaciones, transacciones |
| **Modelo** | `src/models/*.js` (23 archivos) | Estructura de datos, asociaciones ORM |
| **Config** | `src/config/db.js` | Conexión Sequelize con soporte Railway |

### Flujo de una petición

```
HTTP Request
    ↓
helmet() — cabeceras de seguridad
    ↓
compression() — gzip
    ↓
cors() — validación de origen (FRONTEND_URL en prod)
    ↓
rateLimit() — solo /api/auth (10 req / 15 min)
    ↓
express.json() — parse body
    ↓
Router (/api/modulo)
    ↓
verifyToken() — valida JWT
    ↓
requireRole(...) — valida rol
    ↓
Controller.funcion() — lógica de negocio
    ↓
Sequelize Model — consulta/escritura BD
    ↓
res.json({ ok: true/false, ... })
```

---

## 3. Arquitectura del frontend

### Estructura de módulos React

```
src/
├── api/axios.js          — Instancia Axios + interceptores JWT + redirect 401
├── store/authStore.js    — Zustand con persist (localStorage: 'ferreteria-auth')
├── routes/ProtectedRoute — Guard: redirige a /login si !isAuthenticated
├── components/
│   ├── layout/Sidebar    — Menú filtrado por usuario.rol
│   └── layout/MainLayout — Outlet con Sidebar + Header
├── pages/                — 19 páginas (una por módulo)
└── utils/formatDate.js   — Normaliza fechas MySQL (espacio → T ISO)
```

### Gestión del estado de autenticación

```js
// authStore.js — Zustand persist
{ token, usuario: { id, nombre, email, rol }, isAuthenticated }

// axios.js — Interceptor de request
config.headers.Authorization = `Bearer ${useAuthStore.getState().token}`

// axios.js — Interceptor de response (401)
useAuthStore.getState().logout()
window.location.href = '/login'
```

### Configuración dual dev/prod — `vite.config.js`

```
Desarrollo:  /api → proxy → http://localhost:3002
Producción:  VITE_API_URL/api → bundle con VITE_API_URL embebida
Preview:     allowedHosts: true, port: process.env.PORT
```

---

## 4. Seguridad implementada

| Capa | Mecanismo | Configuración |
| --- | --- | --- |
| Cabeceras HTTP | `helmet()` | X-Frame-Options, CSP, HSTS |
| CORS | Dinámico | `FRONTEND_URL` en prod / `localhost:5173` en dev |
| Rate limiting | `express-rate-limit` | 10 req / 15 min sobre `/api/auth` |
| Autenticación | JWT `jsonwebtoken` | `JWT_SECRET` (≥64 chars), `JWT_EXPIRES_IN=8h` |
| Contraseñas | `bcryptjs` | Hash con salt rounds = 10 |
| Autorización | `requireRole(...roles)` | Granular por endpoint y método HTTP |
| Errores | Global error handler | Sin stack trace en `NODE_ENV=production` |
| Secrets | Variables de entorno | `.env` en `.gitignore`, `.env.example` en repo |

---

## 5. Modelo de datos — resumen

### 23 modelos Sequelize agrupados por dominio

```
SEGURIDAD          Rol · Usuario · AuditLog
CATÁLOGO           Categoria · Proveedor · Producto
CLIENTES           Cliente
VENTAS             Venta · DetalleVenta
COMPRAS            Compra · DetalleCompra
COTIZACIONES       Cotizacion · DetalleCotizacion
DEVOLUCIONES       Devolucion · DetalleDevolucion
INVENTARIO         InventarioMovimiento
CAJA               Caja · CajaEgreso
CRÉDITOS           CuentaCobrar · AbonoCuenta · CuentaPagar · AbonoPagar
SISTEMA            Configuracion
```

### Convenciones de modelo

- `underscored: true` — columnas `snake_case` en BD, serialización `camelCase` en JSON
- `timestamps: true` — `created_at` / `updated_at` en todas las tablas
- Soft delete — `activo: 0` en entidades maestras (no se borra físicamente)
- Transacciones — operaciones multitabla usan `sequelize.transaction()` con rollback

---

## 6. Verificación de la arquitectura

La arquitectura es verificable mediante:

```bash
# Verificar que el servidor arranca y conecta a BD
GET /api/health → { "ok": true, "env": "production" }

# Verificar que 290 pruebas validan la implementación
cd server && npm test
# → Test Suites: 22 passed · Tests: 290 passed
```
