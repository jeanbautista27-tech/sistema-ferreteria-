/**
 * PRUEBAS DE INTEGRACIÓN — Productos
 *
 * Proceso de negocio: gestión del catálogo de productos (CRUD).
 * Es la base del inventario: sin productos no hay ventas ni compras.
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('../../src/config/db', () => ({
    authenticate: jest.fn().mockResolvedValue(true),
    define:       jest.fn().mockReturnValue({}),
    transaction:  jest.fn(),
}));

jest.mock('../../src/models', () => ({
    Producto:  { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
    Categoria: {},
    Proveedor: {},
}));

// ── Imports ───────────────────────────────────────────────────────────────────
const request = require('supertest');
const app     = require('./setup/app-test');
const { generarToken } = require('./setup/tokenHelper');
const { Producto } = require('../../src/models');

const TOKEN = `Bearer ${generarToken()}`;

// ─────────────────────────────────────────────────────────────────────────────
//  Seguridad
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › Productos — seguridad', () => {

    test('401 GET /api/productos sin token', async () => {
        const res = await request(app).get('/api/productos');
        expect(res.status).toBe(401);
    });

    test('401 POST /api/productos sin token', async () => {
        const res = await request(app).post('/api/productos').send({});
        expect(res.status).toBe(401);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/productos
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/productos', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de productos activos', async () => {
        Producto.findAll.mockResolvedValue([
            { id: 1, nombre: 'Martillo', stock: 10, precio_venta: '25.00', activo: 1 },
            { id: 2, nombre: 'Sierra',   stock: 5,  precio_venta: '80.00', activo: 1 },
        ]);

        const res = await request(app).get('/api/productos').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.productos).toHaveLength(2);
    });

    test('200 acepta filtro ?search=Martillo', async () => {
        Producto.findAll.mockResolvedValue([]);

        const res = await request(app).get('/api/productos?search=Martillo').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(Producto.findAll).toHaveBeenCalledTimes(1);
    });

    test('500 cuando la BD falla', async () => {
        Producto.findAll.mockRejectedValue(new Error('DB error'));

        const res = await request(app).get('/api/productos').set('Authorization', TOKEN);

        expect(res.status).toBe(500);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/productos/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/productos/:id', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna el producto cuando existe', async () => {
        Producto.findByPk.mockResolvedValue({ id: 1, nombre: 'Martillo', stock: 10 });

        const res = await request(app).get('/api/productos/1').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.producto.nombre).toBe('Martillo');
    });

    test('404 cuando el producto no existe', async () => {
        Producto.findByPk.mockResolvedValue(null);

        const res = await request(app).get('/api/productos/9999').set('Authorization', TOKEN);

        expect(res.status).toBe(404);
        expect(res.body.msg).toBe('Producto no encontrado');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/productos
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › POST /api/productos', () => {

    beforeEach(() => jest.clearAllMocks());

    test('400 cuando no se envía nombre', async () => {
        const res = await request(app)
            .post('/api/productos').set('Authorization', TOKEN)
            .send({ precio_venta: 25 });

        expect(res.status).toBe(400);
        expect(res.body.msg).toBe('Nombre es requerido');
    });

    test('400 cuando no se envía precio_venta', async () => {
        const res = await request(app)
            .post('/api/productos').set('Authorization', TOKEN)
            .send({ nombre: 'Destornillador' });

        expect(res.status).toBe(400);
        expect(res.body.msg).toBe('Precio de venta es requerido');
    });

    test('201 crea el producto correctamente', async () => {
        Producto.create.mockResolvedValue({ id: 3, nombre: 'Destornillador', precio_venta: '15.00', stock: 0 });

        const res = await request(app)
            .post('/api/productos').set('Authorization', TOKEN)
            .send({ nombre: 'Destornillador', precio_venta: 15 });

        expect(res.status).toBe(201);
        expect(res.body.msg).toBe('Producto creado');
        expect(res.body.producto.nombre).toBe('Destornillador');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/productos/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › PUT /api/productos/:id', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el producto no existe', async () => {
        Producto.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .put('/api/productos/9999').set('Authorization', TOKEN)
            .send({ nombre: 'Nuevo' });

        expect(res.status).toBe(404);
        expect(res.body.msg).toBe('Producto no encontrado');
    });

    test('200 actualiza el producto correctamente', async () => {
        Producto.findByPk.mockResolvedValue({ id: 1, nombre: 'Martillo', update: jest.fn().mockResolvedValue(true) });

        const res = await request(app)
            .put('/api/productos/1').set('Authorization', TOKEN)
            .send({ nombre: 'Martillo de Goma' });

        expect(res.status).toBe(200);
        expect(res.body.msg).toBe('Producto actualizado');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  DELETE /api/productos/:id
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › DELETE /api/productos/:id', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el producto no existe', async () => {
        Producto.findByPk.mockResolvedValue(null);

        const res = await request(app).delete('/api/productos/9999').set('Authorization', TOKEN);

        expect(res.status).toBe(404);
    });

    test('200 desactiva el producto (soft delete)', async () => {
        const existente = { id: 1, activo: 1, update: jest.fn().mockResolvedValue(true) };
        Producto.findByPk.mockResolvedValue(existente);

        const res = await request(app).delete('/api/productos/1').set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.msg).toBe('Producto eliminado');
        expect(existente.update).toHaveBeenCalledWith({ activo: 0 });
    });
});
