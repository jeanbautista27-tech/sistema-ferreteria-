const bcrypt = require('bcryptjs');

// Mock de modelos antes de requerir el controller
jest.mock('../../src/models', () => ({
    Usuario: {
        findOne: jest.fn(),
        findByPk: jest.fn(),
    },
    Rol: {},
    AuditLog: {
        create: jest.fn(),
    },
}));

const { login, me } = require('../../src/controllers/authController');
const { Usuario, AuditLog } = require('../../src/models');

// ─────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────
const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  LOGIN
// ─────────────────────────────────────────────
describe('AuthController › login', () => {

    beforeEach(() => jest.clearAllMocks());

    beforeAll(() => {
        process.env.JWT_SECRET     = 'test_secret';
        process.env.JWT_EXPIRES_IN = '1h';
    });

    test('400 cuando no se envía email ni password', async () => {
        const req = { body: {} };
        const res = mockRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            msg: 'Email y contraseña requeridos',
        });
    });

    test('400 cuando falta el password', async () => {
        const req = { body: { email: 'test@test.com' } };
        const res = mockRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('400 cuando falta el email', async () => {
        const req = { body: { password: '123456' } };
        const res = mockRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('401 cuando el usuario no existe en la BD', async () => {
        Usuario.findOne.mockResolvedValue(null);
        const req = { body: { email: 'noexiste@test.com', password: '123456' } };
        const res = mockRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            msg: 'Credenciales incorrectas',
        });
    });

    test('401 cuando la contraseña es incorrecta', async () => {
        const hash = await bcrypt.hash('correcta', 10);
        Usuario.findOne.mockResolvedValue({
            id: 1, nombre: 'Admin', email: 'admin@test.com',
            password_hash: hash,
            rol: { nombre: 'admin' },
            update: jest.fn().mockResolvedValue(true),
        });

        const req = { body: { email: 'admin@test.com', password: 'incorrecta' } };
        const res = mockRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            msg: 'Credenciales incorrectas',
        });
    });

    test('200 con token cuando las credenciales son correctas', async () => {
        const hash = await bcrypt.hash('password123', 10);
        const mockUsuario = {
            id: 1, nombre: 'Admin', email: 'admin@test.com',
            password_hash: hash,
            rol: { nombre: 'admin' },
            update: jest.fn().mockResolvedValue(true),
        };
        Usuario.findOne.mockResolvedValue(mockUsuario);
        AuditLog.create.mockResolvedValue(true);

        const req = { body: { email: 'admin@test.com', password: 'password123' }, ip: '127.0.0.1' };
        const res = mockRes();

        await login(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                ok: true,
                token: expect.any(String),
                usuario: expect.objectContaining({ id: 1, nombre: 'Admin', rol: 'admin' }),
            })
        );
    });

    test('500 cuando ocurre un error inesperado', async () => {
        Usuario.findOne.mockRejectedValue(new Error('DB caída'));
        const req = { body: { email: 'x@x.com', password: '123' } };
        const res = mockRes();

        await login(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error en el servidor' })
        );
    });
});

// ─────────────────────────────────────────────
//  ME
// ─────────────────────────────────────────────
describe('AuthController › me', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el usuario del token no existe', async () => {
        Usuario.findByPk.mockResolvedValue(null);
        const req = { user: { id: 99 } };
        const res = mockRes();

        await me(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Usuario no encontrado' });
    });

    test('200 con datos del usuario autenticado', async () => {
        const mockUsuario = { id: 1, nombre: 'Admin', email: 'admin@test.com', rol: { nombre: 'admin' } };
        Usuario.findByPk.mockResolvedValue(mockUsuario);

        const req = { user: { id: 1 } };
        const res = mockRes();

        await me(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, usuario: mockUsuario });
    });

    test('500 cuando ocurre un error inesperado', async () => {
        Usuario.findByPk.mockRejectedValue(new Error('Error de BD'));
        const req = { user: { id: 1 } };
        const res = mockRes();

        await me(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
