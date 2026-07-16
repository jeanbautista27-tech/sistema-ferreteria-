# Sistema de Gestión para Ferretería

Sistema web completo de gestión comercial para ferreterías, desarrollado con arquitectura cliente-servidor. Cubre el ciclo de negocio completo: ventas, compras, inventario, caja, cuentas por cobrar y pagar, cotizaciones, devoluciones y reportes financieros.

---

## Descripción del sistema

El sistema provee una interfaz web moderna para administrar de forma integral las operaciones de una ferretería. Permite controlar el inventario en tiempo real, gestionar el punto de venta (POS), registrar compras a proveedores, administrar clientes y proveedores, controlar la caja diaria, y generar reportes financieros exportables en Excel y PDF.

## Objetivo del sistema

Digitalizar y centralizar los procesos comerciales de una ferretería, eliminando el registro manual, reduciendo errores en el stock, mejorando el control de cobros y pagos, y proporcionando información financiera consolidada en tiempo real para la toma de decisiones.

---

## Tecnologías utilizadas

### Frontend

| Tecnología | Versión | Uso |
| --- | --- | --- |
| React | 18.2.0 | Librería de interfaz de usuario |
| Vite | 5.2.0 | Empaquetador y servidor de desarrollo |
| React Router DOM | 6.22.3 | Navegación entre páginas |
| Zustand | 4.5.2 | Gestión de estado global (autenticación) |
| Axios | 1.6.8 | Cliente HTTP para consumir la API |
| Chart.js + react-chartjs-2 | 4.4.2 | Gráficos del dashboard |
| Lucide React | 0.368.0 | Iconografía |
| React Hot Toast | 2.4.1 | Notificaciones |

### Backend

| Tecnología | Versión | Uso |
| --- | --- | --- |
| Node.js | LTS | Entorno de ejecución |
| Express | 4.18.3 | Framework HTTP REST API |
| Sequelize | 6.37.1 | ORM para base de datos |
| JSON Web Token | 9.0.2 | Autenticación stateless |
| bcryptjs | 2.4.3 | Hash de contraseñas |
| Multer | 1.4.5 | Carga de archivos (logo, imágenes) |
| ExcelJS | 4.4.0 | Exportación de reportes en Excel |
| PDFKit | 0.15.0 | Generación de reportes en PDF |
| helmet | 8.0.0 | Cabeceras HTTP de seguridad |
| compression | 1.7.4 | Compresión gzip de respuestas |
| express-rate-limit | 7.4.1 | Protección anti fuerza bruta en login |
| express-validator | 7.1.0 | Validación de entradas |
| dotenv | 16.4.5 | Variables de entorno |

### Base de datos

| Tecnología | Uso |
| --- | --- |
| MySQL | Motor de base de datos relacional |
| mysql2 | Driver Node.js para MySQL |

### Testing

| Tecnología | Versión | Uso |
| --- | --- | --- |
| Jest | 30.4.2 | Framework de pruebas unitarias e integración |
| Supertest | 7.2.2 | Pruebas de integración HTTP |
| cross-env | 10.1.0 | Variables de entorno multiplataforma |

### Herramientas de desarrollo

| Herramienta | Uso |
| --- | --- |
| Nodemon | Recarga automática del servidor en desarrollo |
| Git | Control de versiones |

---

## Roles y control de acceso

El sistema implementa tres roles con acceso diferenciado a los módulos:

| Módulo | Administrador | Almacenero | Cajero |
| --- | --- | --- | --- |
| Dashboard | ✅ | ✅ | ✅ |
| Punto de Venta | ✅ | ❌ | ✅ |
| Ventas | ✅ | ❌ | ✅ |
| Cotizaciones | ✅ | ❌ | ✅ |
| Devoluciones | ✅ | ❌ | ✅ |
| Clientes | ✅ | ❌ | ✅ |
| Caja | ✅ | ❌ | ✅ |
| Cuentas por Cobrar | ✅ | ❌ | ✅ |
| Productos | ✅ | ✅ | ❌ |
| Categorías | ✅ | ✅ | ❌ |
| Inventario | ✅ | ✅ | ❌ |
| Compras (registrar) | ✅ | ❌ | ❌ |
| Compras (recibir) | ✅ | ✅ | ❌ |
| Proveedores | ✅ | ✅ | ❌ |
| Cuentas por Pagar | ✅ | ❌ | ❌ |
| Reportes | ✅ | ❌ | ❌ |
| Usuarios | ✅ | ❌ | ❌ |
| Configuración | ✅ | ❌ | ❌ |
| Mantenimiento | ✅ | ❌ | ❌ |

