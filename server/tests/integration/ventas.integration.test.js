/**
 * PRUEBAS DE INTEGRACIÓN — Ventas (Punto de Venta)
 *
 * Proceso más crítico: registrar una venta descuenta el stock, genera el
 * comprobante y opcionalmente crea una cuenta por cobrar.
 * Anular revierte el stock automáticamente.
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
    Venta:                { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
    DetalleVenta:         { create: jest.fn() },
    Producto:             { findByPk: jest.fn() },
    Cliente:              {},
    Usuario:              {},
    InventarioMovimiento: { create: jest.fn() },
    Configuracion:        { findOne: jest.fn(), update: jest.fn() },
    CuentaCobrar:         { create: jest.fn() },
}));

// ── Imports ───────────────────────────────────────────────────────────────────
const request  = require('supertest');
const app      = require('./setup/app-test');
const { generarToken } = require('./setup/tokenHelper');
const {
    Venta, DetalleVenta, Producto, Configuracion, CuentaCobrar, InventarioMovimiento,
} = require('../../src/models');

const TOKEN = `Bearer ${generarToken()}`;

// ── Helpers ───────────────────────────────────────────────────────────────────
const mockProducto = (stock = 20) => ({
    id: 1, nombre: 'Martillo', stock,
    update: jest.fn().mockResolvedValue(true),
});

const setupVentaExitosa = (idVenta = 10) => {
    Configuracion.findOne
        .mockResolvedValueOnce({ valor: 'B001' })
        .mockResolvedValueOnce({ valor: '1'    })
        .mockResolvedValueOnce({ valor: '18'   });
    Producto.findByPk.mockResolvedValue(mockProducto(20));
    const venta = { id: idVenta, numero_comprobante: 'B001-00000001', total: '100.00', estado: 'Completada' };
    Venta.create.mockResolvedValue(venta);
    DetalleVenta.create.mockResolvedValue(true);
    InventarioMovimiento.create.mockResolvedValue(true);
    Configuracion.update.mockResolvedValue(true);
    Venta.findByPk.mockResolvedValue({ ...venta, detalles: [{ producto_id: 1, cantidad: 2 }], cliente: null });
};

// ─────────────────────────────────────────────────────────────────────────────
//  Seguridad
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › Ventas — seguridad', () => {

    test('401 GET /api/ventas sin token', async () => {
        const res = await request(app).get('/api/ventas');
        expect(res.status).toBe(401);
        expect(res.body.msg).toBe('Token no proporcionado');
    });

    test('401 POST /api/ventas sin token', async () => {
        const res = await request(app).post('/api/ventas').send({});
        expect(res.status).toBe(401);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/ventas
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/ventas', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de ventas', async () => {
        Venta.findAll.mockResolvedValue([
            { id: 1, numero_comprobante: 'B001-00000001', total: '118.00', estado: 'Completada' },
            { id: 2, numero_comprobante: 'B001-00000002', total: '59.00',  estado: 'Completada' },
        ]);

        const res = await request(app).get('/api/ventas').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.ventas).toHaveLength(2);
    });

    test('200 retorna array vacío cuando no hay ventas', async () => {
        Venta.findAll.mockResolvedValue([]);

        const res = await request(app).get('/api/ventas').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ventas).toEqual([]);
    });

    test('200 acepta filtro ?estado=Anulada', async () => {
        Venta.findAll.mockResolvedValue([]);

        const res = await request(app).get('/api/ventas?estado=Anulada').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(Venta.findAll).toHaveBeenCalledTimes(1);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/ventas/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/ventas/:id', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna la venta con sus detalles', async () => {
        Venta.findByPk.mockResolvedValue({ id: 1, total: '118.00', detalles: [] });

        const res = await request(app).get('/api/ventas/1').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.venta).toBeDefined();
    });

    test('404 cuando la venta no existe', async () => {
        Venta.findByPk.mockResolvedValue(null);

        const res = await request(app).get('/api/ventas/9999').set('Authorization', TOKEN);

        expect(res.status).toBe(404);
        expect(res.body.msg).toBe('Venta no encontrada');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/ventas
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › POST /api/ventas', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.commit.mockResolvedValue(true);
        mockTransaction.rollback.mockResolvedValue(true);
    });

    test('400 cuando no se envían items', async () => {
        const res = await request(app)
            .post('/api/ventas').set('Authorization', TOKEN)
            .send({ tipo_pago: 'Efectivo', items: [] });

        expect(res.status).toBe(400);
        expect(res.body.msg).toBe('No hay productos en la venta');
    });

    test('400 cuando venta al crédito no tiene cliente', async () => {
        const res = await request(app)
            .post('/api/ventas').set('Authorization', TOKEN)
            .send({ tipo_pago: 'Crédito', cliente_id: '', items: [{ producto_id: 1, cantidad: 1, precio_unitario: 50 }] });

        expect(res.status).toBe(400);
        expect(res.body.msg).toContain('crédito');
    });

    test('201 registra venta al contado', async () => {
        setupVentaExitosa(10);

        const res = await request(app)
            .post('/api/ventas').set('Authorization', TOKEN)
            .send({
                tipo_pago: 'Efectivo', tipo_comprobante: 'Boleta', monto_recibido: 120, descuento: 0,
                items: [{ producto_id: 1, cantidad: 2, precio_unitario: 50, descuento: 0 }],
            });

        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
        expect(res.body.msg).toBe('Venta registrada exitosamente');
        expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('201 registra venta al crédito y crea cuenta por cobrar', async () => {
        setupVentaExitosa(11);
        CuentaCobrar.create.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/ventas').set('Authorization', TOKEN)
            .send({
                tipo_pago: 'Crédito', cliente_id: '3', tipo_comprobante: 'Boleta', descuento: 0,
                items: [{ producto_id: 1, cantidad: 1, precio_unitario: 200, descuento: 0 }],
            });

        expect(res.status).toBe(201);
        expect(CuentaCobrar.create).toHaveBeenCalledTimes(1);
        expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('500 hace rollback cuando el producto no tiene stock suficiente', async () => {
        Configuracion.findOne
            .mockResolvedValueOnce({ valor: 'B001' })
            .mockResolvedValueOnce({ valor: '1'    })
            .mockResolvedValueOnce({ valor: '18'   });
        Producto.findByPk.mockResolvedValue(mockProducto(0));

        const res = await request(app)
            .post('/api/ventas').set('Authorization', TOKEN)
            .send({ tipo_pago: 'Efectivo', items: [{ producto_id: 1, cantidad: 5, precio_unitario: 10, descuento: 0 }] });

        expect(res.status).toBe(500);
        expect(mockTransaction.rollback).toHaveBeenCalled();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/ventas/:id/anular
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › PUT /api/ventas/:id/anular', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.commit.mockResolvedValue(true);
        mockTransaction.rollback.mockResolvedValue(true);
    });

    test('404 cuando la venta no existe', async () => {
        Venta.findByPk.mockResolvedValue(null);

        const res = await request(app).put('/api/ventas/9999/anular').set('Authorization', TOKEN);

        expect(res.status).toBe(404);
        expect(res.body.msg).toBe('Venta no encontrada');
    });

    test('400 cuando la venta ya está anulada', async () => {
        Venta.findByPk.mockResolvedValue({ id: 1, estado: 'Anulada', detalles: [] });

        const res = await request(app).put('/api/ventas/1/anular').set('Authorization', TOKEN);

        expect(res.status).toBe(400);
        expect(res.body.msg).toBe('La venta ya está anulada');
    });

    test('200 anula la venta y revierte el stock', async () => {
        const prodMock = mockProducto(8);
        Venta.findByPk.mockResolvedValue({
            id: 1, estado: 'Completada',
            detalles: [{ producto_id: 1, cantidad: 2 }],
            update: jest.fn().mockResolvedValue(true),
        });
        Producto.findByPk.mockResolvedValue(prodMock);

        const res = await request(app).put('/api/ventas/1/anular').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.msg).toBe('Venta anulada y stock revertido');
        expect(prodMock.update).toHaveBeenCalledWith({ stock: 10 }, expect.anything()); // 8+2=10
        expect(mockTransaction.commit).toHaveBeenCalled();
    });
});
