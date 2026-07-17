/**
 * PRUEBAS DE INTEGRACIÓN — Caja
 *
 * Cubre el flujo completo del turno de caja:
 * apertura → registro de movimiento → cierre con cálculo automático.
 * Roles: Administrador y Cajero.
 */

// ── Mocks ─────────────────────────────────────────────────────────────────────
jest.mock('../../src/config/db', () => ({
    authenticate: jest.fn().mockResolvedValue(true),
    define:       jest.fn().mockReturnValue({}),
    transaction:  jest.fn(),
}));

jest.mock('../../src/models', () => ({
    Caja:     { findOne: jest.fn(), findByPk: jest.fn(), findAll: jest.fn(), create: jest.fn() },
    CajaEgreso: { findAll: jest.fn(), create: jest.fn() },
    Venta:    { findAll: jest.fn() },
    Usuario:  {},
}));

// ── Imports ───────────────────────────────────────────────────────────────────
const request = require('supertest');
const app     = require('./setup/app-test');
const { generarToken } = require('./setup/tokenHelper');
const { Caja, CajaEgreso, Venta } = require('../../src/models');

const TOKEN        = `Bearer ${generarToken()}`;
const TOKEN_CAJERO = `Bearer ${generarToken({ rol: 'Cajero', id: 2 })}`;