### Credenciales de acceso por defecto

| Email | Contraseña | Rol |
| --- | --- | --- |
| `admin@ferreteria.com` | `admin123` | Administrador |
| `almacenero@ferreteria.com` | `almacenero123` | Almacenero |
| `cajero@ferreteria.com` | `cajero123` | Cajero |

> Las contraseñas deben cambiarse en el primer inicio de sesión en producción.

---

## Arquitectura del proyecto

El sistema sigue una arquitectura **cliente-servidor desacoplada (SPA + REST API)**:

```text
┌─────────────────────────────────────────────────────┐
│                   CLIENTE (React)                   │
│         http://localhost:5173                       │
│  ┌──────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │  Pages   │  │  Store   │  │  API (Axios)       │  │
│  │  (vistas)│  │ (Zustand)│  │  /api/* → proxy   │  │
│  └──────────┘  └──────────┘  └───────────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTP / JSON
                       ▼
┌─────────────────────────────────────────────────────┐
│               SERVIDOR (Express)                    │
│         http://localhost:3002                       │
│  ┌──────────────────────────────────────────────┐   │
│  │  helmet · compression · rate-limit · CORS    │   │
│  └──────────────────────────────────────────────┘   │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Routes   │→ │ verifyToken │→ │ Controllers │  │
│  │ /api/*     │  │ requireRole │  │  (lógica)   │  │
│  └────────────┘  └─────────────┘  └─────────────┘  │
└──────────────────────┬──────────────────────────────┘
                       │ Sequelize ORM
                       ▼
┌─────────────────────────────────────────────────────┐
│              BASE DE DATOS (MySQL)                  │
│               ferreteria_db / railway               │
└─────────────────────────────────────────────────────┘
```

**Flujo de autenticación:** El cliente obtiene un JWT en el login y lo envía en el header `Authorization: Bearer <token>` en cada petición. Los middlewares `verifyToken` y `requireRole` controlan el acceso por rol antes de llegar a cualquier controlador.

---

## Estructura de carpetas

```text
sistema-ferreteria/
│
├── client/                         # Frontend React + Vite
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Instancia Axios con interceptores JWT
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx  # Layout principal con sidebar
│   │   │   │   └── Sidebar.jsx     # Navegación filtrada por rol
│   │   │   ├── ui/
│   │   │   │   └── ConfirmModal.jsx
│   │   │   └── ventas/
│   │   │       ├── TicketVenta.jsx
│   │   │       └── TicketCotizacion.jsx
│   │   ├── hooks/
│   │   │   └── useBarcodeScanner.js # Hook para lector de código de barras
│   │   ├── pages/                  # Una página por módulo del sistema
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── POS.jsx
│   │   │   ├── Ventas.jsx
│   │   │   ├── Compras.jsx         # Nueva Compra solo visible para Administrador
│   │   │   ├── Productos.jsx       # Incluye filtro por categoría
│   │   │   ├── Inventario.jsx
│   │   │   ├── Caja.jsx
│   │   │   ├── Clientes.jsx
│   │   │   ├── Proveedores.jsx
│   │   │   ├── Categorias.jsx
│   │   │   ├── Cotizaciones.jsx
│   │   │   ├── CuentasCobrar.jsx
│   │   │   ├── CuentasPagar.jsx
│   │   │   ├── Devoluciones.jsx
│   │   │   ├── Reportes.jsx
│   │   │   ├── Usuarios.jsx
│   │   │   ├── Configuracion.jsx
│   │   │   ├── Logs.jsx
│   │   │   └── Mantenimiento.jsx
│   │   ├── routes/
│   │   │   └── ProtectedRoute.jsx  # Guard de rutas autenticadas
│   │   ├── store/
│   │   │   └── authStore.js        # Estado global de autenticación (Zustand)
│   │   ├── utils/
│   │   │   └── formatDate.js       # Utilidad centralizada para fechas MySQL
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js              # Proxy dinámico con VITE_API_URL
│   ├── .env.example                # Plantilla de variables de entorno
│   └── package.json
│
├── server/                         # Backend Node.js + Express
│   ├── src/
│   │   ├── app.js                  # Punto de entrada con helmet, compression, rate-limit
│   │   ├── config/
│   │   │   └── db.js               # Sequelize con DB_PORT dinámico y SSL opcional
│   │   ├── controllers/            # 19 controllers con lógica de negocio
│   │   ├── middlewares/
│   │   │   └── auth.js             # verifyToken + requireAdmin + requireRole
│   │   ├── models/                 # 24 modelos Sequelize + index con asociaciones
│   │   └── routes/                 # 19 rutas con control de acceso por rol
│   ├── tests/
│   │   ├── controllers/            # 17 archivos de pruebas unitarias
│   │   ├── middlewares/
│   │   │   └── auth.test.js        # Pruebas de verifyToken y requireAdmin
│   │   └── integration/            # 4 archivos de pruebas de integración
│   │       └── setup/
│   │           ├── app-test.js     # Express sin listen para Supertest
│   │           └── tokenHelper.js  # Generador de tokens JWT para tests
│   ├── coverage/                   # Reportes de cobertura (generado por Jest)
│   ├── uploads/                    # Archivos subidos (imágenes, logo)
│   ├── ecosystem.config.js         # Configuración PM2 para producción
│   ├── .env                        # Variables de entorno (no commitear)
│   ├── .env.example                # Plantilla de variables de entorno
│   ├── railway.json                # Configuración de despliegue en Railway
│   ├── jest.config.js
│   └── package.json
│
├── database/
│   ├── ferreteria_db.sql           # Schema completo de la base de datos
│   ├── ferreteria_db_railway.sql   # Schema limpio para Railway (sin CREATE DB)
│   ├── tablas_faltantes.sql        # Tablas adicionales para Railway
│   ├── datos_base.sql              # Datos base (roles, configuración, productos)
│   └── datos_prueba.sql            # Datos de ejemplo para desarrollo
│
├── scripts/
│   ├── 1_Instalar_Dependencias.bat
│   ├── 2_Configurar_Base_Datos.bat
│   └── 3_Iniciar_Sistema.bat
│
├── package.json                    # package.json raíz para Railway
├── nixpacks.toml                   # Configuración de build para Railway (si aplica)
└── README.md
```

