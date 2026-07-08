// Mock de sequelize (transacciones) antes de requerir el controller
const mockTransaction = {
    commit:   jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true),
};

jest.mock('../../src/config/db', () => ({
    transaction: jest.fn().mockResolvedValue(mockTransaction),
}));

jest.mock('../../src/models', () => ({
    Venta:                { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn() },
    DetalleVenta:         { create: jest.fn() },
    Producto:             { findByPk: jest.fn() },
    Cliente:              {},
    Usuario:              {},
    InventarioMovimiento: { create: jest.fn() },
    Configuracion:        { findOne: jest.fn(), update: jest.fn() },
    CuentaCobrar:         { create: jest.fn() },
}));

const { getAll, getOne, create, anular } = require('../../src/controllers/ventasController');
const { Venta, DetalleVenta, Producto, Configuracion, CuentaCobrar, InventarioMovimiento } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  getAll
// ─────────────────────────────────────────────
describe('VentasController › getAll', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna lista de ventas', async () => {
        const lista = [{ id: 1, total: 100, estado: 'Completada' }];
        Venta.findAll.mockResolvedValue(lista);

        const req = { query: {} };
        const res = mockRes();

        await getAll(req, res);

        expect(Venta.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, ventas: lista });
    });

    test('200 filtra por estado', async () => {
        Venta.findAll.mockResolvedValue([]);

        const req = { query: { estado: 'Anulada' } };
        const res = mockRes();

        await getAll(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, ventas: [] });
    });

    test('200 filtra por rango de fechas', async () => {
        Venta.findAll.mockResolvedValue([]);

        const req = { query: { desde: '2026-01-01', hasta: '2026-06-30' } };
        const res = mockRes();

        await getAll(req, res);

        expect(Venta.findAll).toHaveBeenCalledTimes(1);
    });

    test('500 cuando la BD falla', async () => {
        Venta.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  getOne
// ─────────────────────────────────────────────
describe('VentasController › getOne', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando la venta no existe', async () => {
        Venta.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Venta no encontrada' });
    });

    test('200 retorna la venta con sus detalles', async () => {
        const venta = { id: 1, total: 150, detalles: [] };
        Venta.findByPk.mockResolvedValue(venta);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, venta });
    });

    test('500 cuando la BD falla', async () => {
        Venta.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  create
// ─────────────────────────────────────────────
describe('VentasController › create', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.commit.mockResolvedValue(true);
        mockTransaction.rollback.mockResolvedValue(true);
    });

    test('400 cuando no hay items en la venta', async () => {
        const req = { body: { items: [] }, user: { id: 1 } };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'No hay productos en la venta' });
    });

    test('400 cuando la venta al crédito no tiene cliente', async () => {
        const req = {
            body: {
                tipo_pago: 'Crédito',
                cliente_id: '',
                items: [{ producto_id: 1, cantidad: 1, precio_unitario: 10 }],
            },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
            ok: false,
            msg: 'La venta al crédito requiere obligatoriamente un cliente registrado.',
        });
    });

    test('500 hace rollback cuando un producto no tiene stock suficiente', async () => {
        Configuracion.findOne.mockResolvedValue({ valor: '1' });
        Producto.findByPk.mockResolvedValue({
            id: 1, nombre: 'Martillo', stock: 0, // stock insuficiente
        });

        const req = {
            body: {
                tipo_pago: 'Efectivo',
                items: [{ producto_id: 1, cantidad: 5, precio_unitario: 10 }],
            },
            user: { id: 1 },
            ip: '127.0.0.1',
        };
        const res = mockRes();

        await create(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('201 registra venta al contado correctamente', async () => {
        // Configuraciones del sistema
        Configuracion.findOne
            .mockResolvedValueOnce({ valor: 'B001' })  // serie_boleta
            .mockResolvedValueOnce({ valor: '1' })      // numero_correlativo
            .mockResolvedValueOnce({ valor: '18' });    // igv_porcentaje

        const mockProducto = {
            id: 1, nombre: 'Martillo', stock: 10,
            update: jest.fn().mockResolvedValue(true),
        };
        Producto.findByPk.mockResolvedValue(mockProducto);

        const mockVenta = { id: 10, numero_comprobante: 'B001-00000001', total: 100 };
        Venta.create.mockResolvedValue(mockVenta);
        DetalleVenta.create.mockResolvedValue(true);
        InventarioMovimiento.create.mockResolvedValue(true);
        Configuracion.update.mockResolvedValue(true);
        // findByPk para la venta completa al final
        Venta.findByPk.mockResolvedValue({ ...mockVenta, detalles: [], cliente: null });

        const req = {
            body: {
                tipo_pago: 'Efectivo',
                tipo_comprobante: 'Boleta',
                monto_recibido: 120,
                descuento: 0,
                items: [{ producto_id: 1, cantidad: 2, precio_unitario: 50, descuento: 0 }],
            },
            user: { id: 1 },
            ip: '127.0.0.1',
        };
        const res = mockRes();

        await create(req, res);

        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true, msg: 'Venta registrada exitosamente' })
        );
    });

    test('201 registra venta al crédito y crea cuenta por cobrar', async () => {
        Configuracion.findOne
            .mockResolvedValueOnce({ valor: 'B001' })
            .mockResolvedValueOnce({ valor: '5' })
            .mockResolvedValueOnce({ valor: '18' });

        const mockProducto = {
            id: 2, nombre: 'Sierra', stock: 5,
            update: jest.fn().mockResolvedValue(true),
        };
        Producto.findByPk.mockResolvedValue(mockProducto);

        const mockVenta = { id: 11, numero_comprobante: 'B001-00000005', total: 200 };
        Venta.create.mockResolvedValue(mockVenta);
        DetalleVenta.create.mockResolvedValue(true);
        InventarioMovimiento.create.mockResolvedValue(true);
        CuentaCobrar.create.mockResolvedValue(true);
        Configuracion.update.mockResolvedValue(true);
        Venta.findByPk.mockResolvedValue({ ...mockVenta, detalles: [], cliente: null });

        const req = {
            body: {
                tipo_pago: 'Crédito',
                cliente_id: '3',
                tipo_comprobante: 'Boleta',
                descuento: 0,
                items: [{ producto_id: 2, cantidad: 1, precio_unitario: 200, descuento: 0 }],
            },
            user: { id: 1 },
            ip: '127.0.0.1',
        };
        const res = mockRes();

        await create(req, res);

        expect(CuentaCobrar.create).toHaveBeenCalledTimes(1);
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

// ─────────────────────────────────────────────
//  anular
// ─────────────────────────────────────────────
describe('VentasController › anular', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.commit.mockResolvedValue(true);
        mockTransaction.rollback.mockResolvedValue(true);
    });

    test('404 cuando la venta no existe', async () => {
        Venta.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await anular(req, res);

        // El controlador hace return directo sin rollback porque no se escribió nada en la BD
        expect(mockTransaction.rollback).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Venta no encontrada' });
    });

    test('400 cuando la venta ya está anulada', async () => {
        Venta.findByPk.mockResolvedValue({ id: 1, estado: 'Anulada', detalles: [] });

        const req = { params: { id: 1 } };
        const res = mockRes();

        await anular(req, res);

        // El controlador hace return directo sin rollback porque no se escribió nada en la BD
        expect(mockTransaction.rollback).not.toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'La venta ya está anulada' });
    });

    test('200 anula la venta y revierte el stock', async () => {
        const mockProducto = {
            id: 1, stock: 8,
            update: jest.fn().mockResolvedValue(true),
        };
        const mockVenta = {
            id: 1,
            estado: 'Completada',
            detalles: [{ producto_id: 1, cantidad: 2 }],
            update: jest.fn().mockResolvedValue(true),
        };
        Venta.findByPk.mockResolvedValue(mockVenta);
        Producto.findByPk.mockResolvedValue(mockProducto);

        const req = { params: { id: 1 }, user: { id: 1 } };
        const res = mockRes();

        await anular(req, res);

        // Stock debe aumentar en la cantidad vendida (8 + 2 = 10)
        expect(mockProducto.update).toHaveBeenCalledWith({ stock: 10 }, expect.anything());
        expect(mockVenta.update).toHaveBeenCalledWith({ estado: 'Anulada' }, expect.anything());
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Venta anulada y stock revertido' });
    });

    test('500 hace rollback cuando la BD falla', async () => {
        Venta.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await anular(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
    });
});
