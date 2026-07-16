# Especificación — Módulo: Productos

**Versión:** 1.0 | **Sprint:** 1 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Gestionar el catálogo de productos de la ferretería: registro, consulta con filtros, actualización y eliminación lógica. Es la entidad central del sistema — sin productos no hay ventas, compras ni control de inventario.

---

## Descripción funcional

Permite mantener el catálogo de productos con sus precios, stock, stock mínimo, categoría, proveedor e imagen. El listado soporta filtros por nombre/código, categoría y condición de stock bajo. La eliminación es lógica.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-03.1 | Registrar producto con campos obligatorios (nombre, precio_venta) | `productosController.create` |
| RF-03.2 | Búsqueda por nombre (LIKE) o código | `where.nombre = { [Op.like]: '%search%' }` |
| RF-03.3 | Filtro por `categoria_id` | `where.categoria_id = categoria_id` |
| RF-03.4 | Filtro `stock_bajo=true` → `stock <= stock_minimo` | `Op.lte: sequelize.col('stock_minimo')` |
| RF-03.5 | Subida de imagen con multer | `req.file.filename → data.imagen` |
| RF-03.6 | Soft delete (`activo = 0`) | `productosController.remove` |

---

## Historias de usuario relacionadas

- **HU-19:** Como administrador, quiero gestionar el catálogo de productos con filtros.
- **HU-10:** Como almacenero, quiero ver el inventario con alertas de stock bajo.

---

## Criterios de aceptación

```
CA-PROD-01
DADO que se envía nombre y precio_venta válidos
CUANDO hace POST /api/productos
ENTONCES responde HTTP 201 con { ok: true, msg: 'Producto creado', producto }

CA-PROD-02
DADO que no se envía nombre
CUANDO hace POST /api/productos
ENTONCES responde HTTP 400 con { ok: false, msg: 'Nombre es requerido' }

CA-PROD-03
DADO que no se envía precio_venta
CUANDO hace POST /api/productos
ENTONCES responde HTTP 400 con { ok: false, msg: 'Precio de venta es requerido' }

CA-PROD-04
DADO que se envía ?stock_bajo=true
CUANDO hace GET /api/productos
ENTONCES retorna solo productos donde stock <= stock_minimo

CA-PROD-05
DADO que el producto no existe
CUANDO hace GET /api/productos/:id
ENTONCES responde HTTP 404 con { ok: false, msg: 'Producto no encontrado' }

CA-PROD-06
DADO que se elimina un producto
CUANDO hace DELETE /api/productos/:id
ENTONCES producto.activo = 0 (no se borra físicamente)
```

---

## Reglas de negocio

1. `activo: 1` en todas las consultas del catálogo — los productos inactivos no aparecen en el POS ni en ventas.
2. El código es único (`UNIQUE` en BD) pero opcional.
3. `stock_minimo` default = 5 si no se especifica.
4. La imagen se almacena como nombre de archivo en `uploads/`.
5. Lectura: todos los autenticados. Escritura: solo Administrador y Almacenero.

---

## Dependencias

- `multer` 1.4.5 (subida de imágenes)
- Modelos: `Producto`, `Categoria`, `Proveedor`
- Middlewares: `verifyToken`, `requireRole('Administrador','Almacenero')`

---

## Endpoints involucrados

| Método | Ruta | Roles escritura |
| --- | --- | --- |
| GET | `/api/productos` | Todos (autenticados) |
| GET | `/api/productos/:id` | Todos (autenticados) |
| POST | `/api/productos` | Admin + Almacenero |
| PUT | `/api/productos/:id` | Admin + Almacenero |
| DELETE | `/api/productos/:id` | Admin + Almacenero |

---

## Modelos Sequelize utilizados

- `Producto` — operaciones CRUD + `activo: 1` en lectura
- `Categoria` — incluido en `findAll` / `findByPk` (as: 'categoria')
- `Proveedor` — incluido en `findAll` / `findByPk` (as: 'proveedor')

---

## Controladores relacionados

- `server/src/controllers/productosController.js` — `getAll`, `getOne`, `create`, `update`, `remove`
- `server/src/routes/productosRoutes.js` — multer en POST y PUT

---

## Componentes React relacionados

- `client/src/pages/Productos.jsx` — CRUD + filtro por nombre, código y categoría
- `client/src/pages/POS.jsx` — consume GET /api/productos para el catálogo de venta

---

## Pruebas unitarias existentes

**Archivo:** `server/tests/controllers/productosController.test.js` (14 pruebas)

| Test | Escenario |
| --- | --- |
| `200 retorna lista de productos activos` | CA-PROD listado |
| `200 filtra por search` | RF-03.2 |
| `200 filtra por categoria_id` | RF-03.3 |
| `200 stock_bajo=true devuelve solo bajo stock` | CA-PROD-04 |
| `500 cuando BD falla` | Error handler |
| `404 producto no encontrado (getOne)` | CA-PROD-05 |
| `400 sin nombre (create)` | CA-PROD-02 |
| `400 sin precio_venta (create)` | CA-PROD-03 |
| `201 crea correctamente sin imagen` | CA-PROD-01 |
| `201 crea con imagen` | RF-03.5 |
| `404 no existe (update)` | Error path |
| `200 actualiza correctamente` | RF-03.1 |
| `404 no existe (remove)` | Error path |
| `200 soft delete` | CA-PROD-06 |

---

## Pruebas de integración existentes

**Archivo:** `server/tests/integration/productos.integration.test.js` (12 pruebas)

Cubre: seguridad 401, GET listado, GET filtro search, GET detalle, 404, POST validaciones 400, POST 201, PUT 404, PUT 200, DELETE 404, DELETE 200.

---

## Impacto sobre otros módulos

- **POS / Ventas:** Verifica `producto.stock >= cantidad` antes de vender.
- **Compras:** Al recibir, incrementa `producto.stock`.
- **Inventario:** Todos los movimientos referencian `producto_id`.
- **Dashboard:** Cuenta `Producto.count()` y detecta `stock <= stock_minimo`.
- **Reportes:** `exportarInventarioExcel/PDF` consulta todos los productos.

---

## Observaciones

- El filtro `stock_bajo` se aplica **en el cliente** (JS filter) en `inventarioController.getStock` pero se aplica con Sequelize `Op.lte` en `productosController.getAll`.
- Las imágenes no persisten entre redeploys de Railway (filesystem efímero).
