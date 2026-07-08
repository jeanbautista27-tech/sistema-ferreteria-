const mockTransaction = {
    commit:   jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true),
};

jest.mock('../../src/config/db', () => ({
    transaction: jest.fn().mockResolvedValue(mockTransaction),
}));

jest.mock('../../src/models', () => ({
    CuentaCobrar: { findAll: jest.fn(), findByPk: jest.fn() },
    AbonoCuenta:  { create: jest.fn() },
    Cliente:      {},
    Venta:        {},
    Usuario:      {},
    Caja:         { findOne: jest.fn() },
    CajaEgreso:   { sum: jest.fn() },
}));

const { listar, detalle, registrarAbono } = require('../../src/controllers/cuentasCobrarController');
const { CuentaCobrar, AbonoCuenta, Caja, CajaEgreso } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  listar
// ─────────────────────────────────────────────
describe('CuentasCobrarController › listar', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna todas las cuentas por cobrar sin filtro', async () => {
        const cuentas = [{ id: 1, saldo_pendiente: '500.00', estado: 'Pendiente' }];
        CuentaCobrar.findAll.mockResolvedValue(cuentas);

        const req = { query: {} };
        const res = mockRes();

        await listar(req, res);

        expect(CuentaCobrar.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, cuentas });
    });

    test('200 filtra por estado cuando se envía en query', async () => {
        CuentaCobrar.findAll.mockResolvedValue([]);

        const req = { query: { estado: 'Pagado' } };
        const res = mockRes();

        await listar(req, res);

        const where = CuentaCobrar.findAll.mock.calls[0][0].where;
        expect(where).toHaveProperty('estado', 'Pagado');
    });

    test('500 cuando la BD falla', async () => {
        CuentaCobrar.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al listar cuentas' })
        );
    });
});

// ─────────────────────────────────────────────
//  detalle
// ─────────────────────────────────────────────
describe('CuentasCobrarController › detalle', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando la cuenta no existe', async () => {
        CuentaCobrar.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await detalle(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Cuenta por cobrar no encontrada' });
    });

    test('200 retorna el detalle con abonos', async () => {
        const cuenta = { id: 1, saldo_pendiente: '500.00', abonos: [] };
        CuentaCobrar.findByPk.mockResolvedValue(cuenta);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await detalle(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, cuenta });
    });

    test('500 cuando la BD falla', async () => {
        CuentaCobrar.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await detalle(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  registrarAbono
// ─────────────────────────────────────────────
describe('CuentasCobrarController › registrarAbono', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockTransaction.commit.mockResolvedValue(true);
        mockTransaction.rollback.mockResolvedValue(true);
    });

    test('400 hace rollback cuando el monto es inválido (NaN)', async () => {
        const req = { params: { id: 1 }, body: { monto: 'abc' }, user: { id: 1 } };
        const res = mockRes();

        await registrarAbono(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Monto inválido' });
    });

    test('400 hace rollback cuando el monto es cero o negativo', async () => {
        const req = { params: { id: 1 }, body: { monto: '0' }, user: { id: 1 } };
        const res = mockRes();

        await registrarAbono(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('400 hace rollback cuando no hay caja abierta', async () => {
        Caja.findOne.mockResolvedValue(null);

        const req = { params: { id: 1 }, body: { monto: '100' }, user: { id: 1 } };
        const res = mockRes();

        await registrarAbono(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ msg: 'Para registrar un abono debes tener una caja abierta activa.' })
        );
    });

    test('400 hace rollback cuando la cuenta no existe', async () => {
        Caja.findOne.mockResolvedValue({ id: 1, estado: 'Abierta' });
        CuentaCobrar.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 }, body: { monto: '100' }, user: { id: 1 } };
        const res = mockRes();

        await registrarAbono(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Cuenta por cobrar no encontrada' });
    });

    test('400 hace rollback cuando la cuenta ya está pagada', async () => {
        Caja.findOne.mockResolvedValue({ id: 1 });
        CuentaCobrar.findByPk.mockResolvedValue({ id: 1, estado: 'Pagado', saldo_pendiente: '0' });

        const req = { params: { id: 1 }, body: { monto: '50' }, user: { id: 1 } };
        const res = mockRes();

        await registrarAbono(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Esta cuenta ya está completamente pagada' });
    });

    test('400 hace rollback cuando el abono supera el saldo pendiente', async () => {
        Caja.findOne.mockResolvedValue({ id: 1 });
        CuentaCobrar.findByPk.mockResolvedValue({
            id: 1, estado: 'Pendiente', saldo_pendiente: '100.00', saldo_pagado: '0',
        });

        const req = { params: { id: 1 }, body: { monto: '500' }, user: { id: 1 } };
        const res = mockRes();

        await registrarAbono(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('200 registra abono parcial y actualiza saldo — estado sigue Pendiente', async () => {
        const mockCaja = {
            id: 1, monto_inicial: '200', total_ventas: '0',
            update: jest.fn().mockResolvedValue(true),
        };
        const mockCuenta = {
            id: 1, estado: 'Pendiente',
            monto_total: '500.00', saldo_pagado: '100.00', saldo_pendiente: '400.00',
            update: jest.fn().mockResolvedValue(true),
        };
        const mockAbono = { id: 1, monto: 200 };

        Caja.findOne.mockResolvedValue(mockCaja);
        CuentaCobrar.findByPk.mockResolvedValue(mockCuenta);
        AbonoCuenta.create.mockResolvedValue(mockAbono);
        CajaEgreso.sum.mockResolvedValue(0);

        const req = {
            params: { id: 1 },
            body: { monto: '200', metodo_pago: 'Efectivo' },
            user: { id: 1 },
        };
        const res = mockRes();

        await registrarAbono(req, res);

        // Saldo pagado: 100 + 200 = 300; pendiente: 500 - 300 = 200 → estado Pendiente
        expect(mockCuenta.update).toHaveBeenCalledWith(
            expect.objectContaining({ saldo_pagado: 300, saldo_pendiente: 200, estado: 'Pendiente' }),
            expect.anything()
        );
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true, msg: 'Abono registrado exitosamente' })
        );
    });

    test('200 registra abono total y cambia estado a Pagado', async () => {
        const mockCaja = {
            id: 1, monto_inicial: '0', total_ventas: '0',
            update: jest.fn().mockResolvedValue(true),
        };
        const mockCuenta = {
            id: 1, estado: 'Pendiente',
            monto_total: '300.00', saldo_pagado: '0', saldo_pendiente: '300.00',
            update: jest.fn().mockResolvedValue(true),
        };

        Caja.findOne.mockResolvedValue(mockCaja);
        CuentaCobrar.findByPk.mockResolvedValue(mockCuenta);
        AbonoCuenta.create.mockResolvedValue({ id: 2, monto: 300 });
        CajaEgreso.sum.mockResolvedValue(0);

        const req = {
            params: { id: 1 },
            body: { monto: '300', metodo_pago: 'Transferencia' },
            user: { id: 1 },
        };
        const res = mockRes();

        await registrarAbono(req, res);

        expect(mockCuenta.update).toHaveBeenCalledWith(
            expect.objectContaining({ estado: 'Pagado', saldo_pendiente: 0 }),
            expect.anything()
        );
        expect(mockTransaction.commit).toHaveBeenCalled();
    });
});