// ─────────────────────────────────────────────────────────────────────────────
//  Seguridad — rutas protegidas por rol
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › Caja — seguridad', () => {

    test('401 GET /api/caja/actual sin token', async () => {
        const res = await request(app).get('/api/caja/actual');
        expect(res.status).toBe(401);
        expect(res.body.msg).toBe('Token no proporcionado');
    });

    test('401 POST /api/caja/abrir sin token', async () => {
        const res = await request(app).post('/api/caja/abrir').send({});
        expect(res.status).toBe(401);
    });

    test('403 POST /api/caja/abrir con rol Almacenero', async () => {
        const tokenAlmacenero = `Bearer ${generarToken({ rol: 'Almacenero' })}`;
        const res = await request(app)
            .post('/api/caja/abrir')
            .set('Authorization', tokenAlmacenero)
            .send({ monto_inicial: 100 });
        expect(res.status).toBe(403);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/caja/actual
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/caja/actual', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna la caja abierta actualmente', async () => {
        const cajaActual = { id: 1, estado: 'Abierta', monto_inicial: 500, usuario: { nombre: 'Admin' } };
        Caja.findOne.mockResolvedValue(cajaActual);

        const res = await request(app)
            .get('/api/caja/actual')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.caja).toBeDefined();
        expect(res.body.caja.estado).toBe('Abierta');
    });

    test('200 retorna null cuando no hay caja abierta', async () => {
        Caja.findOne.mockResolvedValue(null);

        const res = await request(app)
            .get('/api/caja/actual')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.caja).toBeNull();
    });

    test('200 Cajero puede consultar la caja actual', async () => {
        Caja.findOne.mockResolvedValue({ id: 1, estado: 'Abierta' });

        const res = await request(app)
            .get('/api/caja/actual')
            .set('Authorization', TOKEN_CAJERO);

        expect(res.status).toBe(200);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/caja/abrir — Apertura de caja
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › POST /api/caja/abrir', () => {

    beforeEach(() => jest.clearAllMocks());

    test('201 abre una caja nueva con monto inicial enviado', async () => {
        Caja.findOne.mockResolvedValue(null); // no hay caja abierta
        const nuevaCaja = { id: 1, estado: 'Abierta', monto_inicial: 500, usuario_id: 1 };
        Caja.create.mockResolvedValue(nuevaCaja);

        const res = await request(app)
            .post('/api/caja/abrir')
            .set('Authorization', TOKEN)
            .send({ monto_inicial: 500 });

        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
        expect(res.body.msg).toBe('Caja abierta');
        expect(res.body.caja).toBeDefined();
        expect(Caja.create).toHaveBeenCalledWith(
            expect.objectContaining({ monto_inicial: 500, estado: 'Abierta', usuario_id: 1 })
        );
    });

    test('201 abre caja con monto_inicial 0 cuando no se envía monto', async () => {
        Caja.findOne.mockResolvedValue(null);
        Caja.create.mockResolvedValue({ id: 2, estado: 'Abierta', monto_inicial: 0 });

        const res = await request(app)
            .post('/api/caja/abrir')
            .set('Authorization', TOKEN)
            .send({});

        expect(res.status).toBe(201);
        expect(Caja.create).toHaveBeenCalledWith(
            expect.objectContaining({ monto_inicial: 0 })
        );
    });

    test('400 cuando ya existe una caja abierta', async () => {
        Caja.findOne.mockResolvedValue({ id: 1, estado: 'Abierta' });

        const res = await request(app)
            .post('/api/caja/abrir')
            .set('Authorization', TOKEN)
            .send({ monto_inicial: 200 });

        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.msg).toBe('Ya hay una caja abierta');
        expect(Caja.create).not.toHaveBeenCalled();
    });

    test('201 Cajero puede abrir caja correctamente', async () => {
        Caja.findOne.mockResolvedValue(null);
        Caja.create.mockResolvedValue({ id: 3, estado: 'Abierta', monto_inicial: 300, usuario_id: 2 });

        const res = await request(app)
            .post('/api/caja/abrir')
            .set('Authorization', TOKEN_CAJERO)
            .send({ monto_inicial: 300 });

        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/caja/movimiento — Registro de egreso/ingreso
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › POST /api/caja/movimiento', () => {

    beforeEach(() => jest.clearAllMocks());

    test('201 registra un movimiento de egreso en la caja activa', async () => {
        const mov = { id: 1, caja_id: 1, concepto: 'Gastos limpieza', monto: 50, tipo: 'Egreso' };
        CajaEgreso.create.mockResolvedValue(mov);

        const res = await request(app)
            .post('/api/caja/movimiento')
            .set('Authorization', TOKEN)
            .send({ caja_id: 1, concepto: 'Gastos limpieza', monto: 50, tipo: 'Egreso' });

        expect(res.status).toBe(201);
        expect(res.body.ok).toBe(true);
        expect(res.body.msg).toBe('Movimiento registrado');
        expect(res.body.movimiento).toBeDefined();
        expect(CajaEgreso.create).toHaveBeenCalledWith(
            expect.objectContaining({ caja_id: 1, concepto: 'Gastos limpieza', monto: 50, tipo: 'Egreso' })
        );
    });

    test('201 usa tipo Egreso por defecto cuando no se envía tipo', async () => {
        CajaEgreso.create.mockResolvedValue({ id: 2, tipo: 'Egreso' });

        const res = await request(app)
            .post('/api/caja/movimiento')
            .set('Authorization', TOKEN)
            .send({ caja_id: 1, concepto: 'Varios', monto: 30 });

        expect(res.status).toBe(201);
        expect(CajaEgreso.create).toHaveBeenCalledWith(
            expect.objectContaining({ tipo: 'Egreso' })
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  PUT /api/caja/:id/cerrar — Cierre de caja con cálculo de monto_final
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › PUT /api/caja/:id/cerrar', () => {

    beforeEach(() => jest.clearAllMocks());

    test('400 cuando la caja no existe', async () => {
        Caja.findByPk.mockResolvedValue(null);

        const res = await request(app)
            .put('/api/caja/99/cerrar')
            .set('Authorization', TOKEN)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.ok).toBe(false);
        expect(res.body.msg).toBe('Caja no encontrada o ya cerrada');
    });

    test('400 cuando la caja ya está cerrada', async () => {
        Caja.findByPk.mockResolvedValue({ id: 1, estado: 'Cerrada' });

        const res = await request(app)
            .put('/api/caja/1/cerrar')
            .set('Authorization', TOKEN)
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.msg).toBe('Caja no encontrada o ya cerrada');
    });

    test('200 cierra la caja calculando monto_final = inicial + ventas - egresos', async () => {
        const mockCaja = {
            id: 1,
            estado: 'Abierta',
            monto_inicial: '200.00',
            fecha_apertura: new Date('2026-07-01T08:00:00'),
            update: jest.fn().mockResolvedValue(true),
        };
        Caja.findByPk.mockResolvedValue(mockCaja);

        // Ventas: 150 + 200 = 350
        Venta.findAll.mockResolvedValue([
            { total: '150.00' },
            { total: '200.00' },
        ]);

        // Egresos: 50
        CajaEgreso.findAll.mockResolvedValue([
            { monto: '50.00' },
        ]);

        const res = await request(app)
            .put('/api/caja/1/cerrar')
            .set('Authorization', TOKEN)
            .send({ observaciones: 'Cierre normal' });

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.msg).toBe('Caja cerrada');

        // monto_final = 200 + 350 - 50 = 500
        expect(mockCaja.update).toHaveBeenCalledWith(
            expect.objectContaining({
                estado:        'Cerrada',
                total_ventas:  350,
                total_egresos: 50,
                monto_final:   500,
                observaciones: 'Cierre normal',
            })
        );
    });

    test('200 cierra caja con cero ventas y cero egresos — monto_final = monto_inicial', async () => {
        const mockCaja = {
            id: 2,
            estado: 'Abierta',
            monto_inicial: '100.00',
            fecha_apertura: new Date(),
            update: jest.fn().mockResolvedValue(true),
        };
        Caja.findByPk.mockResolvedValue(mockCaja);
        Venta.findAll.mockResolvedValue([]);
        CajaEgreso.findAll.mockResolvedValue([]);

        const res = await request(app)
            .put('/api/caja/2/cerrar')
            .set('Authorization', TOKEN)
            .send({});

        expect(res.status).toBe(200);
        expect(mockCaja.update).toHaveBeenCalledWith(
            expect.objectContaining({ monto_final: 100, total_ventas: 0, total_egresos: 0 })
        );
    });
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/caja/historial
// ─────────────────────────────────────────────────────────────────────────────
describe('Integración › GET /api/caja/historial', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna el historial de cajas con movimientos', async () => {
        const historial = [
            { id: 1, estado: 'Cerrada', monto_final: 500, movimientos: [] },
            { id: 2, estado: 'Abierta',  monto_final: 0,   movimientos: [] },
        ];
        Caja.findAll.mockResolvedValue(historial);

        const res = await request(app)
            .get('/api/caja/historial')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.ok).toBe(true);
        expect(res.body.cajas).toHaveLength(2);
    });

    test('200 retorna array vacío cuando no hay historial', async () => {
        Caja.findAll.mockResolvedValue([]);

        const res = await request(app)
            .get('/api/caja/historial')
            .set('Authorization', TOKEN);

        expect(res.status).toBe(200);
        expect(res.body.cajas).toEqual([]);
    });
});
