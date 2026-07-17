/**
 * PRUEBAS DE INTEGRACIÓN — Devoluciones
 *
 * Cubre el flujo completo de devolución:
 * validaciones de entrada → reglas de negocio → reintegro de stock
 * → generación de nota de crédito NC001-XXXXXX → reembolso en caja.
 * Roles: Administrador y Cajero.
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockTransaction = {
    commit:   jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true),
};

jest.mock('../../src/config/db', () => ({
    authenticate: jest.fn().mockResolvedValue(true),
    define:       jest.fn().mockReturnValue({}),
    transaction:  jest.fn().mockResolvedValue(mockTransaction),
}));

jest.mock('../../src/models', () => ({
    Devolucion:           { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn(), count: jest.fn() },
    DetalleDevolucion:    { create: jest.fn() },
    Venta:                { findByPk: jest.fn() },
    DetalleVenta:         {},
    Producto:             { findByPk: jest.fn() },
    Cliente:              {},
    Usuario:              {},
    InventarioMovimiento: { create: jest.fn() },
    Caja:                 { findOne: jest.fn() },
    CajaEgreso:           { create: jest.fn() },
}));

// ── Imports ───────────────────────────────────────────────────────────────────
const request = require('supertest');
const app     = require('./setup/app-test');
const { generarToken } = require('./setup/tokenHelper');
const {
    Devolucion, DetalleDevolucion, Venta, Producto,
    InventarioMovimiento, Caja, CajaEgreso,
} = require('../../src/models');

const TOKEN        = `Bearer ${generarToken()}`;
const TOKEN_CAJERO = `Bearer ${generarToken({ rol: 'Cajero', id: 2 })}`;

// ── Helper: construye una venta mock con detalles ──────────────────────────────
const buildVentaMock = (overrides = {}) => ({
    id:                 1,
    numero_comprobante: 'B001-00000001',
    estado:             'Completada',
    detalles: [
        { producto_id: 1, cantidad: 3, precio_unitario: '50.00' },
        { producto_id: 2, cantidad: 2, precio_unitario: '30.00' },
    ],
    ...overrides,
});

const buildProductoMock = (id = 1, stock = 10) => ({
    id,
    stock,
    update: jest.fn().mockResolvedValue(true),
});

// ─────────────────────────────────────────────────────────────────────────────
//  Seguridad — rutas protegidas por rol
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › Devoluciones — seguridad', () => {

    test('401 GET /api/devoluciones sin token', async () => {
        const res = await request(app).get('/api/devoluciones');
        expect(res.status).toBe(401);
        expect(res.body.msg).toBe('Token no proporcionado');
    });

    test('401 POST /api/devoluciones sin token', async () => {
        const res = await request(app).post('/api/devoluciones').send({});
        expect(res.status).toBe(401);
    });

    test('403 POST /api/devoluciones con rol Almacenero', async () => {
        const tokenAlmacenero = `Bearer ${generarToken({ rol: 'Almacenero' })}`;
        const res = await request(app)
            .post('/api/devoluciones')
            .set('Authorization', tokenAlmacenero)
            .send({ items: [] });
        expect(res.status).toBe(403);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/devoluciones — Listar devoluciones
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/devoluciones', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de devoluciones', async () => {
        Devolucion.findAll.mockResolvedValue([
            { id: 1, numero_comprobante: 'NC001-000001', total_reembolso: '50.00' },
            { id: 2, numero_comprobante: 'NC001-000002', total_reembolso: '30.00' },
        ]);

        const res = await request(app)
            .get('/api/devoluciones')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.devoluciones).toHaveLength(2);
    });

    test('200 retorna array vacío cuando no hay devoluciones', async () => {
        Devolucion.findAll.mockResolvedValue([]);

        const res = await request(app)
            .get('/api/devoluciones')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.devoluciones).toEqual([]);
    });

    test('200 Cajero puede listar devoluciones', async () => {
        Devolucion.findAll.mockResolvedValue([]);

        const res = await request(app)
            .get('/api/devoluciones')
            .set('Authorization', TOKEN_CAJERO);

        expect(res.status).toBe(200);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/devoluciones/:id — Detalle de devolución
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/devoluciones/:id', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna la devolución con sus detalles', async () => {
        Devolucion.findByPk.mockResolvedValue({
            id: 1, numero_comprobante: 'NC001-000001', detalles: [],
        });

        const res = await request(app)
            .get('/api/devoluciones/1')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.devolucion).toBeDefined();
    });

    test('404 cuando la devolución no existe', async () => {
        Devolucion.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .get('/api/devoluciones/9999')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(404);
        expect(res.body.ok).toBe(false);
        expect(res.body.msg).toBe('Devolución no encontrada');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/devoluciones — Registrar devolución
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › POST /api/devoluciones', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.commit.mockResolvedValue(true);
        mockTransaction.rollback.mockResolvedValue(true);
    });

    // ── Validaciones de entrada ────────────────────────────────────────────────

    test('400 cuando no se envían items', async () => {
        const res = await request(app)
            .post('/api/devoluciones')
            .set('Authorization', TOKEN)
            .send({ venta_id: 1, motivo: 'Prueba', tipo_reembolso: 'Nota Credito', items: [] });

        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.msg).toBe('No se enviaron productos para devolver');
        // return directo antes de la transacción — rollback NO se llama
        expect(mockTransaction.rollback).not.toHaveBeenCalled();
    });

    test('404 cuando la venta no existe — return sin rollback', async () => {
        Venta.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/devoluciones')
            .set('Authorization', TOKEN)
            .send({
                venta_id: 9999,
                motivo:         'Prueba',
                tipo_reembolso: 'Nota Credito',
                items: [{ producto_id: 1, cantidad: 1 }],
            });

        expect(res.status).toBe(404);
        expect(res.body.msg).toBe('Venta no encontrada');
        // return directo en try — NO activa catch → NO hay rollback
        expect(mockTransaction.rollback).not.toHaveBeenCalled();
    });

    test('400 cuando la venta no está Completada — return sin rollback', async () => {
        Venta.findByPk.mockResolvedValue(buildVentaMock({ estado: 'Anulada' }));

        const res = await request(app)
            .post('/api/devoluciones')
            .set('Authorization', TOKEN)
            .send({
                venta_id:       1,
                motivo:         'Producto defectuoso',
                tipo_reembolso: 'Nota Credito',
                items: [{ producto_id: 1, cantidad: 1 }],
            });

        expect(res.status).toBe(400);
        expect(res.body.msg).toBe('Solo se pueden devolver ventas completadas');
        expect(mockTransaction.rollback).not.toHaveBeenCalled();
    });

    // ── Regla de negocio: cantidad no puede exceder lo vendido ─────────────────

    test('500 hace rollback cuando la cantidad excede lo vendido', async () => {
        Venta.findByPk.mockResolvedValue(buildVentaMock());

        const res = await request(app)
            .post('/api/devoluciones')
            .set('Authorization', TOKEN)
            .send({
                venta_id:       1,
                motivo:         'Error',
                tipo_reembolso: 'Nota Credito',
                items: [{ producto_id: 1, cantidad: 99 }], // excede cantidad=3
            });

        expect(res.status).toBe(500);
        expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    // ── Flujo exitoso: devolución con Nota de Crédito ─────────────────────────

    test('201 registra devolución con Nota de Crédito y reintegra stock', async () => {
        Venta.findByPk.mockResolvedValue(buildVentaMock());
        Devolucion.count.mockResolvedValue(0);

        const mockDevolucion = {
            id: 1,
            numero_comprobante: 'NC001-000001',
            total_reembolso: 50,
        };
        Devolucion.create.mockResolvedValue(mockDevolucion);
        DetalleDevolucion.create.mockResolvedValue(true);

        const prodMock = buildProductoMock(1, 10);
        Producto.findByPk.mockResolvedValue(prodMock);
        InventarioMovimiento.create.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/devoluciones')
            .set('Authorization', TOKEN)
            .send({
                venta_id:       1,
                motivo:         'Producto dañado',
                tipo_reembolso: 'Nota Credito',
                items: [{ producto_id: 1, cantidad: 1 }],
            });

        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
        expect(res.body.msg).toBe('Devolución registrada correctamente');
        expect(res.body.devolucion.numero_comprobante).toBe('NC001-000001');

        // Stock reintegrado: 10 + 1 = 11
        expect(prodMock.update).toHaveBeenCalledWith({ stock: 11 }, expect.anything());

        // Movimiento inventario tipo Entrada creado
        expect(InventarioMovimiento.create).toHaveBeenCalledWith(
            expect.objectContaining({ tipo: 'Entrada', cantidad: 1 }),
            expect.anything()
        );

        expect(mockTransaction.commit).toHaveBeenCalled();
        // Sin reembolso en efectivo — caja NO afectada
        expect(CajaEgreso.create).not.toHaveBeenCalled();
    });

    // ── Flujo exitoso: devolución con Reembolso en Efectivo ───────────────────

    test('201 registra devolución en Efectivo y descuenta la caja del usuario', async () => {
        Venta.findByPk.mockResolvedValue(buildVentaMock());
        Devolucion.count.mockResolvedValue(5);

        const mockDevolucion = {
            id: 6,
            numero_comprobante: 'NC001-000006',
            total_reembolso: 50,
        };
        Devolucion.create.mockResolvedValue(mockDevolucion);
        DetalleDevolucion.create.mockResolvedValue(true);

        const prodMock = buildProductoMock(1, 8);
        Producto.findByPk.mockResolvedValue(prodMock);
        InventarioMovimiento.create.mockResolvedValue(true);

        const mockCaja = {
            id: 1,
            total_egresos: '0',
            update: jest.fn().mockResolvedValue(true),
        };
        // devoluciones busca caja con { estado:'Abierta', usuario_id: req.user.id }
        Caja.findOne.mockResolvedValue(mockCaja);
        CajaEgreso.create.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/devoluciones')
            .set('Authorization', TOKEN)
            .send({
                venta_id:       1,
                motivo:         'Cliente insatisfecho',
                tipo_reembolso: 'Efectivo',
                items: [{ producto_id: 1, cantidad: 1 }],
            });

        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
        expect(res.body.devolucion.numero_comprobante).toBe('NC001-000006');

        // Stock reintegrado: 8 + 1 = 9
        expect(prodMock.update).toHaveBeenCalledWith({ stock: 9 }, expect.anything());

        // CajaEgreso creado con concepto de reembolso
        expect(CajaEgreso.create).toHaveBeenCalledWith(
            expect.objectContaining({
                caja_id: 1,
                concepto: expect.stringContaining('Reembolso'),
            }),
            expect.anything()
        );

        expect(mockTransaction.commit).toHaveBeenCalled();
    });

    // ── Regla de negocio: Efectivo sin caja del usuario ───────────────────────

    test('500 hace rollback cuando reembolso Efectivo y no hay caja del usuario', async () => {
        Venta.findByPk.mockResolvedValue(buildVentaMock());
        Devolucion.count.mockResolvedValue(0);
        Devolucion.create.mockResolvedValue({ id: 1, numero_comprobante: 'NC001-000001' });
        DetalleDevolucion.create.mockResolvedValue(true);

        const prodMock = buildProductoMock(1, 5);
        Producto.findByPk.mockResolvedValue(prodMock);
        InventarioMovimiento.create.mockResolvedValue(true);

        // Sin caja abierta para este usuario
        Caja.findOne.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/devoluciones')
            .set('Authorization', TOKEN)
            .send({
                venta_id:       1,
                motivo:         'Producto roto',
                tipo_reembolso: 'Efectivo',
                items: [{ producto_id: 1, cantidad: 1 }],
            });

        expect(res.status).toBe(500);
        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.body.msg).toContain('caja');
    });

    // ── Número de nota de crédito correlativo ─────────────────────────────────

    test('201 el número de nota de crédito sigue el formato NC001-XXXXXX', async () => {
        Venta.findByPk.mockResolvedValue(buildVentaMock());
        Devolucion.count.mockResolvedValue(9); // siguiente: 10 → NC001-000010

        const mockDevolucion = {
            id: 10,
            numero_comprobante: 'NC001-000010',
            total_reembolso: 30,
        };
        Devolucion.create.mockResolvedValue(mockDevolucion);
        DetalleDevolucion.create.mockResolvedValue(true);

        const prodMock = buildProductoMock(2, 5);
        Producto.findByPk.mockResolvedValue(prodMock);
        InventarioMovimiento.create.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/devoluciones')
            .set('Authorization', TOKEN)
            .send({
                venta_id:       1,
                motivo:         'Error de pedido',
                tipo_reembolso: 'Nota Credito',
                items: [{ producto_id: 2, cantidad: 1 }],
            });

        expect(res.status).toBe(201);
        // Verifica que create fue llamado con el número correlativo correcto
        expect(Devolucion.create).toHaveBeenCalledWith(
            expect.objectContaining({ numero_comprobante: 'NC001-000010' }),
            expect.anything()
        );
    });

    // ── Cajero puede registrar devoluciones ───────────────────────────────────

    test('201 Cajero puede registrar una devolución correctamente', async () => {
        Venta.findByPk.mockResolvedValue(buildVentaMock());
        Devolucion.count.mockResolvedValue(0);
        Devolucion.create.mockResolvedValue({ id: 1, numero_comprobante: 'NC001-000001', total_reembolso: 50 });
        DetalleDevolucion.create.mockResolvedValue(true);

        const prodMock = buildProductoMock(1, 7);
        Producto.findByPk.mockResolvedValue(prodMock);
        InventarioMovimiento.create.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/devoluciones')
            .set('Authorization', TOKEN_CAJERO)
            .send({
                venta_id:       1,
                motivo:         'Cajero procesa devolución',
                tipo_reembolso: 'Nota Credito',
                items: [{ producto_id: 1, cantidad: 1 }],
            });

        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
        expect(mockTransaction.commit).toHaveBeenCalled();
    });
});
