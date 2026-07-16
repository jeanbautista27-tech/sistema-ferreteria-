# 11 — Especificación de Despliegue

**Versión:** 1.0 | **Plataforma:** Railway | **Estado:** Activo en producción

---

## URLs de producción

| Servicio | URL |
| --- | --- |
| Frontend | `https://successful-grace-production-b275.up.railway.app` |
| Backend | `https://sistema-ferreteria-production-ffd7.up.railway.app` |
| Health check | `https://sistema-ferreteria-production-ffd7.up.railway.app/api/health` |

---

## Servicios en Railway

| Servicio | Tipo | Estado | Config |
| --- | --- | --- | --- |
| `sistema-ferreteria-` | GitHub repo (Node.js) | Online | `server/railway.json` |
| `successful-grace` | GitHub repo (Vite) | Online | `client/railway.json` |
| MySQL | Database managed | Online | Variables automáticas |

---

## Configuración de build

### Backend — `server/railway.json`
```json
{
  "build": { "builder": "NIXPACKS", "buildCommand": "npm install" },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 30,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 5
  }
}
```

### Frontend — `client/railway.json`
```json
{
  "build": { "builder": "NIXPACKS", "buildCommand": "npm install && npm run build" },
  "deploy": { "startCommand": "npm start" }
}
```

El script `start` del frontend: `vite preview --port $PORT --host 0.0.0.0`

---

## Variables de entorno

### Backend (servicio `sistema-ferreteria-`)

| Variable | Valor | Descripción |
| --- | --- | --- |
| `NODE_ENV` | `production` | Activa modo producción |
| `PORT` | Dinámico (Railway) | Puerto del servidor |
| `JWT_SECRET` | `<64 chars aleatorios>` | Clave de firma JWT |
| `JWT_EXPIRES_IN` | `8h` | Expiración del token |
| `DB_HOST` | Ref → `MYSQLHOST` | Host MySQL de Railway |
| `DB_PORT` | Ref → `MYSQLPORT` | Puerto MySQL de Railway |
| `DB_USER` | Ref → `MYSQLUSER` | Usuario MySQL |
| `DB_PASSWORD` | Ref → `MYSQLPASSWORD` | Contraseña MySQL |
| `DB_NAME` | `railway` | Nombre de la BD |
| `DB_SSL` | `false` | SSL desactivado |
| `FRONTEND_URL` | URL del frontend | CORS en producción |
| `LOGIN_RATE_LIMIT_MAX` | `10` | Límite intentos login |

### Frontend (servicio `successful-grace`)

| Variable | Valor | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | URL del backend | Base URL de la API |

---

## Importación de base de datos en Railway

```bash
# Desde la Console del servicio MySQL en Railway (bash-5.1#)

# 1. Schema de tablas
curl -s https://raw.githubusercontent.com/jeanbautista27-tech/sistema-ferreteria-/master/database/ferreteria_db_railway.sql | mysql -u root -p$MYSQL_ROOT_PASSWORD railway

# 2. Datos base
curl -s https://raw.githubusercontent.com/jeanbautista27-tech/sistema-ferreteria-/master/database/datos_base.sql | mysql -u root -p$MYSQL_ROOT_PASSWORD railway

# 3. Tablas adicionales
curl -s https://raw.githubusercontent.com/jeanbautista27-tech/sistema-ferreteria-/master/database/tablas_faltantes.sql | mysql -u root -p$MYSQL_ROOT_PASSWORD railway
```

---

## Diferencias entre entornos

| Aspecto | Desarrollo | Producción |
| --- | --- | --- |
| `NODE_ENV` | development | production |
| CORS | localhost:5173 | FRONTEND_URL |
| Error stack trace | Visible | Oculto |
| Puerto | 3002 (fijo) | $PORT (dinámico) |
| BD | ferreteria_db local | railway (Railway) |
| Frontend URL | localhost:5173 | URL Railway |
| API URL | proxy Vite → localhost:3002 | VITE_API_URL |

---

## Checklist de despliegue

- [x] `NODE_ENV=production` configurado
- [x] `JWT_SECRET` con 64+ caracteres aleatorios
- [x] `DB_PASSWORD` con contraseña segura
- [x] `FRONTEND_URL` apuntando al dominio real
- [x] Variables MySQL referenciadas desde servicio MySQL de Railway
- [x] HTTPS habilitado (Railway lo gestiona automáticamente)
- [x] `.env` excluido del repositorio (`.gitignore`)
- [x] `node_modules/`, `coverage/`, `uploads/` excluidos
- [x] Health check respondiendo HTTP 200
- [x] 290 pruebas pasando antes del despliegue

---

## Verificación del despliegue

```bash
# Health check
curl https://sistema-ferreteria-production-ffd7.up.railway.app/api/health
# → { "ok": true, "msg": "Sistema Ferretería activo", "env": "production" }

# Pruebas locales antes de push
cd server && npm test
# → 290 passed, 0 failed
```
