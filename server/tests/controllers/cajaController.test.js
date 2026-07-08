jest.mock('../../src/models', () => ({
    Caja:      { findOne: jest.fn(), findByPk: jest.fn(), findAll: jest.fn(), create: jest.fn() },
    CajaEgreso:{ findAll: jest.fn(), create: jest.fn() },
    Venta:     { findAll: jest.fn() },
    Usuario:   {},
}));

const { getCajaActual, abrir, cerrar, registrarMovimiento, getHistorial } = require('../../src/controllers/cajaController');
const { Caja, CajaEgreso, Venta } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  getCajaActual
// ─────────────────────────────────────────────
describe('CajaController › getCajaActual', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna la caja abierta actualmente', async () => {
        const caja = { id: 1, estado: 'Abierta', monto_inicial: 100 };
        Caja.findOne.mockResolvedValue(caja);

        const req = {};
        const res = mockRes();

        await getCajaActual(req, res);

        expect(Caja.findOne).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, caja });
    });

    test('200 retorna null cuando no hay caja abierta', async () => {
        Caja.findOne.mockResolvedValue(null);

        const req = {};
        const res = mockRes();

        await getCajaActual(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, caja: null });
    });

    test('500 cuando la BD falla', async () => {
        Caja.findOne.mockRejectedValue(new Error('DB error'));

        const req = {};
        const res = mockRes();

        await getCajaActual(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false })
        );
    });
});

