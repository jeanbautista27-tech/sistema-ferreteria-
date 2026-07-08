jest.mock('../../src/models', () => ({
    Proveedor: {
        findAll:  jest.fn(),
        findByPk: jest.fn(),
        create:   jest.fn(),
    },
}));

const { getAll, create, update, remove } = require('../../src/controllers/proveedoresController');
const { Proveedor } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  getAll
// ─────────────────────────────────────────────
describe('ProveedoresController › getAll', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de proveedores activos', async () => {
        const lista = [
            { id: 1, empresa: 'Distribuidora ABC', activo: 1 },
            { id: 2, empresa: 'Ferretería Central', activo: 1 },
        ];
        Proveedor.findAll.mockResolvedValue(lista);

        const req = {};
        const res = mockRes();

        await getAll(req, res);

        expect(Proveedor.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, proveedores: lista });
    });

    test('500 cuando la BD falla', async () => {
        Proveedor.findAll.mockRejectedValue(new Error('DB error'));

        const req = {};
        const res = mockRes();

        await getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al obtener proveedores' })
        );
    });
});

// ─────────────────────────────────────────────
//  create
// ─────────────────────────────────────────────
describe('ProveedoresController › create', () => {

    beforeEach(() => jest.clearAllMocks());

    test('400 cuando no se envía la razón social (empresa)', async () => {
        const req = { body: { contacto: 'Juan' } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Razón social es requerida' });
    });

    test('201 cuando se crea el proveedor correctamente', async () => {
        const nuevo = { id: 3, empresa: 'Importaciones XYZ', ruc: '20123456789' };
        Proveedor.create.mockResolvedValue(nuevo);

        const req = { body: { empresa: 'Importaciones XYZ', ruc: '20123456789' } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            msg: 'Proveedor creado',
            proveedor: nuevo,
        });
    });

    test('500 cuando la BD falla al crear', async () => {
        Proveedor.create.mockRejectedValue(new Error('DB error'));

        const req = { body: { empresa: 'Test' } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  update
// ─────────────────────────────────────────────
describe('ProveedoresController › update', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el proveedor no existe', async () => {
        Proveedor.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 }, body: { empresa: 'Nueva Empresa' } };
        const res = mockRes();

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Proveedor no encontrado' });
    });

    test('200 cuando el proveedor se actualiza correctamente', async () => {
        const proveedorExistente = {
            id: 1,
            empresa: 'Distribuidora ABC',
            update: jest.fn().mockResolvedValue(true),
        };
        Proveedor.findByPk.mockResolvedValue(proveedorExistente);

        const req = { params: { id: 1 }, body: { empresa: 'Distribuidora ABC S.A.C.' } };
        const res = mockRes();

        await update(req, res);

        expect(proveedorExistente.update).toHaveBeenCalledWith({ empresa: 'Distribuidora ABC S.A.C.' });
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true, msg: 'Proveedor actualizado' })
        );
    });

    test('500 cuando la BD falla al actualizar', async () => {
        Proveedor.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 }, body: {} };
        const res = mockRes();

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  remove
// ─────────────────────────────────────────────
describe('ProveedoresController › remove', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el proveedor no existe', async () => {
        Proveedor.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await remove(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Proveedor no encontrado' });
    });

    test('200 desactiva el proveedor (soft delete)', async () => {
        const proveedorExistente = {
            id: 1,
            activo: 1,
            update: jest.fn().mockResolvedValue(true),
        };
        Proveedor.findByPk.mockResolvedValue(proveedorExistente);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await remove(req, res);

        expect(proveedorExistente.update).toHaveBeenCalledWith({ activo: 0 });
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Proveedor eliminado' });
    });

    test('500 cuando la BD falla al eliminar', async () => {
        Proveedor.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await remove(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
