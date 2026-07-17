# 10 — Plan de Pruebas

**Versión:** 1.0 | **Framework:** Jest 30.4.2 + Supertest 7.2.2

---

## Resultado actual verificado

```
Test Suites: 27 passed, 27 total
Tests:       362 passed, 362 total
Fallos:      0
Tiempo:      ~7.5 segundos
```

**Desglose:**
- Pruebas unitarias (controllers + middleware): **235** — 18 suites
- Pruebas de integración: **127** — 9 suites
- **Total: 362 pruebas**

---

## Estrategia de pruebas

```
ESPECIFICACIÓN (specs/)
       ↓
PRUEBA UNITARIA (tests/controllers/)
       ↓ verifica lógica aislada sin BD
PRUEBA DE INTEGRACIÓN (tests/integration/)
       ↓ verifica cadena HTTP completa
COBERTURA (coverage/)
       ↓ valida que las especificaciones tienen respaldo de código
```

---

## Pruebas unitarias (235 pruebas)

### Infraestructura

```js
// Patrón estándar en todos los archivos
jest.mock('../../src/models', () => ({ ... }));
jest.mock('../../src/config/db', () => ({ transaction: jest.fn() }));

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};
```

### Inventario de archivos

| Archivo | Tests | Funciones cubiertas |
| --- | --- | --- |
| `authController.test.js` | 9 | login (6), me (3) |
| `ventasController.test.js` | 12 | getAll, getOne, create, anular |
| `comprasController.test.js` | 12 | getAll, getOne, create, recibirCompra |
| `productosController.test.js` | 14 | getAll, getOne, create, update, remove |
| `clientesController.test.js` | 12 | getAll, create, update, remove |
| `categoriasController.test.js` | 11 | getAll, create, update, remove |
| `proveedoresController.test.js` | 11 | getAll, create, update, remove |
| `usuariosController.test.js` | 14 | getAll, getRoles, create, update, remove |
| `inventarioController.test.js` | 14 | getStock, ajustarStock, getMovimientos |
| `cajaController.test.js` | 15 | getCajaActual, abrir, cerrar, registrarMovimiento, getHistorial |
| `dashboardController.test.js` | 4 | getDashboardStats |
| `reportesController.test.js` | 15 | resumenVentas, productosVendidos, exportarExcel, exportarPDF, exportarInventarioExcel, exportarInventarioPDF |
| `configuracionController.test.js` | 7 | getAll, update |
| `devolucionesController.test.js` | 10 | getAll, getOne, create |
| `cotizacionesController.test.js` | 11 | getAll, getOne, create, anular |
| `cuentasCobrarController.test.js` | 10 | listar, detalle, registrarAbono |
| `cuentasPagarController.test.js` | 10 | listar, detalle, registrarAbono |
| `auth.test.js` (middleware) | 8 | verifyToken (4), requireAdmin (4) |

### Escenarios cubiertos por cada módulo

- ✅ Respuesta exitosa (200 / 201)
- ✅ Validación de entrada (400)
- ✅ Recurso no encontrado (404)
- ✅ Acceso no autorizado (401 / 403)
- ✅ Error interno del servidor (500)
- ✅ Rollback de transacciones ante fallos
- ✅ Soft delete (`activo: 0`)
- ✅ Hash de contraseñas y generación de tokens JWT

---

## Pruebas de integración (127 pruebas)

### Infraestructura

```js
// tests/integration/setup/app-test.js
// Express sin listen() ni conexión real a BD — monta 14 rutas del sistema
// Mocks de modelos — misma estrategia que unitarias

// tests/integration/setup/tokenHelper.js
// Genera JWT firmado con JWT_SECRET para usar en headers
const generarToken = (payload = {}) =>
    jwt.sign({ id: 1, nombre: 'Test Admin', email: 'admin@test.com', rol: 'Administrador', ...payload }, SECRET, { expiresIn: '1h' });
```

### Suites de integración — 9 archivos

| Suite | Tests | Procesos cubiertos |
| --- | --- | --- |
| `auth.integration.test.js` | 11 | Login éxito/fallos, tokens, rutas protegidas sin token, con token inválido, con token válido, 404 usuario inexistente |
| `ventas.integration.test.js` | 16 | Seguridad 401, listar, filtrar, detalle, crear al contado, crear al crédito, rollback sin stock, anular, 400 ya anulada |
| `compras.integration.test.js` | 16 | Seguridad 401, listar, filtrar, detalle, crear al crédito + CxP, crear al contado + caja, rollback sin caja, recibir, 400 ya recibida |
| `productos.integration.test.js` | 12 | Seguridad 401, listar, filtrar por search, detalle, 404, crear validaciones 400, crear 201, actualizar, eliminar soft delete |
| `caja.integration.test.js` | 20 | Seguridad 401/403, consultar actual, retorna null sin caja, abrir con monto, abrir sin monto (default 0), 400 ya abierta, Cajero puede abrir, registrar egreso, tipo default, cerrar monto_final = inicial+ventas−egresos, cerrar ceros, historial |
| `devoluciones.integration.test.js` | 14 | Seguridad 401/403, listar, detalle, 404, 400 sin items, 404 venta no existe, 400 venta no Completada, 500 rollback cantidad excede, 201 Nota Crédito + stock reintegrado, 201 Efectivo + CajaEgreso, 500 rollback sin caja, correlativo NC001-XXXXXX, Cajero puede devolver |
| `categorias.integration.test.js` | 14 | Seguridad 401/403, listar (Admin/Almacenero/Cajero lectura), crear 400, crear 201 Admin/Almacenero, actualizar 404/200, eliminar 404/200 soft delete |
| `clientes.integration.test.js` | 14 | Seguridad 401/403 (solo Admin escritura), listar (Cajero lectura), filtro search, crear 400, crear 201, actualizar 404/200, eliminar 404/200 soft delete |
| `proveedores.integration.test.js` | 14 | Seguridad 401/403 (Cajero no puede escribir), listar (todos), Almacenero puede crear, crear 400, crear 201, actualizar 404/200, eliminar 404/200 soft delete |

