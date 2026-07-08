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
│  ┌────────────┐  ┌─────────────┐  ┌─────────────┐  │
│  │   Routes   │→ │ Controllers │→ │   Models    │  │
│  │ /api/*     │  │  (lógica)   │  │ (Sequelize) │  │
│  └────────────┘  └─────────────┘  └─────────────┘  │
│  ┌──────────────────────────────────────────────┐   │
│  │        Middlewares (JWT, Multer, CORS)        │   │
│  └──────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────┘
                       │ Sequelize ORM
                       ▼
┌─────────────────────────────────────────────────────┐
│              BASE DE DATOS (MySQL)                  │
│               ferreteria_db                         │
└─────────────────────────────────────────────────────┘
```

**Flujo de autenticación:** El cliente obtiene un JWT en el login y lo envía en el header `Authorization: Bearer <token>` en cada petición. El middleware `verifyToken` valida el token antes de llegar a cualquier controlador.

---

## Estructura de carpetas

```text
sistema-ferreteria/
│
├── client/                         # Frontend React + Vite
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js            # Instancia configurada de Axios
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── MainLayout.jsx  # Layout principal con sidebar
│   │   │   │   └── Sidebar.jsx     # Navegación lateral
│   │   │   ├── ui/
│   │   │   │   └── ConfirmModal.jsx
│   │   │   └── ventas/
│   │   │       ├── TicketVenta.jsx
│   │   │       └── TicketCotizacion.jsx
│   │   ├── hooks/
│   │   │   └── useBarcodeScanner.js # Hook para lectura de código de barras
│   │   ├── pages/                  # Una página por módulo del sistema
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── POS.jsx
│   │   │   ├── Ventas.jsx
│   │   │   ├── Compras.jsx
│   │   │   ├── Productos.jsx
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
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Backend Node.js + Express
│   ├── src/
│   │   ├── app.js                  # Punto de entrada, rutas y arranque
│   │   ├── config/
│   │   │   └── db.js               # Conexión Sequelize a MySQL
│   │   ├── controllers/            # Lógica de negocio por módulo (19 controllers)
│   │   ├── middlewares/
│   │   │   └── auth.js             # verifyToken + requireAdmin
│   │   ├── models/                 # Modelos Sequelize (24 modelos + index)
│   │   └── routes/                 # Definición de endpoints REST (19 archivos)
│   ├── tests/
│   │   ├── controllers/            # Pruebas unitarias (17 archivos)
│   │   ├── middlewares/
│   │   │   └── auth.test.js        # Pruebas del middleware JWT
│   │   └── integration/            # Pruebas de integración (4 archivos)
│   │       └── setup/
│   │           ├── app-test.js     # Express sin listen para Supertest
│   │           └── tokenHelper.js  # Generador de tokens JWT para tests
│   ├── coverage/                   # Reportes de cobertura (generado por Jest)
│   ├── uploads/                    # Archivos subidos (imágenes, logo)
│   ├── .env                        # Variables de entorno (no commitear)
│   ├── jest.config.js
│   └── package.json
│
├── database/
│   ├── ferreteria_db.sql           # Schema completo de la base de datos
│   ├── datos_base.sql              # Datos base del sistema (roles, config)
│   └── datos_prueba.sql            # Datos de ejemplo para desarrollo
│
├── scripts/
│   ├── 1_Instalar_Dependencias.bat # Instala npm en server y client
│   ├── 2_Configurar_Base_Datos.bat # Importa el schema MySQL
│   └── 3_Iniciar_Sistema.bat       # Levanta backend y frontend
│
└── README.md
```

---

## Requisitos previos

Antes de instalar el proyecto, asegúrate de tener instalado:

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
# 1. Instalar dependencias de server y client
scripts\1_Instalar_Dependencias.bat

# 2. Importar la base de datos
scripts\2_Configurar_Base_Datos.bat

# 3. Iniciar el sistema completo
scripts\3_Iniciar_Sistema.bat
```

### Opción B — Instalación manual

```bash
# Clonar el repositorio
git clone <url-del-repositorio>
cd sistema-ferreteria

# Instalar dependencias del backend
cd server
npm install

# Instalar dependencias del frontend
cd ../client
npm install
```

---

## Configuración de la base de datos MySQL

```sql
-- Crear la base de datos
CREATE DATABASE ferreteria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Importar el schema y datos base
mysql -u root -p ferreteria_db < database/ferreteria_db.sql
mysql -u root -p ferreteria_db < database/datos_base.sql

-- Opcional: cargar datos de prueba para desarrollo
mysql -u root -p ferreteria_db < database/datos_prueba.sql
```

**Credenciales de acceso por defecto** (generadas por `datos_base.sql`):

- Usuario: `admin@ferreteria.com`
- Contraseña: `admin123`

---

## Variables de entorno requeridas

Crear el archivo `server/.env` con las siguientes variables:

```env
# Servidor
PORT=3002

# Base de datos MySQL
DB_HOST=localhost
DB_USER=<usuario_mysql>
DB_PASSWORD=<contraseña_mysql>
DB_NAME=ferreteria_db
DB_DIALECT=mysql

# Autenticación JWT
JWT_SECRET=<clave_secreta_segura>
JWT_EXPIRES_IN=8h
```

> **Importante:** nunca commitear el archivo `.env` con credenciales reales. El archivo ya está incluido en `.gitignore`.

---

## Instalación de dependencias

```bash
# Backend
cd server
npm install

# Frontend
cd client
npm install
```

---

## Ejecución del backend

```bash
cd server

# Producción
npm start

# Desarrollo (con recarga automática)
npm run dev
```

El servidor quedará disponible en: `http://localhost:3002`

Endpoint de verificación:

```text
GET http://localhost:3002/api/health
```

---

## Ejecución del frontend

```bash
cd client
npm run dev
```

La aplicación quedará disponible en: `http://localhost:5173`

El proxy de Vite redirige automáticamente `/api/*` y `/uploads/*` al servidor en el puerto `3002`.

---

## Ejecución de las pruebas unitarias

Las pruebas unitarias se ubican en `server/tests/controllers/` y `server/tests/middlewares/`. Utilizan Jest con mocks de Sequelize, sin conexión real a la base de datos.

```bash
cd server

# Ejecutar todas las pruebas
npm test

# Ejecutar en modo watch (re-ejecuta al guardar)
npm run test:watch
```

**Cobertura actual:** 17 controllers + 1 middleware cubiertos, ~175 casos de prueba.

---

## Ejecución de las pruebas de integración

Las pruebas de integración se ubican en `server/tests/integration/`. Utilizan Jest + Supertest para ejercitar la capa HTTP completa (rutas → middleware → controller) con mocks de modelos, sin conexión real a la base de datos.

```bash
cd server

# Ejecutar solo las pruebas de integración
npx jest --testPathPatterns="integration" --no-coverage --verbose
```

**Suites disponibles:**

| Archivo | Proceso cubierto | Tests |
| --- | --- | --- |
| `auth.integration.test.js` | Login y protección de rutas JWT | 11 |
| `ventas.integration.test.js` | Registro de ventas, anulación y stock | 16 |
| `compras.integration.test.js` | Órdenes de compra y recepción de mercancía | 16 |
| `productos.integration.test.js` | CRUD completo del catálogo de productos | 12 |

---

## Generación del reporte de cobertura

```bash
cd server
npm run coverage
```

El reporte se genera en `server/coverage/`. Para verlo en el navegador:

```bash
# Abrir el reporte HTML
start server/coverage/lcov-report/index.html   # Windows
open server/coverage/lcov-report/index.html    # macOS/Linux
```

La configuración en `jest.config.js` recolecta cobertura de `src/**/*.js` excluyendo `src/app.js`.

---

## Principales módulos del sistema

| Módulo | Ruta frontend | Endpoint API | Descripción |
| --- | --- | --- | --- |
| **Autenticación** | `/login` | `/api/auth` | Login con JWT, control de sesión |
| **Dashboard** | `/dashboard` | `/api/dashboard` | KPIs, gráficos de tendencia y stock crítico |
| **Punto de Venta (POS)** | `/pos` | `/api/ventas` | Venta rápida con lector de código de barras |
| **Ventas** | `/ventas` | `/api/ventas` | Registro, consulta y anulación de ventas |
| **Compras** | `/compras` | `/api/compras` | Órdenes de compra y recepción de mercancía |
| **Productos** | `/productos` | `/api/productos` | Catálogo con imágenes, precios y stock |
| **Inventario** | `/inventario` | `/api/inventario` | Ajuste de stock y movimientos |
| **Caja** | `/caja` | `/api/caja` | Apertura, cierre y movimientos de caja |
| **Clientes** | `/clientes` | `/api/clientes` | Gestión de clientes |
| **Proveedores** | `/proveedores` | `/api/proveedores` | Gestión de proveedores |
| **Categorías** | `/categorias` | `/api/categorias` | Clasificación de productos |
| **Cotizaciones** | `/cotizaciones` | `/api/cotizaciones` | Proformas con validez configurable |
| **Cuentas por Cobrar** | `/cuentas-cobrar` | `/api/cuentas-cobrar` | Seguimiento de ventas al crédito y abonos |
| **Cuentas por Pagar** | `/cuentas-pagar` | `/api/cuentas-pagar` | Seguimiento de compras al crédito y pagos |
| **Devoluciones** | `/devoluciones` | `/api/devoluciones` | Notas de crédito y reembolsos |
| **Reportes** | `/reportes` | `/api/reportes` | Exportación en Excel y PDF |
| **Usuarios** | `/usuarios` | `/api/usuarios` | Gestión de usuarios y roles |
| **Configuración** | `/configuracion` | `/api/configuracion` | Datos de la empresa, IGV, series |
| **Logs** | `/logs` | `/api/logs` | Auditoría de acciones del sistema |
| **Mantenimiento** | `/mantenimiento` | `/api/mantenimiento` | Herramientas de administración |

### Modelos de base de datos

El sistema cuenta con **24 modelos Sequelize**:

`Usuario` · `Rol` · `Producto` · `Categoria` · `Proveedor` · `Cliente` · `Venta` · `DetalleVenta` · `Compra` · `DetalleCompra` · `Cotizacion` · `DetalleCotizacion` · `Devolucion` · `DetalleDevolucion` · `InventarioMovimiento` · `Caja` · `CajaEgreso` · `CuentaCobrar` · `AbonoCuenta` · `CuentaPagar` · `AbonoPagar` · `Configuracion` · `AuditLog`

---

## Calidad del software

El proyecto aplica una estrategia de pruebas en dos niveles que cubre desde la lógica interna de cada función hasta el flujo HTTP completo, siguiendo el enfoque **Specification-Driven Development (SDD)**: las pruebas se definen a partir del comportamiento esperado del sistema antes de validar la implementación.

### Resumen de pruebas

| Tipo | Archivos | Pruebas aprobadas | Herramientas |
| --- | --- | --- | --- |
| Pruebas unitarias | 18 archivos (17 controllers + 1 middleware) | **235 ✔** | Jest + jest.mock() |
| Pruebas de integración | 4 archivos (auth, ventas, compras, productos) | **55 ✔** | Jest + Supertest |
| **Total** | **22 archivos** | **290 ✔** | |

### Pruebas unitarias — 235 aprobadas

Cubren cada función de los controllers y el middleware de autenticación de forma aislada, sin conexión real a la base de datos. Los modelos Sequelize se reemplazan por mocks con `jest.mock()`.

**Controladores cubiertos:** `authController` · `productosController` · `ventasController` · `comprasController` · `clientesController` · `categoriasController` · `proveedoresController` · `usuariosController` · `inventarioController` · `cajaController` · `dashboardController` · `reportesController` · `configuracionController` · `devolucionesController` · `cotizacionesController` · `cuentasCobrarController` · `cuentasPagarController`

**Middleware cubierto:** `auth.js` — `verifyToken` y `requireAdmin`

**Escenarios cubiertos por cada módulo:**

- Respuesta exitosa (200 / 201)
- Validaciones de entrada (400)
- Recurso no encontrado (404)
- Acceso no autorizado (401 / 403)
- Error interno del servidor (500)
- Rollback de transacciones ante fallos
- Soft delete (`activo: 0`)
- Hash de contraseñas y generación de tokens JWT

### Pruebas de integración — 55 aprobadas

Ejercitan la capa HTTP completa: `petición HTTP → ruta → middleware JWT → controller → respuesta`. Se usa `Supertest` con una instancia Express sin `listen` ni conexión real a BD.

| Suite | Proceso de negocio cubierto | Tests |
| --- | --- | --- |
| `auth.integration.test.js` | Login, tokens, rutas protegidas | 11 |
| `ventas.integration.test.js` | Registro de ventas, anulación, reversión de stock | 16 |
| `compras.integration.test.js` | Órdenes de compra, recepción de mercancía | 16 |
| `productos.integration.test.js` | CRUD completo del catálogo | 12 |

### Cobertura de código

La cobertura se genera automáticamente con Jest sobre todo el código en `src/**/*.js` (excluyendo `src/app.js`) y se reporta en cuatro métricas: **Statements**, **Branches**, **Functions** y **Lines**.

```bash
cd server
npm run coverage
# Reporte HTML disponible en: server/coverage/lcov-report/index.html
```

### Specification-Driven Development (SDD)

El desarrollo del sistema siguió el enfoque SDD: cada módulo se especificó primero en términos de comportamiento esperado (entradas, salidas, casos de error y reglas de negocio) antes de validar su implementación mediante pruebas. Esto garantiza que las pruebas documentan el contrato del sistema y no solo verifican código existente.

---

## Buenas prácticas para el desarrollo

### Código

- Toda la lógica de negocio va en los **controllers**; las rutas solo enrutan.
- Usar `async/await` con bloques `try/catch` en todos los controllers.
- Las operaciones que afectan múltiples tablas deben usar **transacciones Sequelize** (`sequelize.transaction()`). Si ocurre un error, llamar `t.rollback()` en el `catch`.
- Los `return res.status(4xx).json(...)` dentro de un bloque `try` **no activan el `catch`** y, por tanto, no llaman `rollback`. Esto es intencional y correcto.

### Seguridad

- Nunca almacenar contraseñas en texto plano: usar `bcryptjs.hash()` siempre.
- Proteger todas las rutas que requieran autenticación con el middleware `verifyToken`.
- Proteger las rutas de administración con `requireAdmin`.
- No exponer el `JWT_SECRET` ni credenciales de BD en el código fuente.
- El archivo `.env` no debe commitearse al repositorio.

### Base datos

- Usar **soft delete** (`activo: 0`) en lugar de eliminar registros físicamente.
- Definir las asociaciones entre modelos en `src/models/index.js`.

### Pruebas

- Las pruebas unitarias **no deben conectarse a la BD real**: usar `jest.mock()` para todos los modelos y `sequelize`.
- Las pruebas de integración usan `app-test.js` (Express sin `listen`) + Supertest.
- Agregar `beforeEach(() => jest.clearAllMocks())` en cada `describe` para evitar contaminación entre tests.
- Las aserciones de `rollback` solo aplican cuando el error ocurre dentro del bloque `catch`. Un `return` directo dentro del `try` no activa `rollback`.

### Control de versiones

- Usar ramas por funcionalidad: `feature/nombre-modulo`.
- Hacer commits atómicos con mensajes descriptivos.
- No commitear archivos generados: `node_modules/`, `coverage/`, `uploads/`.

---

## Despliegue en la nube

### Preparación previa

Antes de desplegar, verificar que se cumplen estos requisitos:

| Requisito | Archivo | Estado |
| --- | --- | --- |
| Variables de entorno configuradas | `server/.env` | Completar desde `server/.env.example` |
| Variable de entorno del frontend | `client/.env.production` | Completar desde `client/.env.example` |
| `JWT_SECRET` con mínimo 64 caracteres | `server/.env` | Generar con el comando de abajo |
| `DB_PASSWORD` con contraseña segura | `server/.env` | Obligatorio en producción |
| `FRONTEND_URL` apuntando al dominio real | `server/.env` | Requerido para CORS |
| `VITE_API_URL` apuntando al backend real | `client/.env.production` | Requerido para el build |

```bash
# Generar JWT_SECRET seguro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

