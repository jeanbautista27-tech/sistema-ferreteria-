# 07 — Arquitectura del Sistema

**Versión:** 1.0 | **Estado:** Implementado y verificado

---

## Patrón arquitectónico

**SPA + REST API** — tres capas desacopladas con comunicación exclusiva via HTTP/JSON.

```
React SPA (Vite)  ←→  Express REST API  ←→  MySQL (Sequelize)
  Railway           Railway               Railway MySQL
```

---

## Stack tecnológico real

### Backend
- Node.js LTS + Express 4.18.3
- Sequelize 6.37.1 (ORM, underscored: true)
- MySQL 8 (driver: mysql2 3.9.3)
- JWT 9.0.2 + bcryptjs 2.4.3
- helmet 8.0.0 + compression 1.7.4 + express-rate-limit 7.4.1
- multer 1.4.5 + exceljs 4.4.0 + pdfkit 0.15.0

### Frontend
- React 18.2.0 + Vite 5.2.0
- React Router DOM 6.22.3
- Zustand 4.5.2 (persist en localStorage)
- Axios 1.6.8 (interceptores JWT + redirect 401)
- Chart.js 4.4.2 + react-chartjs-2

### Testing
- Jest 30.4.2 + Supertest 7.2.2

---

## Estructura del backend

```
server/src/
├── app.js            ← Punto de entrada (middlewares + rutas + listen)
├── config/db.js      ← Sequelize con DB_PORT dinámico + SSL opcional
├── middlewares/
│   └── auth.js       ← verifyToken + requireAdmin + requireRole
├── models/           ← 23 modelos Sequelize + index.js (asociaciones)
├── controllers/      ← 18 controllers (lógica de negocio)
└── routes/           ← 18 archivos de rutas con middlewares por endpoint
```

---

## Flujo de una petición autenticada

```
POST /api/ventas
  ↓ helmet() — cabeceras seguridad
  ↓ compression() — gzip
  ↓ cors() — verifica FRONTEND_URL
  ↓ express.json() — parsea body
  ↓ Router /api/ventas
  ↓ verifyToken() — valida JWT en Authorization header
  ↓ requireRole('Administrador','Cajero') — verifica rol
  ↓ ventasController.create() — lógica de negocio + transacción
  ↓ Sequelize → MySQL — escritura atómica
  ↓ res.status(201).json({ ok: true, venta })
```

---

## Middlewares de autenticación

```js
// auth.js — tres funciones exportadas

verifyToken      // Verifica JWT. 401 si falta o inválido.
requireAdmin     // Solo Administrador. 403 si rol ≠ Administrador.
requireRole(...) // Lista de roles. 403 si req.user.rol no está en la lista.
```

---

## Control de acceso por módulo

| Módulo | Lectura | Escritura |
| --- | --- | --- |
| Auth | Público | — |
| Ventas | Admin + Cajero | Admin + Cajero |
| Compras (crear) | Admin + Almacenero | **Solo Admin** |
| Compras (recibir) | Admin + Almacenero | Admin + Almacenero |
| Productos (lectura) | Todos | — |
| Productos (escritura) | — | Admin + Almacenero |
| Inventario | Admin + Almacenero | Admin + Almacenero |
| Caja | Admin + Cajero | Admin + Cajero |
| CxC | Admin + Cajero | Admin + Cajero |
| CxP | **Solo Admin** | **Solo Admin** |
| Reportes | **Solo Admin** | — |
| Usuarios | **Solo Admin** | **Solo Admin** |
| Configuración (lectura) | Todos | — |
| Configuración (escritura) | — | **Solo Admin** |

---

## Estructura del frontend

```
client/src/
├── api/axios.js        ← Instancia Axios + interceptores
├── store/authStore.js  ← Zustand persist (token + usuario)
├── routes/ProtectedRoute.jsx ← Guard: redirige /login
├── components/
│   ├── layout/Sidebar.jsx    ← Menú filtrado por usuario.rol
│   └── layout/MainLayout.jsx ← Outlet
├── pages/              ← 19 páginas (una por módulo)
└── utils/formatDate.js ← Normaliza fechas MySQL (espacio → T ISO)
```

---

## Configuración dual Vite

| Entorno | Base URL | Observación |
| --- | --- | --- |
| Desarrollo | `/api` | Proxy Vite → localhost:3002 |
| Producción | `VITE_API_URL/api` | Embebida en el build |
| Preview | Puerto `$PORT` | `allowedHosts: true` para Railway |

---

## Base de datos

- **Motor:** MySQL 8 (Railway managed)
- **Charset:** utf8mb4
- **Timezone:** -05:00 (Lima)
- **Pool:** max 10, acquire 30s, idle 10s
- **Puerto:** `DB_PORT || MYSQLPORT || 3306`
- **SSL:** opcional via `DB_SSL=true`
- **Tablas:** 23
- **Soft delete:** `activo = 0` en entidades maestras
