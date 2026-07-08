jest.mock('../../src/models', () => ({
    Producto:   { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
    Categoria:  {},
    Proveedor:  {},
}));

// sequelize se usa solo en la rama stock_bajo; lo mockeamos para evitar conexión real
jest.mock('../../src/config/db', () => ({
    sequelize: {
        where: jest.fn(),
        col:   jest.fn(),
    },
}));

const { getAll, getOne, create, update, remove } = require('../../src/controllers/productosController');
const { Producto } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  getAll
// ─────────────────────────────────────────────
describe('ProductosController › getAll', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de productos activos', async () => {
        const lista = [
            { id: 1, nombre: 'Martillo', activo: 1 },
            { id: 2, nombre: 'Destornillador', activo: 1 },
        ];
        Producto.findAll.mockResolvedValue(lista);

        const req = { query: {} };
        const res = mockRes();

        await getAll(req, res);

        expect(Producto.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, productos: lista });
    });

    test('200 filtra por búsqueda de nombre', async () => {
        Producto.findAll.mockResolvedValue([]);

        const req = { query: { search: 'Martillo' } };
        const res = mockRes();

        await getAll(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, productos: [] });
    });

    test('200 filtra por categoria_id', async () => {
        Producto.findAll.mockResolvedValue([]);

        const req = { query: { categoria_id: '2' } };
        const res = mockRes();

        await getAll(req, res);

        expect(Producto.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, productos: [] });
    });

    test('500 cuando la BD falla', async () => {
        Producto.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al obtener productos' })
        );
    });
});

// ─────────────────────────────────────────────
//  getOne
// ─────────────────────────────────────────────
describe('ProductosController › getOne', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el producto no existe', async () => {
        Producto.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Producto no encontrado' });
    });

    test('200 retorna el producto encontrado', async () => {
        const producto = { id: 1, nombre: 'Martillo', precio_venta: 25.00 };
        Producto.findByPk.mockResolvedValue(producto);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, producto });
    });

    test('500 cuando la BD falla', async () => {
        Producto.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  create
// ─────────────────────────────────────────────
describe('ProductosController › create', () => {

    beforeEach(() => jest.clearAllMocks());

    test('400 cuando no se envía el nombre', async () => {
        const req = { body: { precio_venta: 10 }, file: null };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Nombre es requerido' });
    });

    test('400 cuando no se envía el precio de venta', async () => {
        const req = { body: { nombre: 'Martillo' }, file: null };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Precio de venta es requerido' });
    });

    test('201 crea el producto correctamente sin imagen', async () => {
        const nuevo = { id: 5, nombre: 'Martillo', precio_venta: 25 };
        Producto.create.mockResolvedValue(nuevo);

        const req = { body: { nombre: 'Martillo', precio_venta: 25 }, file: null };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            msg: 'Producto creado',
            producto: nuevo,
        });
    });

    test('201 crea el producto incluyendo nombre de imagen si se sube archivo', async () => {
        const nuevo = { id: 6, nombre: 'Sierra', precio_venta: 80, imagen: 'sierra.jpg' };
        Producto.create.mockResolvedValue(nuevo);

        const req = {
            body: { nombre: 'Sierra', precio_venta: 80 },
            file: { filename: 'sierra.jpg' },
        };
        const res = mockRes();

        await create(req, res);

        expect(Producto.create).toHaveBeenCalledWith(
            expect.objectContaining({ imagen: 'sierra.jpg' })
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('500 cuando la BD falla al crear', async () => {
        Producto.create.mockRejectedValue(new Error('DB error'));

        const req = { body: { nombre: 'Test', precio_venta: 10 }, file: null };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  update
// ─────────────────────────────────────────────
describe('ProductosController › update', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el producto no existe', async () => {
        Producto.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 }, body: { nombre: 'X' }, file: null };
        const res = mockRes();

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Producto no encontrado' });
    });

    test('200 actualiza el producto correctamente', async () => {
        const productoExistente = {
            id: 1,
            nombre: 'Martillo',
            update: jest.fn().mockResolvedValue(true),
        };
        Producto.findByPk.mockResolvedValue(productoExistente);

        const req = { params: { id: 1 }, body: { nombre: 'Martillo de Goma' }, file: null };
        const res = mockRes();

        await update(req, res);

        expect(productoExistente.update).toHaveBeenCalledWith({ nombre: 'Martillo de Goma' });
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true, msg: 'Producto actualizado' })
        );
    });

    test('500 cuando la BD falla al actualizar', async () => {
        Producto.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 }, body: {}, file: null };
        const res = mockRes();

        await update(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  remove
// ─────────────────────────────────────────────
describe('ProductosController › remove', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el producto no existe', async () => {
        Producto.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await remove(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Producto no encontrado' });
    });

    test('200 desactiva el producto (soft delete)', async () => {
        const productoExistente = {
            id: 1,
            activo: 1,
            update: jest.fn().mockResolvedValue(true),
        };
        Producto.findByPk.mockResolvedValue(productoExistente);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await remove(req, res);

        expect(productoExistente.update).toHaveBeenCalledWith({ activo: 0 });
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Producto eliminado' });
    });

    test('500 cuando la BD falla al eliminar', async () => {
        Producto.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await remove(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