### Backend — paso a paso

#### 1. Configurar variables de entorno

```bash
cd server
cp .env.example .env
# Editar .env con los valores reales de producción
```

#### 2. Instalar dependencias de producción

```bash
npm install --omit=dev
```

#### 3. Instalar PM2 globalmente

```bash
npm install -g pm2
```

#### 4. Iniciar el servidor con PM2

```bash
# Iniciar en modo producción
pm2 start ecosystem.config.js --env production

# Configurar inicio automático al reiniciar el servidor
pm2 save
pm2 startup
```

#### 5. Comandos útiles de PM2

```bash
pm2 status                     # Ver estado de todos los procesos
pm2 logs ferreteria-api        # Ver logs en tiempo real
pm2 restart ferreteria-api     # Reiniciar el proceso
pm2 stop ferreteria-api        # Detener el proceso
pm2 monit                      # Monitor interactivo
```

---

### Frontend — paso a paso

#### 1. Configurar la URL del backend

```bash
cd client

# Crear el archivo de entorno de producción
cp .env.example .env.production
# Editar .env.production:
#   VITE_API_URL=https://api.tudominio.com
```

#### 2. Generar el build de producción

```bash
npm run build
# Los archivos estáticos se generan en client/dist/
```

#### 3. Servir los archivos estáticos

