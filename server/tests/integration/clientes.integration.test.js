/**
 * PRUEBAS DE INTEGRACIÓN — Clientes
 * Roles: Lectura todos | Escritura solo Administrador
 */

jest.mock('../../src/config/db', () => ({
    authenticate: jest.fn().mockResolvedValue(true),
    define:       jest.fn().mockReturnValue({}),
    transaction:  jest.fn(),
}));

jest.mock('../../src/models', () => ({
    Cliente: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
}));

const request = require('supertest');
const app     = require('./setup/app-test');
const { generarToken } = require('./setup/tokenHelper');
const { Cliente } = require('../../src/models');

const TOKEN        = `Bearer ${generarToken()}`;
const TOKEN_CAJERO = `Bearer ${generarToken({ rol: 'Cajero' })}`;

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › Clientes — seguridad', () => {

    test('401 GET /api/clientes sin token', async () => {
        const res = await request(app).get('/api/clientes');
        expect(res.status).toBe(401);
    });

    test('403 POST /api/clientes con rol Cajero', async () => {
        const res = await request(app)
            .post('/api/clientes')
            .set('Authorization', TOKEN_CAJERO)
            .send({ nombre: 'Test' });
        expect(res.status).toBe(403);
    });

    test('403 DELETE /api/clientes/:id con rol Almacenero', async () => {
        const tokenAlm = `Bearer ${generarToken({ rol: 'Almacenero' })}`;
        const res = await request(app)
            .delete('/api/clientes/1')
            .set('Authorization', tokenAlm);
        expect(res.status).toBe(403);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/clientes', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de clientes activos', async () => {
        Cliente.findAll.mockResolvedValue([
            { id: 1, nombre: 'Juan Pérez', tipo_documento: 'DNI', activo: 1 },
            { id: 2, nombre: 'María García', tipo_documento: 'RUC', activo: 1 },
        ]);

        const res = await request(app)
            .get('/api/clientes')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.clientes).toHaveLength(2);
    });

    test('200 Cajero puede listar clientes (lectura permitida)', async () => {
        Cliente.findAll.mockResolvedValue([]);

        const res = await request(app)
            .get('/api/clientes')
            .set('Authorization', TOKEN_CAJERO);

        expect(res.status).toBe(200);
    });

    test('200 acepta filtro ?search=Juan', async () => {
        Cliente.findAll.mockResolvedValue([]);

        const res = await request(app)
            .get('/api/clientes?search=Juan')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(Cliente.findAll).toHaveBeenCalledTimes(1);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › POST /api/clientes', () => {

    beforeEach(() => jest.clearAllMocks());

    test('400 cuando no se envía nombre', async () => {
        const res = await request(app)
            .post('/api/clientes')
            .set('Authorization', TOKEN)
            .send({ telefono: '999999999' });

        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.msg).toBe('Nombre es requerido');
    });

    test('201 crea el cliente correctamente', async () => {
        Cliente.create.mockResolvedValue({ id: 3, nombre: 'Carlos López', activo: 1 });

        const res = await request(app)
            .post('/api/clientes')
            .set('Authorization', TOKEN)
            .send({ nombre: 'Carlos López', telefono: '987654321' });

        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
        expect(res.body.msg).toBe('Cliente creado');
        expect(res.body.cliente.nombre).toBe('Carlos López');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › PUT /api/clientes/:id', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el cliente no existe', async () => {
        Cliente.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .put('/api/clientes/9999')
            .set('Authorization', TOKEN)
            .send({ nombre: 'Nuevo' });

        expect(res.status).toBe(404);
        expect(res.body.msg).toBe('Cliente no encontrado');
    });

    test('200 actualiza el cliente correctamente', async () => {
        Cliente.findByPk.mockResolvedValue({
            id: 1, nombre: 'Juan',
            update: jest.fn().mockResolvedValue(true),
        });

        const res = await request(app)
            .put('/api/clientes/1')
            .set('Authorization', TOKEN)
            .send({ nombre: 'Juan Actualizado' });

        expect(res.status).toBe(200);
        expect(res.body.msg).toBe('Cliente actualizado');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › DELETE /api/clientes/:id', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el cliente no existe', async () => {
        Cliente.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .delete('/api/clientes/9999')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(404);
    });

    test('200 desactiva el cliente — soft delete', async () => {
        const mock = { id: 1, activo: 1, update: jest.fn().mockResolvedValue(true) };
        Cliente.findByPk.mockResolvedValue(mock);

        const res = await request(app)
            .delete('/api/clientes/1')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.msg).toBe('Cliente eliminado');
        expect(mock.update).toHaveBeenCalledWith({ activo: 0 });
    });
});
