/**
 * PRUEBAS DE INTEGRACIÓN — Compras
 *
 * Proceso de negocio: registrar órdenes de compra a proveedores, manejar
 * pagos al contado vs crédito, y recibir mercancía actualizando el stock.
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
    Compra:               { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
    DetalleCompra:        { create: jest.fn() },
    Producto:             { findByPk: jest.fn() },
    Proveedor:            {},
    Usuario:              {},
    InventarioMovimiento: { create: jest.fn() },
    CuentaPagar:          { create: jest.fn() },
    Caja:                 { findOne: jest.fn() },
    CajaEgreso:           { create: jest.fn() },
}));

// ── Imports ───────────────────────────────────────────────────────────────────
const request  = require('supertest');
const app      = require('./setup/app-test');
const { generarToken } = require('./setup/tokenHelper');
const { Compra, DetalleCompra, Producto, CuentaPagar, Caja, CajaEgreso, InventarioMovimiento } = require('../../src/models');

const TOKEN = `Bearer ${generarToken()}`;

// ─────────────────────────────────────────────────────────────────────────────
//  Seguridad
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › Compras — seguridad', () => {

    test('401 GET /api/compras sin token', async () => {
        const res = await request(app).get('/api/compras');
        expect(res.status).toBe(401);
    });

    test('401 POST /api/compras sin token', async () => {
        const res = await request(app).post('/api/compras').send({});
        expect(res.status).toBe(401);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/compras
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/compras', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de compras', async () => {
        Compra.findAll.mockResolvedValue([
            { id: 1, numero_orden: 'OC-001', estado: 'Pendiente', total: '590.00' },
            { id: 2, numero_orden: 'OC-002', estado: 'Recibida',  total: '118.00' },
        ]);

        const res = await request(app).get('/api/compras').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.compras).toHaveLength(2);
    });

    test('200 filtra por ?estado=Recibida', async () => {
        Compra.findAll.mockResolvedValue([]);

        const res = await request(app).get('/api/compras?estado=Recibida').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(Compra.findAll).toHaveBeenCalledTimes(1);
    });

    test('500 cuando la BD falla', async () => {
        Compra.findAll.mockRejectedValue(new Error('DB error'));

        const res = await request(app).get('/api/compras').set('Authorization', TOKEN);

        expect(res.status).toBe(500);
        expect(res.body.msg).toBe('Error al obtener compras');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/compras/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/compras/:id', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna la compra con sus detalles', async () => {
        Compra.findByPk.mockResolvedValue({ id: 1, numero_orden: 'OC-001', detalles: [] });

        const res = await request(app).get('/api/compras/1').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.compra.numero_orden).toBe('OC-001');
    });

    test('404 cuando la compra no existe', async () => {
        Compra.findByPk.mockResolvedValue(null);

        const res = await request(app).get('/api/compras/9999').set('Authorization', TOKEN);

        expect(res.status).toBe(404);
        expect(res.body.msg).toBe('Compra no encontrada');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/compras
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › POST /api/compras', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.commit.mockResolvedValue(true);
        mockTransaction.rollback.mockResolvedValue(true);
    });

    test('400 cuando no se envía proveedor_id', async () => {
        const res = await request(app)
            .post('/api/compras').set('Authorization', TOKEN)
            .send({ items: [{ producto_id: 1, cantidad: 10, precio_unitario: 50 }] });

        expect(res.status).toBe(400);
        expect(res.body.msg).toBe('Proveedor es requerido');
    });

    test('400 cuando no se envían items', async () => {
        const res = await request(app)
            .post('/api/compras').set('Authorization', TOKEN)
            .send({ proveedor_id: 1, items: [] });

        expect(res.status).toBe(400);
        expect(res.body.msg).toBe('No hay productos');
    });

    test('201 registra compra al crédito y crea cuenta por pagar', async () => {
        Compra.create.mockResolvedValue({ id: 5, numero_orden: 'OC-123', total: '590.00' });
        CuentaPagar.create.mockResolvedValue(true);
        DetalleCompra.create.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/compras').set('Authorization', TOKEN)
            .send({ proveedor_id: 1, tipo_pago: 'Crédito', estado: 'Pendiente',
                    items: [{ producto_id: 1, cantidad: 10, precio_unitario: 50 }] });

        expect(res.status).toBe(201);
        expect(res.body.msg).toBe('Compra registrada');
        expect(CuentaPagar.create).toHaveBeenCalledTimes(1);
        expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('201 registra compra al contado con caja abierta', async () => {
        Compra.create.mockResolvedValue({ id: 6, numero_orden: 'OC-456', total: '118.00' });
        Caja.findOne.mockResolvedValue({ id: 1, estado: 'Abierta' });
        CajaEgreso.create.mockResolvedValue(true);
        DetalleCompra.create.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/compras').set('Authorization', TOKEN)
            .send({ proveedor_id: 2, tipo_pago: 'Efectivo', estado: 'Pendiente',
                    items: [{ producto_id: 2, cantidad: 2, precio_unitario: 50 }] });

        expect(res.status).toBe(201);
        expect(CajaEgreso.create).toHaveBeenCalledTimes(1);
        expect(mockTransaction.commit).toHaveBeenCalled();
    });

    test('500 hace rollback cuando no hay caja abierta para pago al contado', async () => {
        Compra.create.mockResolvedValue({ id: 7, numero_orden: 'OC-789' });
        Caja.findOne.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/compras').set('Authorization', TOKEN)
            .send({ proveedor_id: 1, tipo_pago: 'Efectivo', estado: 'Pendiente',
                    items: [{ producto_id: 1, cantidad: 1, precio_unitario: 100 }] });

        expect(res.status).toBe(500);
        expect(mockTransaction.rollback).toHaveBeenCalled();
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/compras/:id/recibir
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › PUT /api/compras/:id/recibir', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.commit.mockResolvedValue(true);
        mockTransaction.rollback.mockResolvedValue(true);
    });

    test('404 cuando la compra no existe', async () => {
        Compra.findByPk.mockResolvedValue(null);

        const res = await request(app).put('/api/compras/9999/recibir').set('Authorization', TOKEN);

        expect(res.status).toBe(404);
        expect(res.body.msg).toBe('Compra no encontrada');
    });

    test('400 cuando la compra ya fue recibida', async () => {
        Compra.findByPk.mockResolvedValue({ id: 1, estado: 'Recibida', detalles: [] });

        const res = await request(app).put('/api/compras/1/recibir').set('Authorization', TOKEN);

        expect(res.status).toBe(400);
        expect(res.body.msg).toBe('La compra ya fue recibida');
    });

    test('200 recibe la compra y actualiza stock', async () => {
        const prodMock = { id: 1, stock: 5, update: jest.fn().mockResolvedValue(true) };
        Compra.findByPk.mockResolvedValue({
            id: 1, estado: 'Pendiente', numero_orden: 'OC-001',
            detalles: [{ producto_id: 1, cantidad: 10 }],
            update: jest.fn().mockResolvedValue(true),
        });
        Producto.findByPk.mockResolvedValue(prodMock);
        InventarioMovimiento.create.mockResolvedValue(true);

        const res = await request(app).put('/api/compras/1/recibir').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.msg).toBe('Compra recibida y stock actualizado');
        expect(prodMock.update).toHaveBeenCalledWith({ stock: 15 }, expect.anything()); // 5+10=15
        expect(mockTransaction.commit).toHaveBeenCalled();
    });
});