Los archivos de `client/dist/` se pueden servir de tres formas:

**Opción A — Nginx** (recomendado)

```nginx
server {
    listen 80;
    server_name tudominio.com;

    root /var/www/ferreteria/client/dist;
    index index.html;

    # SPA: redirigir todas las rutas al index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy al backend Node.js
    location /api/ {
        proxy_pass         http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection 'upgrade';
        proxy_set_header   Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        proxy_pass http://localhost:3002;
    }
}
```

**Opción B — serve (Node.js)**

```bash
npm install -g serve
serve -s client/dist -l 3000
```

**Opción C — plataformas de hosting estático**

`client/dist/` se puede subir directamente a Netlify, Vercel o AWS S3 + CloudFront.

---

### Proveedores de nube recomendados

| Componente | Opciones recomendadas |
| --- | --- |
| **Backend** (Node.js) | Railway, Render, Fly.io, AWS EC2, DigitalOcean Droplet |
| **Frontend** (React) | Vercel, Netlify, Cloudflare Pages, AWS S3 + CloudFront |
| **Base de datos** (MySQL) | PlanetScale, Railway MySQL, AWS RDS, DigitalOcean Managed DB |

---

### Checklist de seguridad para producción

- [ ] `NODE_ENV=production` configurado en el servidor
- [ ] `JWT_SECRET` de al menos 64 caracteres aleatorios
- [ ] `DB_PASSWORD` con contraseña fuerte
- [ ] `FRONTEND_URL` configurado con el dominio real (CORS)
- [ ] HTTPS habilitado (certificado SSL/TLS activo)
- [ ] Archivos `.env` excluidos del repositorio (`.gitignore` configurado)
- [ ] `node_modules/`, `coverage/` y `uploads/` excluidos del repositorio
- [ ] PM2 configurado con inicio automático (`pm2 startup`)
- [ ] Backups automáticos de la base de datos programados

---

### Verificar que el despliegue es correcto

```bash
# El endpoint /api/health debe responder con ok: true
curl https://api.tudominio.com/api/health

# Respuesta esperada:
# { "ok": true, "msg": "Sistema Ferretería activo", "env": "production" }
```

---

## Licencia

Proyecto de uso interno. Todos los derechos reservados.