---

## Requisitos previos

| Requisito | Versión mínima | Verificar con |
| --- | --- | --- |
| Node.js | 18.x o superior | `node --version` |
| npm | 9.x o superior | `npm --version` |
| MySQL | 8.0 o superior | `mysql --version` |
| Git | cualquier versión | `git --version` |

> El servidor MySQL debe estar corriendo y accesible en `localhost` antes de iniciar el backend.

---

## Instalación del proyecto

### Opción A — Scripts automáticos (Windows)

```bat
scripts\1_Instalar_Dependencias.bat
scripts\2_Configurar_Base_Datos.bat
scripts\3_Iniciar_Sistema.bat
```

### Opción B — Instalación manual

```bash
git clone https://github.com/jeanbautista27-tech/sistema-ferreteria-.git
cd sistema-ferreteria

cd server && npm install
cd ../client && npm install
```

---

## Configuración de la base de datos MySQL

```sql
CREATE DATABASE ferreteria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

mysql -u root -p ferreteria_db < database/ferreteria_db.sql
mysql -u root -p ferreteria_db < database/datos_base.sql

-- Opcional: datos de prueba para desarrollo
mysql -u root -p ferreteria_db < database/datos_prueba.sql
```

---

## Variables de entorno requeridas

Copiar `server/.env.example` a `server/.env` y completar:

```env
# Servidor
PORT=3002
NODE_ENV=production

# Base de datos MySQL
DB_HOST=localhost
DB_PORT=3306
DB_USER=<usuario_mysql>
DB_PASSWORD=<contraseña_mysql>
DB_NAME=ferreteria_db
DB_DIALECT=mysql
DB_SSL=false

# Autenticación JWT
JWT_SECRET=<clave_aleatoria_64_caracteres>
JWT_EXPIRES_IN=8h

# CORS — URL del frontend desplegado
FRONTEND_URL=http://localhost:5173

# Rate limiting
LOGIN_RATE_LIMIT_MAX=10
```

Copiar `client/.env.example` a `client/.env.production`:

```env
# URL base del backend desplegado (sin /api al final)
VITE_API_URL=https://api.tudominio.com
```

> Generar JWT_SECRET seguro: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## Instalación de dependencias

```bash
cd server && npm install
cd ../client && npm install
```

---

## Ejecución del backend

```bash
cd server

# Desarrollo (recarga automática)
npm run dev

# Producción
npm start
```

Endpoint de verificación: `GET http://localhost:3002/api/health`

---

## Ejecución del frontend

```bash
cd client
npm run dev
```

Disponible en: `http://localhost:5173`

---

## Ejecución de las pruebas unitarias

