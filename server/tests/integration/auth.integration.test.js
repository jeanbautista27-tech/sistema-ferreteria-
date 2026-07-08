/**
 * PRUEBAS DE INTEGRACIÓN — Autenticación
 *
 * Proceso de negocio: login de usuarios y protección de rutas con JWT.
 * Es la puerta de entrada al sistema; sin esto ningún otro proceso funciona.
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('../../src/config/db', () => ({
    authenticate: jest.fn().mockResolvedValue(true),
    define:       jest.fn().mockReturnValue({}),
    transaction:  jest.fn(),
}));

jest.mock('../../src/models', () => ({
    Usuario:  { findOne: jest.fn(), findByPk: jest.fn() },
    Rol:      {},
    AuditLog: { create: jest.fn() },
}));

jest.mock('bcryptjs', () => ({
    compare: jest.fn(),
    hash:    jest.fn(),
}));

// ── Imports ───────────────────────────────────────────────────────────────────
const request  = require('supertest');
const bcrypt   = require('bcryptjs');
const app      = require('./setup/app-test');
const { generarToken } = require('./setup/tokenHelper');
const { Usuario, AuditLog } = require('../../src/models');

// ── Fixture ───────────────────────────────────────────────────────────────────
const USUARIO_MOCK = {
    id:            1,
    nombre:        'Admin Test',
    email:         'admin@ferreteria.com',
    password_hash: '$2a$10$hashedpassword',
    activo:        1,
    rol:           { nombre: 'Administrador' },
    update:        jest.fn().mockResolvedValue(true),
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/login
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › POST /api/auth/login', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET     = 'ferreteria_super_secret_2024';
        process.env.JWT_EXPIRES_IN = '1h';
    });

    test('200 devuelve token cuando las credenciales son correctas', async () => {
        Usuario.findOne.mockResolvedValue(USUARIO_MOCK);
        bcrypt.compare.mockResolvedValue(true);
        AuditLog.create.mockResolvedValue(true);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@ferreteria.com', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(typeof res.body.token).toBe('string');
        expect(res.body.usuario).toMatchObject({ id: 1, nombre: 'Admin Test', rol: 'Administrador' });
    });

    test('400 cuando no se envía email', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.msg).toBe('Email y contraseña requeridos');
    });

    test('400 cuando no se envía password', async () => {
        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@ferreteria.com' });

        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.msg).toBe('Email y contraseña requeridos');
    });

    test('401 cuando el usuario no existe', async () => {
        Usuario.findOne.mockResolvedValue(null);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'noexiste@ferreteria.com', password: 'cualquier' });

        expect(res.status).toBe(401);
        expect(res.body.ok).toBe(false);
        expect(res.body.msg).toBe('Credenciales incorrectas');
    });

    test('401 cuando la contraseña es incorrecta', async () => {
        Usuario.findOne.mockResolvedValue(USUARIO_MOCK);
        bcrypt.compare.mockResolvedValue(false);

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@ferreteria.com', password: 'wrongpassword' });

        expect(res.status).toBe(401);
        expect(res.body.ok).toBe(false);
        expect(res.body.msg).toBe('Credenciales incorrectas');
    });

    test('500 cuando la BD lanza error inesperado', async () => {
        Usuario.findOne.mockRejectedValue(new Error('Connection lost'));

        const res = await request(app)
            .post('/api/auth/login')
            .send({ email: 'admin@ferreteria.com', password: 'password123' });

        expect(res.status).toBe(500);
        expect(res.body.ok).toBe(false);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/auth/me — Ruta protegida con verifyToken
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/auth/me', () => {

    beforeEach(() => jest.clearAllMocks());

    test('401 sin header Authorization', async () => {
        const res = await request(app).get('/api/auth/me');

        expect(res.status).toBe(401);
        expect(res.body.msg).toBe('Token no proporcionado');
    });

    test('401 con token de formato inválido (sin "Bearer ")', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'tokensinbearer');

        expect(res.status).toBe(401);
    });

    test('401 con token inválido o expirado', async () => {
        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', 'Bearer token.invalido.xxxx');

        expect(res.status).toBe(401);
        expect(res.body.msg).toBe('Token inválido o expirado');
    });

    test('200 devuelve datos del usuario con token válido', async () => {
        Usuario.findByPk.mockResolvedValue(USUARIO_MOCK);
        const token = generarToken({ id: 1 });

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.usuario).toBeDefined();
    });

    test('404 cuando el usuario del token ya no existe en BD', async () => {
        Usuario.findByPk.mockResolvedValue(null);
        const token = generarToken({ id: 999 });

        const res = await request(app)
            .get('/api/auth/me')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).toBe(404);
        expect(res.body.msg).toBe('Usuario no encontrado');
    });
});
