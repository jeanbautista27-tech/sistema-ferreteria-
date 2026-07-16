# 09 — Contratos de API REST

**Versión:** 1.0 | **Base URL Producción:** `https://sistema-ferreteria-production-ffd7.up.railway.app`
**Autenticación:** `Authorization: Bearer <JWT>` en todas las rutas excepto `/api/auth/login`

---

## Convenciones de respuesta

```json
// Éxito
{ "ok": true, "data": ..., "msg": "descripción" }

// Error
{ "ok": false, "msg": "descripción del error", "error": "detalle (solo dev)" }
```

---

## Auth — `/api/auth`

| Método | Endpoint | Auth | Roles | Descripción |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/login` | ❌ Público | — | Iniciar sesión |
| GET | `/api/auth/me` | ✅ JWT | Todos | Datos del usuario autenticado |

**POST /api/auth/login**
```json
// Request
{ "email": "admin@ferreteria.com", "password": "admin123" }

// Response 200
{ "ok": true, "token": "eyJ...", "usuario": { "id": 1, "nombre": "Administrador", "email": "...", "rol": "Administrador" } }

// Errores: 400 (campos vacíos) · 401 (credenciales) · 429 (rate limit) · 500
```

---

## Usuarios — `/api/usuarios`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/usuarios` | Admin |
| GET | `/api/usuarios/roles` | Admin |
| POST | `/api/usuarios` | Admin |
| PUT | `/api/usuarios/:id` | Admin |
| DELETE | `/api/usuarios/:id` | Admin |

---

## Productos — `/api/productos`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/productos` | Todos |
| GET | `/api/productos/:id` | Todos |
| POST | `/api/productos` | Admin + Almacenero |
| PUT | `/api/productos/:id` | Admin + Almacenero |
| DELETE | `/api/productos/:id` | Admin + Almacenero |

**Query params GET /api/productos:**
- `?search=nombre_o_codigo`
- `?categoria_id=X`
- `?stock_bajo=true`

---

## Categorías — `/api/categorias`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/categorias` | Todos |
| POST | `/api/categorias` | Admin + Almacenero |
| PUT | `/api/categorias/:id` | Admin + Almacenero |
| DELETE | `/api/categorias/:id` | Admin + Almacenero |

---

## Proveedores — `/api/proveedores`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/proveedores` | Todos |
| POST | `/api/proveedores` | Admin + Almacenero |
| PUT | `/api/proveedores/:id` | Admin + Almacenero |
| DELETE | `/api/proveedores/:id` | Admin + Almacenero |

---

## Clientes — `/api/clientes`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/clientes` | Todos |
| POST | `/api/clientes` | Admin |
| PUT | `/api/clientes/:id` | Admin |
| DELETE | `/api/clientes/:id` | Admin |

---

## Ventas — `/api/ventas`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/ventas` | Admin + Cajero |
| GET | `/api/ventas/:id` | Admin + Cajero |
| POST | `/api/ventas` | Admin + Cajero |
| PUT | `/api/ventas/:id/anular` | Admin + Cajero |

**Query params GET /api/ventas:** `?desde=YYYY-MM-DD&hasta=YYYY-MM-DD&estado=Completada`

**POST /api/ventas body:**
```json
{
  "tipo_comprobante": "Boleta",
  "tipo_pago": "Efectivo",
  "cliente_id": null,
  "descuento": 0,
  "monto_recibido": 120,
  "items": [{ "producto_id": 1, "cantidad": 2, "precio_unitario": 50, "descuento": 0 }]
}
```

---

## Compras — `/api/compras`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/compras` | Admin + Almacenero |
| GET | `/api/compras/:id` | Admin + Almacenero |
| POST | `/api/compras` | **Solo Admin** |
| PUT | `/api/compras/:id/recibir` | Admin + Almacenero |

---

## Cotizaciones — `/api/cotizaciones`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/cotizaciones` | Admin + Cajero |
| GET | `/api/cotizaciones/:id` | Admin + Cajero |
| POST | `/api/cotizaciones` | Admin + Cajero |
| PUT | `/api/cotizaciones/:id/anular` | Admin + Cajero |

---

## Caja — `/api/caja`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/caja/actual` | Admin + Cajero |
| GET | `/api/caja/historial` | Admin + Cajero |
| POST | `/api/caja/abrir` | Admin + Cajero |
| PUT | `/api/caja/cerrar/:id` | Admin + Cajero |
| POST | `/api/caja/movimiento` | Admin + Cajero |

---

## Inventario — `/api/inventario`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/inventario/stock` | Admin + Almacenero |
| GET | `/api/inventario/movimientos` | Admin + Almacenero |
| POST | `/api/inventario/ajustar` | Admin + Almacenero |

---

## Devoluciones — `/api/devoluciones`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/devoluciones` | Admin + Cajero |
| GET | `/api/devoluciones/:id` | Admin + Cajero |
| POST | `/api/devoluciones` | Admin + Cajero |

---

## Cuentas por Cobrar — `/api/cuentas-cobrar`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/cuentas-cobrar` | Admin + Cajero |
| GET | `/api/cuentas-cobrar/:id` | Admin + Cajero |
| POST | `/api/cuentas-cobrar/:id/abonos` | Admin + Cajero |

---

## Cuentas por Pagar — `/api/cuentas-pagar`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/cuentas-pagar` | **Solo Admin** |
| GET | `/api/cuentas-pagar/:id` | **Solo Admin** |
| POST | `/api/cuentas-pagar/:id/abonos` | **Solo Admin** |

---

## Reportes — `/api/reportes`

| Método | Endpoint | Roles | Respuesta |
| --- | --- | --- | --- |
| GET | `/api/reportes/ventas` | Admin | JSON |
| GET | `/api/reportes/productos-vendidos` | Admin | JSON |
| GET | `/api/reportes/exportar-excel` | Admin | `.xlsx` blob |
| GET | `/api/reportes/exportar-pdf` | Admin | `.pdf` blob |
| GET | `/api/reportes/exportar-inventario-excel` | Admin | `.xlsx` blob |
| GET | `/api/reportes/exportar-inventario-pdf` | Admin | `.pdf` blob |

---

## Dashboard — `/api/dashboard`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/dashboard/stats` | Todos |

---

## Configuración — `/api/configuracion`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/configuracion` | Todos |
| PUT | `/api/configuracion` | Admin |

---

## Logs — `/api/logs`

| Método | Endpoint | Roles |
| --- | --- | --- |
| GET | `/api/logs` | Admin |

---

## Health Check

| Método | Endpoint | Auth |
| --- | --- | --- |
| GET | `/api/health` | ❌ Público |

```json
// Response 200
{ "ok": true, "msg": "Sistema Ferretería activo", "env": "production" }
```
