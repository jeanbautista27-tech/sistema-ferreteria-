jest.mock('../../src/models', () => ({
    Usuario: {
        findAll:  jest.fn(),
        findByPk: jest.fn(),
        findOne:  jest.fn(),
        create:   jest.fn(),
    },
    Rol: {
        findAll: jest.fn(),
    },
}));

const { getAll, getRoles, create, update, remove } = require('../../src/controllers/usuariosController');
const { Usuario, Rol } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  getAll
// ─────────────────────────────────────────────
describe('UsuariosController › getAll', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de usuarios sin password_hash', async () => {
        const lista = [
            { id: 1, nombre: 'Admin', email: 'admin@test.com', rol: { nombre: 'admin' } },
        ];
        Usuario.findAll.mockResolvedValue(lista);

        const req = {};
        const res = mockRes();

        await getAll(req, res);

        expect(Usuario.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, usuarios: lista });
    });

    test('500 cuando la BD falla', async () => {
        Usuario.findAll.mockRejectedValue(new Error('DB error'));

        const req = {};
        const res = mockRes();

        await getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  getRoles
// ─────────────────────────────────────────────
describe('UsuariosController › getRoles', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de roles', async () => {
        const roles = [
            { id: 1, nombre: 'admin' },
            { id: 2, nombre: 'vendedor' },
        ];
        Rol.findAll.mockResolvedValue(roles);

        const req = {};
        const res = mockRes();

        await getRoles(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, roles });
    });

    test('500 cuando la BD falla', async () => {
        Rol.findAll.mockRejectedValue(new Error('DB error'));

        const req = {};
        const res = mockRes();

        await getRoles(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  create
// ─────────────────────────────────────────────
describe('UsuariosController › create', () => {

    beforeEach(() => jest.clearAllMocks());

    test('400 cuando faltan campos obligatorios', async () => {
        const req = { body: { nombre: 'Test' } }; // falta email, password, rol_id
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Todos los campos son requeridos' });
    });

    test('400 cuando el email ya está registrado', async () => {
        Usuario.findOne.mockResolvedValue({ id: 1, email: 'existe@test.com' });

        const req = { body: { nombre: 'Test', email: 'existe@test.com', password: '123', rol_id: 1 } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'El email ya está registrado' });
    });

    test('201 crea el usuario correctamente con contraseña hasheada', async () => {
        Usuario.findOne.mockResolvedValue(null); // email no existe
        Usuario.create.mockResolvedValue({ id: 5, nombre: 'Nuevo', email: 'nuevo@test.com' });

        const req = { body: { nombre: 'Nuevo', email: 'nuevo@test.com', password: 'segura123', rol_id: 2 } };
        const res = mockRes();

        await create(req, res);

        // Verifica que se llamó a create con password_hash (no password en texto plano)
        expect(Usuario.create).toHaveBeenCalledWith(
            expect.objectContaining({ password_hash: expect.any(String) })
        );
        expect(Usuario.create).toHaveBeenCalledWith(
            expect.not.objectContaining({ password: expect.anything() })
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true, msg: 'Usuario creado' })
        );
    });

    test('500 cuando la BD falla al crear', async () => {
        Usuario.findOne.mockResolvedValue(null);
        Usuario.create.mockRejectedValue(new Error('DB error'));

        const req = { body: { nombre: 'Test', email: 'test@test.com', password: '123', rol_id: 1 } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  update
// ─────────────────────────────────────────────
describe('UsuariosController › update', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el usuario no existe', async () => {
        Usuario.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 }, body: { nombre: 'Nuevo Nombre' } };
        const res = mockRes();

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Usuario no encontrado' });
    });

    test('200 actualiza sin cambiar contraseña', async () => {
        const usuarioExistente = {
            id: 1,
            update: jest.fn().mockResolvedValue(true),
        };
        Usuario.findByPk.mockResolvedValue(usuarioExistente);

        const req = { params: { id: 1 }, body: { nombre: 'Admin Actualizado', rol_id: 1 } };
        const res = mockRes();

        await update(req, res);

        expect(usuarioExistente.update).toHaveBeenCalledWith({ nombre: 'Admin Actualizado', rol_id: 1 });
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Usuario actualizado' });
    });

    test('200 actualiza y hashea la nueva contraseña si se envía', async () => {
        const usuarioExistente = {
            id: 1,
            update: jest.fn().mockResolvedValue(true),
        };
        Usuario.findByPk.mockResolvedValue(usuarioExistente);

        const req = { params: { id: 1 }, body: { nombre: 'Admin', password: 'nueva_clave' } };
        const res = mockRes();

        await update(req, res);

        // Debe llamar update con password_hash, no con password
        expect(usuarioExistente.update).toHaveBeenCalledWith(
            expect.objectContaining({ password_hash: expect.any(String) })
        );
        expect(usuarioExistente.update).toHaveBeenCalledWith(
            expect.not.objectContaining({ password: expect.anything() })
        );
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Usuario actualizado' });
    });

    test('500 cuando la BD falla al actualizar', async () => {
        Usuario.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 }, body: {} };
        const res = mockRes();

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  remove
// ─────────────────────────────────────────────
describe('UsuariosController › remove', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el usuario no existe', async () => {
        Usuario.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await remove(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Usuario no encontrado' });
    });

    test('200 desactiva el usuario (soft delete)', async () => {
        const usuarioExistente = {
            id: 1,
            activo: 1,
            update: jest.fn().mockResolvedValue(true),
        };
        Usuario.findByPk.mockResolvedValue(usuarioExistente);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await remove(req, res);

        expect(usuarioExistente.update).toHaveBeenCalledWith({ activo: 0 });
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Usuario desactivado' });
    });

    test('500 cuando la BD falla al eliminar', async () => {
        Usuario.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await remove(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
