const mockTransaction = {
    commit:   jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true),
};

jest.mock('../../src/config/db', () => ({
    transaction: jest.fn().mockResolvedValue(mockTransaction),
}));

jest.mock('../../src/models', () => ({
    Devolucion:           { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn(), count: jest.fn() },
    DetalleDevolucion:    { create: jest.fn() },
    Venta:                { findByPk: jest.fn() },
    DetalleVenta:         {},
    Producto:             { findByPk: jest.fn() },
    Usuario:              {},
    Cliente:              {},
    InventarioMovimiento: { create: jest.fn() },
    Caja:                 { findOne: jest.fn() },
    CajaEgreso:           { create: jest.fn() },
}));

const { getAll, getOne, create } = require('../../src/controllers/devolucionesController');
const { Devolucion, DetalleDevolucion, Venta, Producto, Caja, CajaEgreso, InventarioMovimiento } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  getAll
// ─────────────────────────────────────────────
describe('DevolucionesController › getAll', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de devoluciones', async () => {
        const lista = [{ id: 1, numero_comprobante: 'NC001-000001', total_reembolso: 50 }];
        Devolucion.findAll.mockResolvedValue(lista);

        const req = {};
        const res = mockRes();

        await getAll(req, res);

        expect(Devolucion.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, devoluciones: lista });
    });

    test('500 cuando la BD falla', async () => {
        Devolucion.findAll.mockRejectedValue(new Error('DB error'));

        const req = {};
        const res = mockRes();

        await getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al listar devoluciones' })
        );
    });
});

// ─────────────────────────────────────────────
//  getOne
// ─────────────────────────────────────────────
describe('DevolucionesController › getOne', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando la devolución no existe', async () => {
        Devolucion.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Devolución no encontrada' });
    });

    test('200 retorna la devolución con sus detalles', async () => {
        const devolucion = { id: 1, numero_comprobante: 'NC001-000001', detalles: [] };
        Devolucion.findByPk.mockResolvedValue(devolucion);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, devolucion });
    });

    test('500 cuando la BD falla', async () => {
        Devolucion.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  create
// ─────────────────────────────────────────────
describe('DevolucionesController › create', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.commit.mockResolvedValue(true);
        mockTransaction.rollback.mockResolvedValue(true);
    });

    test('400 cuando no se envían items', async () => {
        const req = { body: { items: [] }, user: { id: 1 } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'No se enviaron productos para devolver' });
    });

    test('404 cuando la venta no existe — return sin rollback', async () => {
        Venta.findByPk.mockResolvedValue(null);

        const req = {
            body: { venta_id: 99, items: [{ producto_id: 1, cantidad: 1 }] },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(mockTransaction.rollback).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Venta no encontrada' });
    });

    test('400 cuando la venta no está Completada — return sin rollback', async () => {
        Venta.findByPk.mockResolvedValue({ id: 1, estado: 'Anulada', detalles: [] });

        const req = {
            body: { venta_id: 1, items: [{ producto_id: 1, cantidad: 1 }] },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(mockTransaction.rollback).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Solo se pueden devolver ventas completadas' });
    });

    test('500 hace rollback cuando la cantidad excede lo vendido', async () => {
        const mockVenta = {
            id: 1,
            estado: 'Completada',
            numero_comprobante: 'B001-00000001',
            detalles: [{ producto_id: 1, cantidad: 2, precio_unitario: '50.00' }],
        };
        Venta.findByPk.mockResolvedValue(mockVenta);

        const req = {
            body: {
                venta_id: 1,
                motivo: 'Defecto',
                tipo_reembolso: 'Efectivo',
                items: [{ producto_id: 1, cantidad: 5 }], // excede lo vendido (2)
            },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('201 registra devolución sin reembolso en efectivo', async () => {
        const mockVenta = {
            id: 1,
            estado: 'Completada',
            numero_comprobante: 'B001-00000001',
            detalles: [{ producto_id: 1, cantidad: 3, precio_unitario: '50.00' }],
        };
        const mockProducto = { id: 1, stock: 10, update: jest.fn().mockResolvedValue(true) };
        const mockDevolucion = { id: 1, numero_comprobante: 'NC001-000001' };

        Venta.findByPk.mockResolvedValue(mockVenta);
        Devolucion.count.mockResolvedValue(0);
        Devolucion.create.mockResolvedValue(mockDevolucion);
        DetalleDevolucion.create.mockResolvedValue(true);
        Producto.findByPk.mockResolvedValue(mockProducto);
        InventarioMovimiento.create.mockResolvedValue(true);

        const req = {
            body: {
                venta_id: 1,
                motivo: 'Defecto de fábrica',
                tipo_reembolso: 'NotaCrédito',
                items: [{ producto_id: 1, cantidad: 1 }],
            },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(mockProducto.update).toHaveBeenCalledWith({ stock: 11 }, expect.anything());
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true, msg: 'Devolución registrada correctamente' })
        );
    });

    test('201 registra devolución en efectivo y descuenta la caja', async () => {
        const mockVenta = {
            id: 2,
            estado: 'Completada',
            numero_comprobante: 'B001-00000002',
            detalles: [{ producto_id: 2, cantidad: 2, precio_unitario: '100.00' }],
        };
        const mockProducto = { id: 2, stock: 5, update: jest.fn().mockResolvedValue(true) };
        const mockDevolucion = { id: 2, numero_comprobante: 'NC001-000002' };
        const mockCaja = {
            id: 1,
            total_egresos: '0',
            update: jest.fn().mockResolvedValue(true),
        };

        Venta.findByPk.mockResolvedValue(mockVenta);
        Devolucion.count.mockResolvedValue(1);
        Devolucion.create.mockResolvedValue(mockDevolucion);
        DetalleDevolucion.create.mockResolvedValue(true);
        Producto.findByPk.mockResolvedValue(mockProducto);
        InventarioMovimiento.create.mockResolvedValue(true);
        Caja.findOne.mockResolvedValue(mockCaja);
        CajaEgreso.create.mockResolvedValue(true);

        const req = {
            body: {
                venta_id: 2,
                motivo: 'Cliente insatisfecho',
                tipo_reembolso: 'Efectivo',
                items: [{ producto_id: 2, cantidad: 1 }],
            },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(CajaEgreso.create).toHaveBeenCalledTimes(1);
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('500 hace rollback cuando reembolso en efectivo sin caja abierta', async () => {
        const mockVenta = {
            id: 3,
            estado: 'Completada',
            numero_comprobante: 'B001-00000003',
            detalles: [{ producto_id: 1, cantidad: 2, precio_unitario: '50.00' }],
        };
        const mockProducto = { id: 1, stock: 5, update: jest.fn().mockResolvedValue(true) };

        Venta.findByPk.mockResolvedValue(mockVenta);
        Devolucion.count.mockResolvedValue(0);
        Devolucion.create.mockResolvedValue({ id: 3, numero_comprobante: 'NC001-000001' });
        DetalleDevolucion.create.mockResolvedValue(true);
        Producto.findByPk.mockResolvedValue(mockProducto);
        InventarioMovimiento.create.mockResolvedValue(true);
        Caja.findOne.mockResolvedValue(null); // sin caja abierta

        const req = {
            body: {
                venta_id: 3,
                motivo: 'Producto roto',
                tipo_reembolso: 'Efectivo',
                items: [{ producto_id: 1, cantidad: 1 }],
            },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
