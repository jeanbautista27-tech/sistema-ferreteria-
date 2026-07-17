/**
 * PRUEBAS DE INTEGRACIÓN — Categorías
 * Roles: Lectura todos | Escritura Admin + Almacenero
 */

jest.mock('../../src/config/db', () => ({
    authenticate: jest.fn().mockResolvedValue(true),
    define:       jest.fn().mockReturnValue({}),
    transaction:  jest.fn(),
}));

jest.mock('../../src/models', () => ({
    Categoria: { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
}));

const request = require('supertest');
const app     = require('./setup/app-test');
const { generarToken } = require('./setup/tokenHelper');
const { Categoria } = require('../../src/models');

const TOKEN            = `Bearer ${generarToken()}`;
const TOKEN_ALMACENERO = `Bearer ${generarToken({ rol: 'Almacenero' })}`;
const TOKEN_CAJERO     = `Bearer ${generarToken({ rol: 'Cajero' })}`;

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › Categorías — seguridad', () => {

    test('401 GET /api/categorias sin token', async () => {
        const res = await request(app).get('/api/categorias');
        expect(res.status).toBe(401);
    });

    test('403 POST /api/categorias con rol Cajero', async () => {
        const res = await request(app)
            .post('/api/categorias')
            .set('Authorization', TOKEN_CAJERO)
            .send({ nombre: 'Test' });
        expect(res.status).toBe(403);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/categorias', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de categorías', async () => {
        Categoria.findAll.mockResolvedValue([
            { id: 1, nombre: 'Herramientas' },
            { id: 2, nombre: 'Pinturas' },
        ]);

        const res = await request(app)
            .get('/api/categorias')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.categorias).toHaveLength(2);
    });

    test('200 Almacenero puede listar categorías', async () => {
        Categoria.findAll.mockResolvedValue([]);

        const res = await request(app)
            .get('/api/categorias')
            .set('Authorization', TOKEN_ALMACENERO);

        expect(res.status).toBe(200);
    });

    test('200 Cajero puede listar categorías (lectura)', async () => {
        Categoria.findAll.mockResolvedValue([]);

        const res = await request(app)
            .get('/api/categorias')
            .set('Authorization', TOKEN_CAJERO);

        expect(res.status).toBe(200);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › POST /api/categorias', () => {

    beforeEach(() => jest.clearAllMocks());

    test('400 cuando no se envía nombre', async () => {
        const res = await request(app)
            .post('/api/categorias')
            .set('Authorization', TOKEN)
            .send({ descripcion: 'Sin nombre' });

        expect(res.status).toBe(400);
        expect(res.body.msg).toBe('Nombre es requerido');
    });

    test('201 Admin crea categoría correctamente', async () => {
        Categoria.create.mockResolvedValue({ id: 3, nombre: 'Electricidad' });

        const res = await request(app)
            .post('/api/categorias')
            .set('Authorization', TOKEN)
            .send({ nombre: 'Electricidad', descripcion: 'Material eléctrico' });

        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
        expect(res.body.msg).toBe('Categoría creada');
    });

    test('201 Almacenero puede crear categoría', async () => {
        Categoria.create.mockResolvedValue({ id: 4, nombre: 'Jardinería' });

        const res = await request(app)
            .post('/api/categorias')
            .set('Authorization', TOKEN_ALMACENERO)
            .send({ nombre: 'Jardinería' });

        expect(res.status).toBe(201);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › PUT /api/categorias/:id', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando la categoría no existe', async () => {
        Categoria.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .put('/api/categorias/9999')
            .set('Authorization', TOKEN)
            .send({ nombre: 'X' });

        expect(res.status).toBe(404);
        expect(res.body.msg).toBe('Categoría no encontrada');
    });

    test('200 actualiza la categoría correctamente', async () => {
        Categoria.findByPk.mockResolvedValue({
            id: 1, nombre: 'Herramientas',
            update: jest.fn().mockResolvedValue(true),
        });

        const res = await request(app)
            .put('/api/categorias/1')
            .set('Authorization', TOKEN)
            .send({ nombre: 'Herramientas Manuales' });

        expect(res.status).toBe(200);
        expect(res.body.msg).toBe('Categoría actualizada');
    });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › DELETE /api/categorias/:id', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando la categoría no existe', async () => {
        Categoria.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .delete('/api/categorias/9999')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(404);
    });

    test('200 desactiva la categoría — soft delete', async () => {
        const mock = { id: 1, update: jest.fn().mockResolvedValue(true) };
        Categoria.findByPk.mockResolvedValue(mock);

        const res = await request(app)
            .delete('/api/categorias/1')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.msg).toBe('Categoría eliminada');
        expect(mock.update).toHaveBeenCalledWith({ activo: 0 });
    });
});