**Total: 127 pruebas — 0 fallos**

### Resultado verificado

```
Test Suites: 9 passed, 9 total
Tests:       127 passed, 127 total
Fallos:      0
Tiempo:      ~3 segundos
```

---

## Cobertura de código

### Configuración Jest

```js
// jest.config.js
collectCoverageFrom: [
    "src/**/*.js",
    "!src/app.js",
    "!src/config/db.js"
]
coveragePathIgnorePatterns: ["/node_modules/", "/src/config/", "/src/models/"]
```

### Resultado global verificado (362 pruebas)

| Capa | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| **All files** | **93.84 %** | **88.49 %** | **90.00 %** | **94.50 %** |
| Controllers (18) | 96.59 % | 88.14 % | 93.47 % | 97.78 % |
| Middlewares (1) | 100.00 % | 100.00 % | 100.00 % | 100.00 % |
| Routes (19) | 77.96 % | 100.00 % | 0.00 % | 77.96 % |

### Detalle por controller

| Controller | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| `authController.js` | 100 % | 100 % | 100 % | 100 % ⭐ |
| `cajaController.js` | 100 % | 100 % | 100 % | 100 % ⭐ |
| `categoriasController.js` | 100 % | 100 % | 100 % | 100 % ⭐ |
| `clientesController.js` | 100 % | 100 % | 100 % | 100 % ⭐ |
| `configuracionController.js` | 100 % | 100 % | 100 % | 100 % ⭐ |
| `inventarioController.js` | 100 % | 100 % | 100 % | 100 % ⭐ |
| `proveedoresController.js` | 100 % | 100 % | 100 % | 100 % ⭐ |
| `usuariosController.js` | 100 % | 100 % | 100 % | 100 % ⭐ |
| `cotizacionesController.js` | 100 % | 96.15 % | 100 % | 100 % |
| `cuentasCobrarController.js` | 100 % | 95.45 % | 100 % | 100 % |
| `cuentasPagarController.js` | 100 % | 95.45 % | 100 % | 100 % |
| `dashboardController.js` | 100 % | 80.00 % | 100 % | 100 % |
| `ventasController.js` | 98.83 % | 85.45 % | 100 % | 100 % |
| `devolucionesController.js` | 96.87 % | 87.50 % | 100 % | 100 % |
| `comprasController.js` | 94.52 % | 86.66 % | 100 % | 93.84 % |
| `productosController.js` | 94.64 % | 90.00 % | 100 % | 95.74 % |
| `reportesController.js` | 92.19 % | 67.30 % | 80.00 % | 96.64 % |
| `logController.js` | 0 % | 100 % | 0 % | 0 % ⚠️ sin test |
| `auth.js` (middleware) | 100 % | 100 % | 100 % | 100 % ⭐ |

### Módulos con cobertura 100 % en todas las métricas

`authController` · `cajaController` · `categoriasController` · `clientesController`
`configuracionController` · `inventarioController` · `proveedoresController`
`usuariosController` · `auth.js` (middleware)

---

## Comandos de ejecución

```bash
cd server

# Todas las pruebas (unitarias + integración)
npm test

# Solo pruebas de integración
npm run test:integration
# equivale a: npx jest tests/integration --no-coverage --forceExit

# Solo pruebas unitarias
npm run test:unit

# Con cobertura completa
npm run coverage

# Reporte HTML de cobertura
start coverage/lcov-report/index.html   # Windows
open  coverage/lcov-report/index.html   # macOS/Linux
```

---

## Reglas de pruebas (SDD)

1. Toda prueba unitaria usa `jest.mock()` — nunca conecta a BD real.
2. `beforeEach(() => jest.clearAllMocks())` en cada `describe`.
3. `return` dentro de `try` NO activa `catch` → no hay `rollback`. Los tests verifican esto con `expect(mockTransaction.rollback).not.toHaveBeenCalled()`.
4. Las pruebas de integración usan `app-test.js` + `tokenHelper.js` + Supertest.
5. Cobertura mínima: 90% statements en controllers críticos.
