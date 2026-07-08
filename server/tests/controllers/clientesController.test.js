jest.mock('../../src/models', () => ({
    Cliente: {
        findAll:  jest.fn(),
        findByPk: jest.fn(),
        create:   jest.fn(),
    },
}));

const { getAll, create, update, remove } = require('../../src/controllers/clientesController');
const { Cliente } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  getAll
// ─────────────────────────────────────────────
describe('ClientesController › getAll', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de clientes activos', async () => {
        const lista = [
            { id: 1, nombre: 'Juan Pérez', activo: 1 },
            { id: 2, nombre: 'María García', activo: 1 },
        ];
        Cliente.findAll.mockResolvedValue(lista);

        const req = { query: {} };
        const res = mockRes();

        await getAll(req, res);

        expect(Cliente.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, clientes: lista });
    });

    test('200 acepta parámetro search en el query', async () => {
        Cliente.findAll.mockResolvedValue([]);

        const req = { query: { search: 'Juan' } };
        const res = mockRes();

        await getAll(req, res);

        expect(Cliente.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, clientes: [] });
    });

    test('500 cuando la BD falla', async () => {
        Cliente.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false })
        );
    });
});

// ─────────────────────────────────────────────
//  create
// ─────────────────────────────────────────────
describe('ClientesController › create', () => {

    beforeEach(() => jest.clearAllMocks());

    test('400 cuando no se envía el nombre', async () => {
        const req = { body: { telefono: '999999999' } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Nombre es requerido' });
    });

    test('201 cuando se crea el cliente correctamente', async () => {
        const nuevoCliente = { id: 3, nombre: 'Carlos López', telefono: '987654321' };
        Cliente.create.mockResolvedValue(nuevoCliente);

        const req = { body: { nombre: 'Carlos López', telefono: '987654321' } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            msg: 'Cliente creado',
            cliente: nuevoCliente,
        });
    });

    test('500 cuando la BD falla al crear', async () => {
        Cliente.create.mockRejectedValue(new Error('DB error'));

        const req = { body: { nombre: 'Test' } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  update
// ─────────────────────────────────────────────
describe('ClientesController › update', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el cliente no existe', async () => {
        Cliente.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 }, body: { nombre: 'Nuevo Nombre' } };
        const res = mockRes();

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Cliente no encontrado' });
    });

    test('200 cuando el cliente se actualiza correctamente', async () => {
        const clienteExistente = {
            id: 1,
            nombre: 'Juan Pérez',
            update: jest.fn().mockResolvedValue(true),
        };
        Cliente.findByPk.mockResolvedValue(clienteExistente);

        const req = { params: { id: 1 }, body: { nombre: 'Juan Actualizado' } };
        const res = mockRes();

        await update(req, res);

        expect(clienteExistente.update).toHaveBeenCalledWith({ nombre: 'Juan Actualizado' });
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true, msg: 'Cliente actualizado' })
        );
    });

    test('500 cuando la BD falla al actualizar', async () => {
        Cliente.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 }, body: {} };
        const res = mockRes();

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  remove
// ─────────────────────────────────────────────
describe('ClientesController › remove', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el cliente no existe', async () => {
        Cliente.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await remove(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Cliente no encontrado' });
    });

    test('200 desactiva el cliente (soft delete)', async () => {
        const clienteExistente = {
            id: 1,
            activo: 1,
            update: jest.fn().mockResolvedValue(true),
        };
        Cliente.findByPk.mockResolvedValue(clienteExistente);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await remove(req, res);

        expect(clienteExistente.update).toHaveBeenCalledWith({ activo: 0 });
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Cliente eliminado' });
    });

    test('500 cuando la BD falla al eliminar', async () => {
        Cliente.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await remove(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
