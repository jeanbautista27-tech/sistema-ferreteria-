// Mock de jsonwebtoken antes de requerir el middleware
jest.mock('jsonwebtoken');

const jwt = require('jsonwebtoken');
const { verifyToken, requireAdmin } = require('../../src/middlewares/auth');

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
//  verifyToken
// ─────────────────────────────────────────────
describe('Middleware › verifyToken', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.JWT_SECRET = 'test_secret';
    });

    test('401 cuando no existe el header Authorization', () => {
        const req  = { headers: {} };
        const res  = mockRes();
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Token no proporcionado' });
        expect(next).not.toHaveBeenCalled();
    });

    test('401 cuando el header Authorization existe pero no contiene el token (formato inválido)', () => {
        // "Bearer" sin la segunda parte → split(' ')[1] es undefined
        const req  = { headers: { authorization: 'Bearer' } };
        const res  = mockRes();
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Formato de token inválido' });
        expect(next).not.toHaveBeenCalled();
    });

    test('401 cuando jwt.verify() lanza excepción (token inválido o expirado)', () => {
        jwt.verify.mockImplementation(() => { throw new Error('jwt expired'); });

        const req  = { headers: { authorization: 'Bearer token_invalido' } };
        const res  = mockRes();
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('token_invalido', 'test_secret');
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Token inválido o expirado' });
        expect(next).not.toHaveBeenCalled();
    });

    test('asigna req.user y llama next() cuando el token es válido', () => {
        const decoded = { id: 1, nombre: 'Admin', email: 'admin@test.com', rol: 'Administrador' };
        jwt.verify.mockReturnValue(decoded);

        const req  = { headers: { authorization: 'Bearer token_valido' } };
        const res  = mockRes();
        const next = jest.fn();

        verifyToken(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('token_valido', 'test_secret');
        expect(req.user).toEqual(decoded);
        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
});

// ─────────────────────────────────────────────
//  requireAdmin
// ─────────────────────────────────────────────
describe('Middleware › requireAdmin', () => {

    beforeEach(() => jest.clearAllMocks());

    test('llama next() cuando el usuario tiene rol "Administrador"', () => {
        const req  = { user: { id: 1, nombre: 'Admin', rol: 'Administrador' } };
        const res  = mockRes();
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });

    test('403 cuando el usuario tiene un rol distinto de "Administrador"', () => {
        const req  = { user: { id: 2, nombre: 'Vendedor', rol: 'vendedor' } };
        const res  = mockRes();
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            msg: 'Acceso denegado. Se requiere rol Administrador.',
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('403 cuando req.user no existe (optional chaining devuelve undefined)', () => {
        const req  = {};   // sin propiedad user
        const res  = mockRes();
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            msg: 'Acceso denegado. Se requiere rol Administrador.',
        });
        expect(next).not.toHaveBeenCalled();
    });

    test('403 cuando req.user existe pero no tiene la propiedad rol', () => {
        const req  = { user: { id: 3, nombre: 'Sin Rol' } };
        const res  = mockRes();
        const next = jest.fn();

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });
});
