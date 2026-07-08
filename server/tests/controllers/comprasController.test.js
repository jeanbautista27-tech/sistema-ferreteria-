// Mock de sequelize (transacciones) antes de requerir el controller
const mockTransaction = {
    commit:   jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true),
};

jest.mock('../../src/config/db', () => ({
    transaction: jest.fn().mockResolvedValue(mockTransaction),
}));

jest.mock('../../src/models', () => ({
    Compra:               { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
    DetalleCompra:        { create: jest.fn() },
    Producto:             { findByPk: jest.fn() },
    Proveedor:            {},
    Usuario:              {},
    InventarioMovimiento: { create: jest.fn() },
    CuentaPagar:          { create: jest.fn() },
    Caja:                 { findOne: jest.fn() },
    CajaEgreso:           { create: jest.fn() },
}));

const { getAll, getOne, create, recibirCompra } = require('../../src/controllers/comprasController');
const { Compra, DetalleCompra, Producto, CuentaPagar, Caja, CajaEgreso, InventarioMovimiento } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  getAll
// ─────────────────────────────────────────────
describe('ComprasController › getAll', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de compras', async () => {
        const lista = [{ id: 1, numero_orden: 'OC-001', estado: 'Pendiente' }];
        Compra.findAll.mockResolvedValue(lista);

        const req = { query: {} };
        const res = mockRes();

        await getAll(req, res);

        expect(Compra.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, compras: lista });
    });

    test('200 filtra por estado', async () => {
        Compra.findAll.mockResolvedValue([]);

        const req = { query: { estado: 'Recibida' } };
        const res = mockRes();

        await getAll(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, compras: [] });
    });

    test('200 filtra por rango de fechas', async () => {
        Compra.findAll.mockResolvedValue([]);

        const req = { query: { desde: '2026-01-01', hasta: '2026-06-30' } };
        const res = mockRes();

        await getAll(req, res);

        expect(Compra.findAll).toHaveBeenCalledTimes(1);
    });

    test('500 cuando la BD falla', async () => {
        Compra.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al obtener compras' })
        );
    });
});

// ─────────────────────────────────────────────
//  getOne
// ─────────────────────────────────────────────
describe('ComprasController › getOne', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando la compra no existe', async () => {
        Compra.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Compra no encontrada' });
    });

    test('200 retorna la compra con sus detalles', async () => {
        const compra = { id: 1, numero_orden: 'OC-001', detalles: [] };
        Compra.findByPk.mockResolvedValue(compra);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, compra });
    });

    test('500 cuando la BD falla', async () => {
        Compra.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  create
// ─────────────────────────────────────────────
describe('ComprasController › create', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.commit.mockResolvedValue(true);
        mockTransaction.rollback.mockResolvedValue(true);
    });

    test('400 cuando no se envía proveedor_id', async () => {
        const req = {
            body: { items: [{ producto_id: 1, cantidad: 5, precio_unitario: 10 }] },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Proveedor es requerido' });
    });

    test('400 cuando no hay items', async () => {
        const req = {
            body: { proveedor_id: 1, items: [] },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'No hay productos' });
    });

    test('201 registra compra al crédito y crea cuenta por pagar', async () => {
        const mockCompra = { id: 5, numero_orden: 'OC-123', total: 590 };
        Compra.create.mockResolvedValue(mockCompra);
        CuentaPagar.create.mockResolvedValue(true);
        DetalleCompra.create.mockResolvedValue(true);

        const req = {
            body: {
                proveedor_id: 1,
                tipo_pago: 'Crédito',
                estado: 'Pendiente',
                items: [{ producto_id: 1, cantidad: 10, precio_unitario: 50 }],
            },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(CuentaPagar.create).toHaveBeenCalledTimes(1);
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true, msg: 'Compra registrada' })
        );
    });

    test('201 registra compra al contado con caja abierta', async () => {
        const mockCompra = { id: 6, numero_orden: 'OC-456', total: 118 };
        Compra.create.mockResolvedValue(mockCompra);
        Caja.findOne.mockResolvedValue({ id: 1, estado: 'Abierta' });
        CajaEgreso.create.mockResolvedValue(true);
        DetalleCompra.create.mockResolvedValue(true);

        const req = {
            body: {
                proveedor_id: 2,
                tipo_pago: 'Efectivo',
                estado: 'Pendiente',
                items: [{ producto_id: 2, cantidad: 2, precio_unitario: 50 }],
            },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(Caja.findOne).toHaveBeenCalledTimes(1);
        expect(CajaEgreso.create).toHaveBeenCalledTimes(1);
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('500 hace rollback cuando no hay caja abierta para compra al contado', async () => {
        Compra.create.mockResolvedValue({ id: 7, numero_orden: 'OC-789' });
        Caja.findOne.mockResolvedValue(null); // sin caja abierta

        const req = {
            body: {
                proveedor_id: 1,
                tipo_pago: 'Efectivo',
                estado: 'Pendiente',
                items: [{ producto_id: 1, cantidad: 1, precio_unitario: 100 }],
            },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  recibirCompra
// ─────────────────────────────────────────────
describe('ComprasController › recibirCompra', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.commit.mockResolvedValue(true);
        mockTransaction.rollback.mockResolvedValue(true);
    });

    test('404 cuando la compra no existe', async () => {
        Compra.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 }, user: { id: 1 } };
        const res = mockRes();

        await recibirCompra(req, res);

        // El controlador hace return directo sin rollback porque no se escribió nada en la BD
        expect(mockTransaction.rollback).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Compra no encontrada' });
    });

    test('400 cuando la compra ya fue recibida', async () => {
        Compra.findByPk.mockResolvedValue({ id: 1, estado: 'Recibida', detalles: [] });

        const req = { params: { id: 1 }, user: { id: 1 } };
        const res = mockRes();

        await recibirCompra(req, res);

        // El controlador hace return directo sin rollback porque no se escribió nada en la BD
        expect(mockTransaction.rollback).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'La compra ya fue recibida' });
    });

    test('200 recibe la compra y actualiza el stock de cada producto', async () => {
        const mockProducto = {
            id: 1, stock: 5,
            update: jest.fn().mockResolvedValue(true),
        };
        const mockCompra = {
            id: 1,
            estado: 'Pendiente',
            numero_orden: 'OC-001',
            detalles: [{ producto_id: 1, cantidad: 10 }],
            update: jest.fn().mockResolvedValue(true),
        };
        Compra.findByPk.mockResolvedValue(mockCompra);
        Producto.findByPk.mockResolvedValue(mockProducto);
        InventarioMovimiento.create.mockResolvedValue(true);

        const req = { params: { id: 1 }, user: { id: 1 } };
        const res = mockRes();

        await recibirCompra(req, res);

        // Stock debe aumentar de 5 a 15
        expect(mockProducto.update).toHaveBeenCalledWith({ stock: 15 }, expect.anything());
        expect(mockCompra.update).toHaveBeenCalledWith({ estado: 'Recibida' }, expect.anything());
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Compra recibida y stock actualizado' });
    });

    test('500 hace rollback cuando la BD falla', async () => {
        Compra.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 }, user: { id: 1 } };
        const res = mockRes();

        await recibirCompra(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
