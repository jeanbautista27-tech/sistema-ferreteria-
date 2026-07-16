# 10 — Plan de Pruebas

**Versión:** 1.0 | **Framework:** Jest 30.4.2 + Supertest 7.2.2

---

## Resultado actual verificado

```
Test Suites: 22 passed, 22 total
Tests:       290 passed, 290 total
Fallos:      0
Tiempo:      ~7.5 segundos
```

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

## Pruebas de integración (55 pruebas)

### Infraestructura

```js
// tests/integration/setup/app-test.js
// Express sin listen() ni conexión real a BD
// Mocks de modelos — misma estrategia que unitarias

// tests/integration/setup/tokenHelper.js
// Genera JWT firmado con JWT_SECRET para usar en headers
const generarToken = (payload = {}) =>
    jwt.sign({ id: 1, nombre: 'Test Admin', email: 'admin@test.com', rol: 'Administrador', ...payload }, SECRET, { expiresIn: '1h' });
```

### Suites de integración

| Suite | Tests | Cobertura de proceso |
| --- | --- | --- |
| `auth.integration.test.js` | 11 | Login éxito/fallos, tokens, rutas protegidas sin token, con token inválido, con token válido |
| `ventas.integration.test.js` | 16 | Seguridad, listar, detalle, crear al contado, crear al crédito, rollback sin stock, anular, 400 ya anulada |
| `compras.integration.test.js` | 16 | Seguridad, listar, detalle, crear al crédito, crear al contado, rollback sin caja, recibir, 400 ya recibida |
| `productos.integration.test.js` | 12 | Seguridad, listar, filtrar, detalle, crear, validaciones 400, actualizar, eliminar |

---

## Cobertura de código

### Configuración Jest

```js
// jest.config.js
collectCoverageFrom: ["src/**/*.js", "!src/app.js"]
```

### Resultado verificado

| Capa | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| Controllers (17) | 96.59% | 88.14% | 93.47% | 97.78% |
| Middlewares (1) | 95.65% | 90.00% | 100.00% | 95.00% |

### Módulos con cobertura 100%

- `authController` · `cajaController` · `categoriasController`
- `clientesController` · `comprasController` · `configuracionController`
- `inventarioController` · `proveedoresController` · `usuariosController`
- `auth.js` (middleware)

---

## Comandos de ejecución

```bash
cd server

# Todas las pruebas
npm test

# Solo integración
npx jest --testPathPatterns="integration" --no-coverage --verbose

# Con cobertura
npm run coverage

# Reporte HTML
start coverage/lcov-report/index.html   # Windows
```

---

## Reglas de pruebas (SDD)

1. Toda prueba unitaria usa `jest.mock()` — nunca conecta a BD real.
2. `beforeEach(() => jest.clearAllMocks())` en cada `describe`.
3. `return` dentro de `try` NO activa `catch` → no hay `rollback`. Los tests verifican esto con `expect(mockTransaction.rollback).not.toHaveBeenCalled()`.
4. Las pruebas de integración usan `app-test.js` + `tokenHelper.js` + Supertest.
5. Cobertura mínima: 90% statements en controllers críticos.
