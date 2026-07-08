// El dashboard usa fn/col/literal de sequelize y sequelize directo — los mockeamos
jest.mock('../../src/config/db', () => ({}));

jest.mock('../../src/models', () => ({
    Venta:       { count: jest.fn(), findAll: jest.fn() },
    DetalleVenta:{ findAll: jest.fn() },
    Compra:      { findAll: jest.fn() },
    Producto:    { count: jest.fn(), findAll: jest.fn() },
    Categoria:   {},
    Cliente:     { count: jest.fn() },
    Caja:        { findOne: jest.fn() },
}));

const { getDashboardStats } = require('../../src/controllers/dashboardController');
const { Venta, DetalleVenta, Compra, Producto, Cliente, Caja } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json   = jest.fn().mockReturnValue(res);
    return res;
};

// Helper: crea un objeto que simula un resultado Sequelize con getDataValue()
const makeRow = (data) => ({ getDataValue: (key) => data[key] });

// ─────────────────────────────────────────────
//  getDashboardStats
// ─────────────────────────────────────────────
describe('DashboardController › getDashboardStats', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna estructura completa con todos los KPIs', async () => {
        // Métricas base
        Producto.count.mockResolvedValue(50);
        Cliente.count.mockResolvedValue(30);
        Venta.count.mockResolvedValue(5);
        Producto.findAll.mockResolvedValue([
            { id: 1, nombre: 'Sierra', stock: 1, stock_minimo: 5 },
        ]);
        Caja.findOne.mockResolvedValue({ id: 1, estado: 'Abierta' });

        // Ventas de hoy (suma)
        const ventasHoyRow = makeRow({ total: '1500.00' });
        // Tendencia últimos 7 días
        const tendenciaRow = makeRow({ fecha: '2026-07-01', total_dia: '500.00' });
        // Compras últimos 6 días
        const comprasRow = makeRow({ fecha: '2026-07-01', total_dia: '200.00' });
        // Top categorías
        // Últimas ventas
        // Global ventas y compras
        const globalVentaRow = makeRow({ total: '10000.00' });
        const globalCompraRow = makeRow({ total: '6000.00' });

        Venta.findAll
            .mockResolvedValueOnce([ventasHoyRow])       // ventasHoyTotalRaw
            .mockResolvedValueOnce([tendenciaRow])        // ventasUltimosDias
            .mockResolvedValueOnce([{ id: 1, total: '300', cliente: null }]) // ultimasVentas
            .mockResolvedValueOnce([globalVentaRow]);     // totalVentasGlobalRaw

        Compra.findAll
            .mockResolvedValueOnce([comprasRow])          // comprasUltimosDias
            .mockResolvedValueOnce([globalCompraRow]);    // totalComprasGlobalRaw

        DetalleVenta.findAll.mockResolvedValue([]);       // topCategorias

        const req = {};
        const res = mockRes();

        await getDashboardStats(req, res);

        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({
                ok: true,
                kpis: expect.objectContaining({
                    totalProductos: 50,
                    totalClientes: 30,
                    ventasHoy: 5,
                    cajaAbierta: true,
                }),
                stockCritico: expect.any(Array),
                tendenciaVentas: expect.objectContaining({
                    fechas: expect.any(Array),
                    totales: expect.any(Array),
                }),
                comparativa6Dias: expect.objectContaining({
                    fechas: expect.any(Array),
                    ventas: expect.any(Array),
                    compras: expect.any(Array),
                }),
                ultimasVentas: expect.any(Array),
                distribucion: expect.objectContaining({
                    ventas: 10000,
                    compras: 6000,
                    margen: 4000,
                }),
            })
        );
    });

    test('200 cajaAbierta=false cuando no hay caja abierta', async () => {
        Producto.count.mockResolvedValue(0);
        Cliente.count.mockResolvedValue(0);
        Venta.count.mockResolvedValue(0);
        Producto.findAll.mockResolvedValue([]);
        Caja.findOne.mockResolvedValue(null);

        const sinTotal = makeRow({ total: null });
        const sinTotalDia = makeRow({ fecha: null, total_dia: null });

        Venta.findAll
            .mockResolvedValueOnce([sinTotal])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([sinTotal]);

        Compra.findAll
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([sinTotal]);

        DetalleVenta.findAll.mockResolvedValue([]);

        const req = {};
        const res = mockRes();

        await getDashboardStats(req, res);

        const resultado = res.json.mock.calls[0][0];
        expect(resultado.ok).toBe(true);
        expect(resultado.kpis.cajaAbierta).toBe(false);
    });

    test('200 margen es 0 cuando compras superan a ventas', async () => {
        Producto.count.mockResolvedValue(10);
        Cliente.count.mockResolvedValue(5);
        Venta.count.mockResolvedValue(2);
        Producto.findAll.mockResolvedValue([]);
        Caja.findOne.mockResolvedValue(null);

        const ventasBajas  = makeRow({ total: '1000.00' });
        const comprasAltas = makeRow({ total: '5000.00' });

        Venta.findAll
            .mockResolvedValueOnce([ventasBajas])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([ventasBajas]);

        Compra.findAll
            .mockResolvedValueOnce([])
            .mockResolvedValueOnce([comprasAltas]);

        DetalleVenta.findAll.mockResolvedValue([]);

        const req = {};
        const res = mockRes();

        await getDashboardStats(req, res);

        const resultado = res.json.mock.calls[0][0];
        expect(resultado.distribucion.margen).toBe(0); // Math.max(0, 1000-5000) = 0
    });

    test('500 cuando la BD falla en cualquier consulta', async () => {
        Producto.count.mockRejectedValue(new Error('DB error'));

        const req = {};
        const res = mockRes();

        await getDashboardStats(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al generar dashboard stats' })
        );
    });
});