// ─────────────────────────────────────────────
//  abrir
// ─────────────────────────────────────────────
describe('CajaController › abrir', () => {

    beforeEach(() => jest.clearAllMocks());

    test('400 cuando ya existe una caja abierta', async () => {
        Caja.findOne.mockResolvedValue({ id: 1, estado: 'Abierta' });

        const req = { body: { monto_inicial: 200 }, user: { id: 1 } };
        const res = mockRes();

        await abrir(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Ya hay una caja abierta' });
        expect(Caja.create).not.toHaveBeenCalled();
    });

    test('201 abre una caja nueva con monto inicial enviado', async () => {
        Caja.findOne.mockResolvedValue(null);
        const nuevaCaja = { id: 2, estado: 'Abierta', monto_inicial: 500 };
        Caja.create.mockResolvedValue(nuevaCaja);

        const req = { body: { monto_inicial: 500 }, user: { id: 1 } };
        const res = mockRes();

        await abrir(req, res);

        expect(Caja.create).toHaveBeenCalledWith(
            expect.objectContaining({ monto_inicial: 500, estado: 'Abierta', usuario_id: 1 })
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Caja abierta', caja: nuevaCaja });
    });

    test('201 usa monto_inicial 0 cuando no se envía monto', async () => {
        Caja.findOne.mockResolvedValue(null);
        Caja.create.mockResolvedValue({ id: 3, monto_inicial: 0 });

        const req = { body: {}, user: { id: 1 } };
        const res = mockRes();

        await abrir(req, res);

        expect(Caja.create).toHaveBeenCalledWith(
            expect.objectContaining({ monto_inicial: 0 })
        );
        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('500 cuando la BD falla al crear', async () => {
        Caja.findOne.mockResolvedValue(null);
        Caja.create.mockRejectedValue(new Error('DB error'));

        const req = { body: { monto_inicial: 100 }, user: { id: 1 } };
        const res = mockRes();

        await abrir(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al abrir caja' })
        );
    });
});

// ─────────────────────────────────────────────
//  cerrar
// ─────────────────────────────────────────────
describe('CajaController › cerrar', () => {

    beforeEach(() => jest.clearAllMocks());

    test('400 cuando la caja no existe', async () => {
        Caja.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 }, body: {} };
        const res = mockRes();

        await cerrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Caja no encontrada o ya cerrada' });
    });

    test('400 cuando la caja ya está cerrada', async () => {
        Caja.findByPk.mockResolvedValue({ id: 1, estado: 'Cerrada' });

        const req = { params: { id: 1 }, body: {} };
        const res = mockRes();

        await cerrar(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Caja no encontrada o ya cerrada' });
    });

    test('200 cierra la caja calculando totales de ventas y egresos', async () => {
        const mockCaja = {
            id: 1,
            estado: 'Abierta',
            monto_inicial: 200,
            fecha_apertura: new Date('2026-07-01T08:00:00'),
            update: jest.fn().mockResolvedValue(true),
        };
        Caja.findByPk.mockResolvedValue(mockCaja);
        Venta.findAll.mockResolvedValue([
            { total: '150.00' },
            { total: '200.00' },
        ]);
        CajaEgreso.findAll.mockResolvedValue([
            { monto: '50.00' },
        ]);

        const req = { params: { id: 1 }, body: { observaciones: 'Cierre normal' } };
        const res = mockRes();

        await cerrar(req, res);

        // total_ventas = 350, total_egresos = 50, monto_final = 200 + 350 - 50 = 500
        expect(mockCaja.update).toHaveBeenCalledWith(
            expect.objectContaining({
                estado: 'Cerrada',
                total_ventas: 350,
                total_egresos: 50,
                monto_final: 500,
                observaciones: 'Cierre normal',
            })
        );
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Caja cerrada', caja: mockCaja });
    });

    test('200 cierra la caja con cero ventas y cero egresos', async () => {
        const mockCaja = {
            id: 2,
            estado: 'Abierta',
            monto_inicial: 100,
            fecha_apertura: new Date(),
            update: jest.fn().mockResolvedValue(true),
        };
        Caja.findByPk.mockResolvedValue(mockCaja);
        Venta.findAll.mockResolvedValue([]);
        CajaEgreso.findAll.mockResolvedValue([]);

        const req = { params: { id: 2 }, body: {} };
        const res = mockRes();

        await cerrar(req, res);

        expect(mockCaja.update).toHaveBeenCalledWith(
            expect.objectContaining({ monto_final: 100, total_ventas: 0, total_egresos: 0 })
        );
    });

    test('500 cuando la BD falla al cerrar', async () => {
        Caja.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 }, body: {} };
        const res = mockRes();

        await cerrar(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al cerrar caja' })
        );
    });
});

// ─────────────────────────────────────────────
//  registrarMovimiento
// ─────────────────────────────────────────────
describe('CajaController › registrarMovimiento', () => {

    beforeEach(() => jest.clearAllMocks());

    test('201 registra un movimiento de egreso correctamente', async () => {
        const movimiento = { id: 1, caja_id: 1, monto: 50, tipo: 'Egreso' };
        CajaEgreso.create.mockResolvedValue(movimiento);

        const req = { body: { caja_id: 1, concepto: 'Gasto limpieza', monto: 50, tipo: 'Egreso' }, user: { id: 1 } };
        const res = mockRes();

        await registrarMovimiento(req, res);

        expect(CajaEgreso.create).toHaveBeenCalledWith(
            expect.objectContaining({ caja_id: 1, monto: 50, tipo: 'Egreso', usuario_id: 1 })
        );
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({ ok: true, msg: 'Movimiento registrado', movimiento });
    });

    test('201 usa tipo "Egreso" por defecto cuando no se envía tipo', async () => {
        CajaEgreso.create.mockResolvedValue({ id: 2, tipo: 'Egreso' });

        const req = { body: { caja_id: 1, concepto: 'Varios', monto: 30 }, user: { id: 1 } };
        const res = mockRes();

        await registrarMovimiento(req, res);

        expect(CajaEgreso.create).toHaveBeenCalledWith(
            expect.objectContaining({ tipo: 'Egreso' })
        );
    });

    test('500 cuando la BD falla al registrar', async () => {
        CajaEgreso.create.mockRejectedValue(new Error('DB error'));

        const req = { body: { caja_id: 1, monto: 50 }, user: { id: 1 } };
        const res = mockRes();

        await registrarMovimiento(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false })
        );
    });
});

// ─────────────────────────────────────────────
//  getHistorial
// ─────────────────────────────────────────────
describe('CajaController › getHistorial', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna historial de cajas', async () => {
        const cajas = [
            { id: 1, estado: 'Cerrada', monto_final: 500 },
            { id: 2, estado: 'Abierta', monto_final: 0 },
        ];
        Caja.findAll.mockResolvedValue(cajas);

        const req = {};
        const res = mockRes();

        await getHistorial(req, res);

        expect(Caja.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, cajas });
    });

    test('200 retorna array vacío cuando no hay historial', async () => {
        Caja.findAll.mockResolvedValue([]);

        const req = {};
        const res = mockRes();

        await getHistorial(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, cajas: [] });
    });

    test('500 cuando la BD falla', async () => {
        Caja.findAll.mockRejectedValue(new Error('DB error'));

        const req = {};
        const res = mockRes();

        await getHistorial(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false })
        );
    });
});
