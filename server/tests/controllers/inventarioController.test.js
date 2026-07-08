jest.mock('../../src/models', () => ({
    Producto:             { findAll: jest.fn(), findByPk: jest.fn() },
    InventarioMovimiento: { findAll: jest.fn(), create: jest.fn() },
    Categoria:            {},
    Usuario:              {},
}));

const { getStock, ajustarStock, getMovimientos } = require('../../src/controllers/inventarioController');
const { Producto, InventarioMovimiento } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  getStock
// ─────────────────────────────────────────────
describe('InventarioController › getStock', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna todos los productos activos sin filtros', async () => {
        const lista = [
            { id: 1, nombre: 'Martillo',        stock: 10, stock_minimo: 5 },
            { id: 2, nombre: 'Destornillador',  stock: 3,  stock_minimo: 2 },
        ];
        Producto.findAll.mockResolvedValue(lista);

        const req = { query: {} };
        const res = mockRes();

        await getStock(req, res);

        expect(Producto.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, productos: lista });
    });

    test('200 filtra por search — agrega Op.like en where.nombre', async () => {
        Producto.findAll.mockResolvedValue([]);

        const req = { query: { search: 'Martillo' } };
        const res = mockRes();

        await getStock(req, res);

        const where = Producto.findAll.mock.calls[0][0].where;
        expect(where).toHaveProperty('nombre');
        expect(res.json).toHaveBeenCalledWith({ ok: true, productos: [] });
    });

    test('200 filtra por categoria_id — agrega campo en where', async () => {
        Producto.findAll.mockResolvedValue([]);

        const req = { query: { categoria_id: '3' } };
        const res = mockRes();

        await getStock(req, res);

        const where = Producto.findAll.mock.calls[0][0].where;
        expect(where).toHaveProperty('categoria_id', '3');
    });

    test('200 stock_bajo=true devuelve solo productos con stock <= stock_minimo', async () => {
        const lista = [
            { id: 1, nombre: 'Martillo', stock: 10, stock_minimo: 5 },
            { id: 2, nombre: 'Sierra',   stock: 2,  stock_minimo: 5 },
        ];
        Producto.findAll.mockResolvedValue(lista);

        const req = { query: { stock_bajo: 'true' } };
        const res = mockRes();

        await getStock(req, res);

        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            productos: [{ id: 2, nombre: 'Sierra', stock: 2, stock_minimo: 5 }],
        });
    });

    test('200 stock_bajo distinto de "true" devuelve lista completa sin filtrar', async () => {
        const lista = [
            { id: 1, nombre: 'Martillo', stock: 10, stock_minimo: 5 },
            { id: 2, nombre: 'Sierra',   stock: 2,  stock_minimo: 5 },
        ];
        Producto.findAll.mockResolvedValue(lista);

        const req = { query: { stock_bajo: 'false' } };
        const res = mockRes();

        await getStock(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, productos: lista });
    });

    test('500 cuando la BD falla', async () => {
        Producto.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await getStock(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false })
        );
    });
});

// ─────────────────────────────────────────────
//  ajustarStock
// ─────────────────────────────────────────────
describe('InventarioController › ajustarStock', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando el producto no existe', async () => {
        Producto.findByPk.mockResolvedValue(null);

        const req = { body: { producto_id: 99, cantidad: 20, motivo: 'Conteo' }, user: { id: 1 } };
        const res = mockRes();

        await ajustarStock(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Producto no encontrado' });
    });

    test('200 ajusta el stock al nuevo valor y registra movimiento con la diferencia', async () => {
        const mockProducto = { id: 1, nombre: 'Martillo', stock: 10, update: jest.fn().mockResolvedValue(true) };
        Producto.findByPk.mockResolvedValue(mockProducto);
        InventarioMovimiento.create.mockResolvedValue(true);

        const req = { body: { producto_id: 1, cantidad: 25, motivo: 'Conteo físico' }, user: { id: 1 } };
        const res = mockRes();

        await ajustarStock(req, res);

        expect(mockProducto.update).toHaveBeenCalledWith({ stock: 25 });
        expect(InventarioMovimiento.create).toHaveBeenCalledWith(
            expect.objectContaining({
                tipo: 'Ajuste',
                cantidad: 15,        // 25 - 10
                stock_antes: 10,
                stock_despues: 25,
                motivo: 'Conteo físico',
            })
        );
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true, msg: 'Stock ajustado' })
        );
    });

    test('200 registra cantidad negativa cuando el nuevo stock es menor al anterior', async () => {
        const mockProducto = { id: 2, nombre: 'Sierra', stock: 30, update: jest.fn().mockResolvedValue(true) };
        Producto.findByPk.mockResolvedValue(mockProducto);
        InventarioMovimiento.create.mockResolvedValue(true);

        const req = { body: { producto_id: 2, cantidad: 10, motivo: 'Merma' }, user: { id: 1 } };
        const res = mockRes();

        await ajustarStock(req, res);

        expect(InventarioMovimiento.create).toHaveBeenCalledWith(
            expect.objectContaining({ cantidad: -20, stock_antes: 30, stock_despues: 10 })
        );
    });

    test('200 usa "Ajuste manual" como motivo por defecto si no se envía motivo', async () => {
        const mockProducto = { id: 1, stock: 5, update: jest.fn().mockResolvedValue(true) };
        Producto.findByPk.mockResolvedValue(mockProducto);
        InventarioMovimiento.create.mockResolvedValue(true);

        const req = { body: { producto_id: 1, cantidad: 10 }, user: { id: 1 } };
        const res = mockRes();

        await ajustarStock(req, res);

        expect(InventarioMovimiento.create).toHaveBeenCalledWith(
            expect.objectContaining({ motivo: 'Ajuste manual' })
        );
    });

    test('500 cuando la BD falla al buscar el producto', async () => {
        Producto.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { body: { producto_id: 1, cantidad: 5 }, user: { id: 1 } };
        const res = mockRes();

        await ajustarStock(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al ajustar stock' })
        );
    });
});

// ─────────────────────────────────────────────
//  getMovimientos
// ─────────────────────────────────────────────
describe('InventarioController › getMovimientos', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna todos los movimientos sin filtro', async () => {
        const movimientos = [
            { id: 1, tipo: 'Venta',  cantidad: -2, producto_id: 1 },
            { id: 2, tipo: 'Compra', cantidad: 10, producto_id: 1 },
        ];
        InventarioMovimiento.findAll.mockResolvedValue(movimientos);

        const req = { query: {} };
        const res = mockRes();

        await getMovimientos(req, res);

        expect(InventarioMovimiento.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, movimientos });
    });

    test('200 filtra por producto_id cuando se incluye en query', async () => {
        InventarioMovimiento.findAll.mockResolvedValue([]);

        const req = { query: { producto_id: '1' } };
        const res = mockRes();

        await getMovimientos(req, res);

        const where = InventarioMovimiento.findAll.mock.calls[0][0].where;
        expect(where).toHaveProperty('producto_id', '1');
    });

    test('200 no aplica filtro de producto cuando query está vacío', async () => {
        InventarioMovimiento.findAll.mockResolvedValue([]);

        const req = { query: {} };
        const res = mockRes();

        await getMovimientos(req, res);

        const where = InventarioMovimiento.findAll.mock.calls[0][0].where;
        expect(where).not.toHaveProperty('producto_id');
    });

    test('500 cuando la BD falla', async () => {
        InventarioMovimiento.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await getMovimientos(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false })
        );
    });
});