```bash
cd server

# Todas las pruebas
npm test

# Modo watch
npm run test:watch
```

**290 pruebas aprobadas** — 17 controllers + 1 middleware + 4 suites de integración.

---

## Ejecución de las pruebas de integración

```bash
cd server
npx jest --testPathPatterns="integration" --no-coverage --verbose
```

| Suite | Proceso cubierto | Tests |
| --- | --- | --- |
| `auth.integration.test.js` | Login y protección JWT | 11 |
| `ventas.integration.test.js` | Registro, anulación, stock | 16 |
| `compras.integration.test.js` | Órdenes de compra, recepción | 16 |
| `productos.integration.test.js` | CRUD completo del catálogo | 12 |

---

## Generación del reporte de cobertura

```bash
cd server
npm run coverage
# Reporte HTML: server/coverage/lcov-report/index.html
```

---

## Principales módulos del sistema

| Módulo | Ruta frontend | Endpoint API | Descripción |
| --- | --- | --- | --- |
| **Autenticación** | `/login` | `/api/auth` | Login con JWT, 3 roles |
| **Dashboard** | `/` | `/api/dashboard` | KPIs, gráficos, stock crítico |
| **Punto de Venta** | `/pos` | `/api/ventas` | POS con lector de barras |
| **Ventas** | `/ventas` | `/api/ventas` | Historial, anulación, devoluciones |
| **Compras** | `/compras` | `/api/compras` | Órdenes (Admin) y recepción (Almacenero) |
| **Productos** | `/productos` | `/api/productos` | Catálogo con filtro por categoría |
| **Inventario** | `/inventario` | `/api/inventario` | Ajuste de stock y movimientos |
| **Caja** | `/caja` | `/api/caja` | Apertura, cierre, movimientos |
| **Clientes** | `/clientes` | `/api/clientes` | Gestión de clientes |
| **Proveedores** | `/proveedores` | `/api/proveedores` | Gestión de proveedores |
| **Categorías** | `/categorias` | `/api/categorias` | Clasificación de productos |
| **Cotizaciones** | `/cotizaciones` | `/api/cotizaciones` | Proformas con número PROF-XXXXXX |
| **Cuentas por Cobrar** | `/cuentas-cobrar` | `/api/cuentas-cobrar` | Ventas al crédito y abonos |
| **Cuentas por Pagar** | `/cuentas-pagar` | `/api/cuentas-pagar` | Deudas a proveedores y pagos |
| **Devoluciones** | `/devoluciones` | `/api/devoluciones` | Notas de crédito NC001-XXXXXX |
| **Reportes** | `/reportes` | `/api/reportes` | Excel y PDF (ventas e inventario) |
| **Usuarios** | `/usuarios` | `/api/usuarios` | Gestión con roles |
| **Configuración** | `/configuracion` | `/api/configuracion` | Empresa, IGV, series |
| **Logs** | `/logs` | `/api/logs` | Auditoría de acciones |
| **Mantenimiento** | `/mantenimiento` | `/api/mantenimiento` | Herramientas de administración |

---

## Calidad del software

### Resumen de pruebas

| Tipo | Archivos | Pruebas aprobadas | Herramientas |
| --- | --- | --- | --- |
| Pruebas unitarias | 18 (17 controllers + 1 middleware) | **235 ✔** | Jest + jest.mock() |
| Pruebas de integración | 4 suites | **55 ✔** | Jest + Supertest |
| **Total** | **22 archivos** | **290 ✔** | |

### Specification-Driven Development (SDD)

Las pruebas se definen a partir del comportamiento esperado antes de validar la implementación. Cada módulo especifica entradas, salidas, casos de error y reglas de negocio como contrato verificable.

### Cobertura de controllers críticos

Los controllers de negocio principal tienen cobertura **≥ 90%** en statements, branches, functions y lines según el reporte de Jest.

---

## Buenas prácticas para el desarrollo

### Código

- Toda la lógica de negocio va en los **controllers**; las rutas solo enrutan y aplican middlewares.
- Usar `async/await` con bloques `try/catch` en todos los controllers.
- Las operaciones multitabla deben usar **transacciones Sequelize**. En el `catch`, llamar `t.rollback()`.
- Un `return res.status(4xx).json(...)` dentro del `try` **no activa el `catch`** — no llama `rollback`. Es intencional.

### Control de acceso

- `verifyToken` — protege todas las rutas autenticadas.
- `requireAdmin` — solo para gestión de usuarios.
- `requireRole(...roles)` — control granular por módulo y acción.
- El Sidebar filtra los módulos según `usuario.rol` — el Cajero no ve módulos de Almacenero y viceversa.

