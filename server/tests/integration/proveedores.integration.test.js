/**
 * PRUEBAS DE INTEGRACIÓN — Proveedores
 * Roles: Lectura todos | Escritura Admin + Almacenero
 */

jest.mock('../../src/config/db', () => ({
    authenticate: jest.fn().mockResolvedValue(true),
    define:       jest.fn().mockReturnValue({}),
    transaction:  jest.fn(),
}));

jest.mock('../../src/models', () => ({
    Proveedor: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
}));

const request = require('supertest');
const app     = require('./setup/app-test');
const { generarToken } = require('./setup/tokenHelper');
const { Proveedor } = require('../../src/models');

const TOKEN            = `Bearer ${generarToken()}`;
const TOKEN_ALMACENERO = `Bearer ${generarToken({ rol: 'Almacenero' })}`;
const TOKEN_CAJERO     = `Bearer ${generarToken({ rol: 'Cajero' })}`;

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › Proveedores — seguridad', () => {

    test('401 GET /api/proveedores sin token', async () => {
        const res = await request(app).get('/api/proveedores');
        expect(res.status).toBe(401);
    });

    test('403 POST /api/proveedores con rol Cajero', async () => {
        const res = await request(app)
            .post('/api/proveedores')
            .set('Authorization', TOKEN_CAJERO)
            .send({ empresa: 'Test' });
        expect(res.status).toBe(403);
    });

    test('403 DELETE /api/proveedores/:id con rol Cajero', async () => {
        const res = await request(app)
            .delete('/api/proveedores/1')
            .set('Authorization', TOKEN_CAJERO);
        expect(res.status).toBe(403);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/proveedores', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de proveedores activos', async () => {
        Proveedor.findAll.mockResolvedValue([
            { id: 1, empresa: 'Distribuidora ABC', activo: 1 },
            { id: 2, empresa: 'Ferrocementos SAC', activo: 1 },
        ]);

        const res = await request(app)
            .get('/api/proveedores')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.proveedores).toHaveLength(2);
    });

    test('200 Almacenero puede listar proveedores', async () => {
        Proveedor.findAll.mockResolvedValue([]);

        const res = await request(app)
            .get('/api/proveedores')
            .set('Authorization', TOKEN_ALMACENERO);

        expect(res.status).toBe(200);
    });

    test('200 Cajero puede listar proveedores (lectura permitida)', async () => {
        Proveedor.findAll.mockResolvedValue([]);

        const res = await request(app)
            .get('/api/proveedores')
            .set('Authorization', TOKEN_CAJERO);

        expect(res.status).toBe(200);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › POST /api/proveedores', () => {

    beforeEach(() => jest.clearAllMocks());

    test('400 cuando no se envía razón social (empresa)', async () => {
        const res = await request(app)
            .post('/api/proveedores')
            .set('Authorization', TOKEN)
            .send({ ruc: '20123456789' });

        expect(res.status).toBe(400);
        expect(res.body.msg).toBe('Razón social es requerida');
    });

    test('201 Admin crea proveedor correctamente', async () => {
        Proveedor.create.mockResolvedValue({ id: 3, empresa: 'Importaciones XYZ' });

        const res = await request(app)
            .post('/api/proveedores')
            .set('Authorization', TOKEN)
            .send({ empresa: 'Importaciones XYZ', ruc: '20123456789' });

        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
        expect(res.body.msg).toBe('Proveedor creado');
    });

    test('201 Almacenero puede crear proveedor', async () => {
        Proveedor.create.mockResolvedValue({ id: 4, empresa: 'Nuevo Proveedor' });

        const res = await request(app)
            .post('/api/proveedores')
            .set('Authorization', TOKEN_ALMACENERO)
            .send({ empresa: 'Nuevo Proveedor' });

        expect(res.status).toBe(201);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › PUT /api/proveedores/:id', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el proveedor no existe', async () => {
        Proveedor.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .put('/api/proveedores/9999')
            .set('Authorization', TOKEN)
            .send({ empresa: 'X' });

        expect(res.status).toBe(404);
        expect(res.body.msg).toBe('Proveedor no encontrado');
    });

    test('200 actualiza el proveedor correctamente', async () => {
        Proveedor.findByPk.mockResolvedValue({
            id: 1, empresa: 'Dist. ABC',
            update: jest.fn().mockResolvedValue(true),
        });

        const res = await request(app)
            .put('/api/proveedores/1')
            .set('Authorization', TOKEN)
            .send({ empresa: 'Dist. ABC S.A.C.' });

        expect(res.status).toBe(200);
        expect(res.body.msg).toBe('Proveedor actualizado');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › DELETE /api/proveedores/:id', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el proveedor no existe', async () => {
        Proveedor.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .delete('/api/proveedores/9999')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(404);
    });

    test('200 desactiva el proveedor — soft delete', async () => {
        const mock = { id: 1, activo: 1, update: jest.fn().mockResolvedValue(true) };
        Proveedor.findByPk.mockResolvedValue(mock);

        const res = await request(app)
            .delete('/api/proveedores/1')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.msg).toBe('Proveedor eliminado');
        expect(mock.update).toHaveBeenCalledWith({ activo: 0 });
    });
});
