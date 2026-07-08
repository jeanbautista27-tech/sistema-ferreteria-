const mockTransaction = {
    commit:   jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true),
};

jest.mock('../../src/config/db', () => ({
    transaction: jest.fn().mockResolvedValue(mockTransaction),
}));

jest.mock('../../src/models', () => ({
    Cotizacion:        { findAll: jest.fn(), findByPk: jest.fn(), create: jest.fn(), count: jest.fn() },
    DetalleCotizacion: { create: jest.fn() },
    Producto:          { findByPk: jest.fn() },
    Cliente:           {},
    Usuario:           {},
    Configuracion:     { findOne: jest.fn() },
}));

const { getAll, getOne, create, anular } = require('../../src/controllers/cotizacionesController');
const { Cotizacion, DetalleCotizacion, Producto, Configuracion } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  getAll
// ─────────────────────────────────────────────
describe('CotizacionesController › getAll', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna todas las cotizaciones sin filtro', async () => {
        const lista = [{ id: 1, numero_comprobante: 'PROF-000001', estado: 'Pendiente' }];
        Cotizacion.findAll.mockResolvedValue(lista);

        const req = { query: {} };
        const res = mockRes();

        await getAll(req, res);

        expect(Cotizacion.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, cotizaciones: lista });
    });

    test('200 filtra por estado cuando se envía en query', async () => {
        Cotizacion.findAll.mockResolvedValue([]);

        const req = { query: { estado: 'Anulada' } };
        const res = mockRes();

        await getAll(req, res);

        const where = Cotizacion.findAll.mock.calls[0][0].where;
        expect(where).toHaveProperty('estado', 'Anulada');
    });

    test('500 cuando la BD falla', async () => {
        Cotizacion.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await getAll(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al obtener cotizaciones' })
        );
    });
});

// ─────────────────────────────────────────────
//  getOne
// ─────────────────────────────────────────────
describe('CotizacionesController › getOne', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando la cotización no existe', async () => {
        Cotizacion.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Cotización no encontrada' });
    });

    test('200 retorna la cotización con sus detalles', async () => {
        const cotizacion = { id: 1, numero_comprobante: 'PROF-000001', detalles: [] };
        Cotizacion.findByPk.mockResolvedValue(cotizacion);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, cotizacion });
    });

    test('500 cuando la BD falla', async () => {
        Cotizacion.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await getOne(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  create
// ─────────────────────────────────────────────
describe('CotizacionesController › create', () => {

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
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'No hay productos en la cotización' });
    });

    test('500 hace rollback cuando un producto no existe', async () => {
        Configuracion.findOne.mockResolvedValue({ valor: '18' });
        Producto.findByPk.mockResolvedValue(null);

        const req = {
            body: { items: [{ producto_id: 99, cantidad: 1, precio_unitario: 50 }] },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(500);
    });

    test('201 crea cotización correctamente con correlativo autogenerado', async () => {
        Configuracion.findOne.mockResolvedValue({ valor: '18' });
        Producto.findByPk.mockResolvedValue({ id: 1, nombre: 'Martillo' });
        Cotizacion.count.mockResolvedValue(5);
        const mockCotizacion = { id: 6, numero_comprobante: 'PROF-000006', total: 118 };
        Cotizacion.create.mockResolvedValue(mockCotizacion);
        DetalleCotizacion.create.mockResolvedValue(true);

        const req = {
            body: {
                cliente_id: 1,
                descuento: 0,
                validez_dias: 15,
                items: [{ producto_id: 1, cantidad: 2, precio_unitario: 50, descuento: 0 }],
                observaciones: 'Sin observaciones',
            },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        // El correlativo debe ser PROF-000006 (count=5, +1=6)
        expect(Cotizacion.create).toHaveBeenCalledWith(
            expect.objectContaining({ numero_comprobante: 'PROF-000006', estado: 'Pendiente' }),
            expect.anything()
        );
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true, msg: 'Cotización guardada exitosamente' })
        );
    });

    test('201 usa validez_dias=15 por defecto cuando no se envía', async () => {
        Configuracion.findOne.mockResolvedValue({ valor: '18' });
        Producto.findByPk.mockResolvedValue({ id: 1, nombre: 'Sierra' });
        Cotizacion.count.mockResolvedValue(0);
        Cotizacion.create.mockResolvedValue({ id: 1, numero_comprobante: 'PROF-000001' });
        DetalleCotizacion.create.mockResolvedValue(true);

        const req = {
            body: { items: [{ producto_id: 1, cantidad: 1, precio_unitario: 100 }] },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(Cotizacion.create).toHaveBeenCalledWith(
            expect.objectContaining({ validez_dias: 15 }),
            expect.anything()
        );
    });

    test('201 usa igv=18% por defecto cuando Configuracion devuelve null', async () => {
        Configuracion.findOne.mockResolvedValue(null);
        Producto.findByPk.mockResolvedValue({ id: 1, nombre: 'Nivel' });
        Cotizacion.count.mockResolvedValue(0);
        Cotizacion.create.mockResolvedValue({ id: 1, numero_comprobante: 'PROF-000001' });
        DetalleCotizacion.create.mockResolvedValue(true);

        const req = {
            body: { items: [{ producto_id: 1, cantidad: 1, precio_unitario: 118 }] },
            user: { id: 1 },
        };
        const res = mockRes();

        await create(req, res);

        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(201);
    });
});

// ─────────────────────────────────────────────
//  anular
// ─────────────────────────────────────────────
describe('CotizacionesController › anular', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando la cotización no existe', async () => {
        Cotizacion.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await anular(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Cotización no encontrada' });
    });

    test('200 anula la cotización correctamente', async () => {
        const mockCotizacion = {
            id: 1,
            estado: 'Pendiente',
            update: jest.fn().mockResolvedValue(true),
        };
        Cotizacion.findByPk.mockResolvedValue(mockCotizacion);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await anular(req, res);

        expect(mockCotizacion.update).toHaveBeenCalledWith({ estado: 'Anulada' });
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Cotización anulada' });
    });

    test('500 cuando la BD falla al anular', async () => {
        Cotizacion.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await anular(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});