### Fechas desde MySQL

MySQL devuelve fechas con espacio (`"2026-07-08 15:30:00"`) en lugar del formato ISO (`T`). Usar siempre `formatDateTime()` o `formatDate()` de `client/src/utils/formatDate.js` — nunca `new Date(value)` directamente.

### Seguridad

- Nunca almacenar contraseñas en texto plano — usar `bcryptjs.hash()`.
- No exponer `JWT_SECRET` ni credenciales en el código fuente.
- `.env` no debe commitearse (incluido en `.gitignore`).
- En producción: `NODE_ENV=production` oculta el stack trace en errores.

### Base de datos

- Usar **soft delete** (`activo: 0`) en lugar de borrado físico.
- Asociaciones entre modelos definidas en `src/models/index.js`.

### Pruebas

- Pruebas unitarias: no conectar a BD real — usar `jest.mock()`.
- Pruebas de integración: usar `app-test.js` (Express sin `listen`) + Supertest.
- `beforeEach(() => jest.clearAllMocks())` en cada `describe` para evitar contaminación.

### Control de versiones

- Ramas por funcionalidad: `feature/nombre-modulo`.
- Commits atómicos con mensajes descriptivos.
- No commitear: `node_modules/`, `coverage/`, `uploads/`, `.env`.

---

## Despliegue en Railway

El sistema está desplegado completamente en Railway con tres servicios:

| Servicio | URL | Estado |
| --- | --- | --- |
| **Frontend** | `https://successful-grace-production-b275.up.railway.app` | Online |
| **Backend** | `https://sistema-ferreteria-production-ffd7.up.railway.app` | Online |
| **MySQL** | Internal Railway service | Online |

### Preparación previa

| Requisito | Variable | Descripción |
| --- | --- | --- |
| `JWT_SECRET` ≥ 64 chars | `server/.env` | Generar con `crypto.randomBytes(64)` |
| `DB_PASSWORD` segura | `server/.env` | Obligatorio en producción |
| `FRONTEND_URL` | `server/.env` | URL del frontend para CORS |
| `VITE_API_URL` | `client/.env.production` | URL del backend para el build |
| `DB_PORT` | `server/.env` | Railway asigna puerto dinámico (no 3306) |

### Variables Railway importantes

```env
# Backend (server)
NODE_ENV=production
DB_HOST=<MYSQLHOST de Railway>
DB_PORT=<MYSQLPORT de Railway>
DB_USER=<MYSQLUSER de Railway>
DB_PASSWORD=<MYSQLPASSWORD de Railway>
DB_NAME=railway
DB_SSL=false
JWT_SECRET=<clave_segura>
JWT_EXPIRES_IN=8h
FRONTEND_URL=https://successful-grace-production-b275.up.railway.app
LOGIN_RATE_LIMIT_MAX=10

# Frontend (client)
VITE_API_URL=https://sistema-ferreteria-production-ffd7.up.railway.app
```

### Importar la base de datos en Railway

```bash
# Desde la Console de Railway (MySQL service)
curl -s https://raw.githubusercontent.com/jeanbautista27-tech/sistema-ferreteria-/master/database/ferreteria_db_railway.sql | mysql -u root -p$MYSQL_ROOT_PASSWORD railway
curl -s https://raw.githubusercontent.com/jeanbautista27-tech/sistema-ferreteria-/master/database/datos_base.sql | mysql -u root -p$MYSQL_ROOT_PASSWORD railway
curl -s https://raw.githubusercontent.com/jeanbautista27-tech/sistema-ferreteria-/master/database/tablas_faltantes.sql | mysql -u root -p$MYSQL_ROOT_PASSWORD railway
```

### Verificar el despliegue

```bash
curl https://sistema-ferreteria-production-ffd7.up.railway.app/api/health
# { "ok": true, "msg": "Sistema Ferretería activo", "env": "production" }
```

### Checklist de seguridad para producción

- [ ] `NODE_ENV=production` configurado
- [ ] `JWT_SECRET` de al menos 64 caracteres aleatorios
- [ ] `DB_PASSWORD` con contraseña fuerte
- [ ] `FRONTEND_URL` con dominio real (CORS)
- [ ] HTTPS habilitado (Railway lo gestiona automáticamente)
- [ ] `.env` excluido del repositorio
- [ ] `node_modules/`, `coverage/`, `uploads/` excluidos del repositorio

---

## Licencia

Proyecto de uso interno. Todos los derechos reservados.
