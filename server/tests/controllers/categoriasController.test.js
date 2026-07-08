jest.mock('../../src/models', () => ({
    Categoria: {
        findAll:  jest.fn(),
        findByPk: jest.fn(),
        create:   jest.fn(),
    },
}));

const { getAll, create, update, remove } = require('../../src/controllers/categoriasController');
const { Categoria } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  getAll
// ─────────────────────────────────────────────
describe('CategoriasController › getAll', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de categorías ordenadas', async () => {
        const lista = [
            { id: 1, nombre: 'Herramientas' },
            { id: 2, nombre: 'Pinturas' },
        ];
        Categoria.findAll.mockResolvedValue(lista);

        const req = {};
        const res = mockRes();

        await getAll(req, res);

        expect(Categoria.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, categorias: lista });
    });

    test('500 cuando la BD falla', async () => {
        Categoria.findAll.mockRejectedValue(new Error('DB error'));

        const req = {};
        const res = mockRes();

        await getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al obtener categorías' })
        );
    });
});

// ─────────────────────────────────────────────
//  create
// ─────────────────────────────────────────────
describe('CategoriasController › create', () => {

    beforeEach(() => jest.clearAllMocks());

    test('400 cuando no se envía el nombre', async () => {
        const req = { body: { descripcion: 'Sin nombre' } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Nombre es requerido' });
    });

    test('201 cuando se crea la categoría correctamente', async () => {
        const nueva = { id: 3, nombre: 'Electricidad', descripcion: 'Material eléctrico' };
        Categoria.create.mockResolvedValue(nueva);

        const req = { body: { nombre: 'Electricidad', descripcion: 'Material eléctrico' } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            msg: 'Categoría creada',
            categoria: nueva,
        });
    });

    test('500 cuando la BD falla al crear', async () => {
        Categoria.create.mockRejectedValue(new Error('DB error'));

        const req = { body: { nombre: 'Test' } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  update
// ─────────────────────────────────────────────
describe('CategoriasController › update', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando la categoría no existe', async () => {
        Categoria.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 }, body: { nombre: 'Nuevo' } };
        const res = mockRes();

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Categoría no encontrada' });
    });

    test('200 cuando la categoría se actualiza correctamente', async () => {
        const categoriaExistente = {
            id: 1,
            nombre: 'Herramientas',
            update: jest.fn().mockResolvedValue(true),
        };
        Categoria.findByPk.mockResolvedValue(categoriaExistente);

        const req = { params: { id: 1 }, body: { nombre: 'Herramientas Manuales' } };
        const res = mockRes();

        await update(req, res);

        expect(categoriaExistente.update).toHaveBeenCalledWith({ nombre: 'Herramientas Manuales' });
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true, msg: 'Categoría actualizada' })
        );
    });

    test('500 cuando la BD falla al actualizar', async () => {
        Categoria.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 }, body: {} };
        const res = mockRes();

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  remove
// ─────────────────────────────────────────────
describe('CategoriasController › remove', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando la categoría no existe', async () => {
        Categoria.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await remove(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Categoría no encontrada' });
    });

    test('200 desactiva la categoría (soft delete)', async () => {
        const categoriaExistente = {
            id: 1,
            update: jest.fn().mockResolvedValue(true),
        };
        Categoria.findByPk.mockResolvedValue(categoriaExistente);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await remove(req, res);

        expect(categoriaExistente.update).toHaveBeenCalledWith({ activo: 0 });
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Categoría eliminada' });
    });

    test('500 cuando la BD falla al eliminar', async () => {
        Categoria.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await remove(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
