const mockTransaction = {
    commit:   jest.fn().mockResolvedValue(true),
    rollback: jest.fn().mockResolvedValue(true),
};

jest.mock('../../src/config/db', () => ({
    transaction: jest.fn().mockResolvedValue(mockTransaction),
}));

jest.mock('../../src/models', () => ({
    CuentaPagar: { findAll: jest.fn(), findByPk: jest.fn() },
    AbonoPagar:  { create: jest.fn() },
    Proveedor:   {},
    Compra:      { findByPk: jest.fn() },
    Usuario:     {},
    Caja:        { findOne: jest.fn() },
    CajaEgreso:  { create: jest.fn() },
}));

const { listar, detalle, registrarAbono } = require('../../src/controllers/cuentasPagarController');
const { CuentaPagar, AbonoPagar, Compra, Caja, CajaEgreso } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  listar
// ─────────────────────────────────────────────
describe('CuentasPagarController › listar', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna todas las cuentas por pagar sin filtro', async () => {
        const cuentas = [{ id: 1, saldo_pendiente: '1000.00', estado: 'Pendiente' }];
        CuentaPagar.findAll.mockResolvedValue(cuentas);

        const req = { query: {} };
        const res = mockRes();

        await listar(req, res);

        expect(CuentaPagar.findAll).toHaveBeenCalledTimes(1);
        expect(res.json).toHaveBeenCalledWith({ ok: true, cuentas });
    });

    test('200 filtra por estado cuando se envía en query', async () => {
        CuentaPagar.findAll.mockResolvedValue([]);

        const req = { query: { estado: 'Pagado' } };
        const res = mockRes();

        await listar(req, res);

        const where = CuentaPagar.findAll.mock.calls[0][0].where;
        expect(where).toHaveProperty('estado', 'Pagado');
    });

    test('500 cuando la BD falla', async () => {
        CuentaPagar.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await listar(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al listar cuentas por pagar' })
        );
    });
});

// ─────────────────────────────────────────────
//  detalle
// ─────────────────────────────────────────────
describe('CuentasPagarController › detalle', () => {

    beforeEach(() => jest.clearAllMocks());

    test('404 cuando la cuenta no existe', async () => {
        CuentaPagar.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 } };
        const res = mockRes();

        await detalle(req, res);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Cuenta por pagar no encontrada' });
    });

    test('200 retorna el detalle con historial de abonos', async () => {
        const cuenta = { id: 1, saldo_pendiente: '1000.00', abonos: [] };
        CuentaPagar.findByPk.mockResolvedValue(cuenta);

        const req = { params: { id: 1 } };
        const res = mockRes();

        await detalle(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, cuenta });
    });

    test('500 cuando la BD falla', async () => {
        CuentaPagar.findByPk.mockRejectedValue(new Error('DB error'));

        const req = { params: { id: 1 } };
        const res = mockRes();

        await detalle(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  registrarAbono
// ─────────────────────────────────────────────
describe('CuentasPagarController › registrarAbono', () => {

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
        const req = { params: { id: 1 }, body: { monto: '-10' }, user: { id: 1 } };
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
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ msg: 'Para registrar un pago a proveedor (egreso) debes tener una caja activa.' })
        );
    });

    test('400 hace rollback cuando la cuenta no existe', async () => {
        Caja.findOne.mockResolvedValue({ id: 1 });
        CuentaPagar.findByPk.mockResolvedValue(null);

        const req = { params: { id: 99 }, body: { monto: '100' }, user: { id: 1 } };
        const res = mockRes();

        await registrarAbono(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith({ ok: false, msg: 'Cuenta por pagar no encontrada' });
    });

    test('400 hace rollback cuando la cuenta ya está pagada', async () => {
        Caja.findOne.mockResolvedValue({ id: 1 });
        CuentaPagar.findByPk.mockResolvedValue({ id: 1, estado: 'Pagado', saldo_pendiente: '0' });

        const req = { params: { id: 1 }, body: { monto: '50' }, user: { id: 1 } };
        const res = mockRes();

        await registrarAbono(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(
            { ok: false, msg: 'Esta cuenta ya ha sido cancelada al proveedor en su totalidad.' }
        );
    });

    test('400 hace rollback cuando el abono supera el saldo pendiente', async () => {
        Caja.findOne.mockResolvedValue({ id: 1 });
        CuentaPagar.findByPk.mockResolvedValue({
            id: 1, estado: 'Pendiente', saldo_pendiente: '100.00',
        });

        const req = { params: { id: 1 }, body: { monto: '999' }, user: { id: 1 } };
        const res = mockRes();

        await registrarAbono(req, res);

        expect(mockTransaction.rollback).toHaveBeenCalled();
        expect(res.status).toHaveBeenCalledWith(400);
    });

    test('200 registra abono parcial — estado sigue Pendiente', async () => {
        const mockCaja = { id: 1, update: jest.fn() };
        const mockCuenta = {
            id: 1, compra_id: 5, estado: 'Pendiente',
            monto_total: '1000.00', saldo_pagado: '200.00', saldo_pendiente: '800.00',
            update: jest.fn().mockResolvedValue(true),
        };
        const mockAbono = { id: 1, monto: 300 };

        Caja.findOne.mockResolvedValue(mockCaja);
        CuentaPagar.findByPk.mockResolvedValue(mockCuenta);
        AbonoPagar.create.mockResolvedValue(mockAbono);
        Compra.findByPk.mockResolvedValue({ id: 5, numero_orden: 'OC-001' });
        CajaEgreso.create.mockResolvedValue(true);

        const req = {
            params: { id: 1 },
            body: { monto: '300', metodo_pago: 'Efectivo' },
            user: { id: 1 },
        };
        const res = mockRes();

        await registrarAbono(req, res);

        // saldo_pagado: 200 + 300 = 500; saldo_pendiente: 1000 - 500 = 500 → Pendiente
        expect(mockCuenta.update).toHaveBeenCalledWith(
            expect.objectContaining({ saldo_pagado: 500, saldo_pendiente: 500, estado: 'Pendiente' }),
            expect.anything()
        );
        expect(CajaEgreso.create).toHaveBeenCalledTimes(1);
        expect(mockTransaction.commit).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: true, msg: 'Pago/Abono a proveedor registrado exitosamente' })
        );
    });

    test('200 registra abono total y cambia estado a Pagado', async () => {
        const mockCaja = { id: 1, update: jest.fn() };
        const mockCuenta = {
            id: 1, compra_id: 6, estado: 'Pendiente',
            monto_total: '500.00', saldo_pagado: '0', saldo_pendiente: '500.00',
            update: jest.fn().mockResolvedValue(true),
        };

        Caja.findOne.mockResolvedValue(mockCaja);
        CuentaPagar.findByPk.mockResolvedValue(mockCuenta);
        AbonoPagar.create.mockResolvedValue({ id: 2, monto: 500 });
        Compra.findByPk.mockResolvedValue(null); // compraRef null → usa 'S/N'
        CajaEgreso.create.mockResolvedValue(true);

        const req = {
            params: { id: 1 },
            body: { monto: '500', metodo_pago: 'Transferencia' },
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
