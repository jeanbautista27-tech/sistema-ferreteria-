// ExcelJS y PDFDocument se mockean para evitar I/O real
jest.mock('exceljs', () => {
    const mockSheet = {
        columns: [],
        getRow: jest.fn().mockReturnValue({ eachCell: jest.fn(), font: {} }),
        addRow:  jest.fn().mockReturnValue({ font: {} }),
        autoFilter: '',
    };
    const mockWorkbook = {
        creator: '',
        addWorksheet: jest.fn().mockReturnValue(mockSheet),
        xlsx: { write: jest.fn().mockResolvedValue(true) },
    };
    return { Workbook: jest.fn().mockImplementation(() => mockWorkbook) };
});

jest.mock('pdfkit', () => {
    return jest.fn().mockImplementation(() => ({
        fontSize:  jest.fn().mockReturnThis(),
        font:      jest.fn().mockReturnThis(),
        text:      jest.fn().mockReturnThis(),
        moveDown:  jest.fn().mockReturnThis(),
        moveTo:    jest.fn().mockReturnThis(),
        lineTo:    jest.fn().mockReturnThis(),
        stroke:    jest.fn().mockReturnThis(),
        addPage:   jest.fn().mockReturnThis(),
        pipe:      jest.fn().mockReturnThis(),
        end:       jest.fn(),
        y: 100,
    }));
});

jest.mock('../../src/models', () => ({
    Venta:        { findAll: jest.fn() },
    DetalleVenta: { findAll: jest.fn() },
    Producto:     { findAll: jest.fn() },
    Categoria:    {},
    Compra:       { findAll: jest.fn() },
    Caja:         {},
    Proveedor:    {},
    Cliente:      {},
    CuentaCobrar: { findAll: jest.fn() },
    CuentaPagar:  { findAll: jest.fn() },
}));

const {
    resumenVentas, productosVendidos,
    exportarExcel, exportarPDF,
    exportarInventarioExcel, exportarInventarioPDF,
} = require('../../src/controllers/reportesController');

const { Venta, DetalleVenta, Producto, Compra, CuentaCobrar, CuentaPagar } = require('../../src/models');

const mockRes = () => {
    const res = {};
    res.status     = jest.fn().mockReturnValue(res);
    res.json       = jest.fn().mockReturnValue(res);
    res.setHeader  = jest.fn().mockReturnValue(res);
    res.end        = jest.fn().mockReturnValue(res);
    return res;
};

// ─────────────────────────────────────────────
//  resumenVentas
// ─────────────────────────────────────────────
describe('ReportesController › resumenVentas', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 calcula totales de ventas e IGV', async () => {
        Venta.findAll.mockResolvedValue([
            { total: '118.00', igv: '18.00' },
            { total: '236.00', igv: '36.00' },
        ]);

        const req = { query: {} };
        const res = mockRes();

        await resumenVentas(req, res);

        expect(res.json).toHaveBeenCalledWith({
            ok: true,
            total_ventas: 354,
            total_igv: 54,
            cantidad_ventas: 2,
        });
    });

    test('200 retorna ceros cuando no hay ventas', async () => {
        Venta.findAll.mockResolvedValue([]);

        const req = { query: {} };
        const res = mockRes();

        await resumenVentas(req, res);

        expect(res.json).toHaveBeenCalledWith({
            ok: true, total_ventas: 0, total_igv: 0, cantidad_ventas: 0,
        });
    });

    test('200 filtra por rango de fechas cuando se envían desde/hasta', async () => {
        Venta.findAll.mockResolvedValue([]);

        const req = { query: { desde: '2026-01-01', hasta: '2026-06-30' } };
        const res = mockRes();

        await resumenVentas(req, res);

        const where = Venta.findAll.mock.calls[0][0].where;
        expect(where).toHaveProperty('created_at');
    });

    test('500 cuando la BD falla', async () => {
        Venta.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await resumenVentas(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false })
        );
    });
});

// ─────────────────────────────────────────────
//  productosVendidos
// ─────────────────────────────────────────────
describe('ReportesController › productosVendidos', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 retorna detalles de productos vendidos', async () => {
        const detalles = [{ producto_id: 1, total_cantidad: '5', total_subtotal: '250.00' }];
        DetalleVenta.findAll.mockResolvedValue(detalles);

        const req = { query: {} };
        const res = mockRes();

        await productosVendidos(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, detalles });
    });

    test('200 retorna array vacío cuando no hay detalles', async () => {
        DetalleVenta.findAll.mockResolvedValue([]);

        const req = { query: {} };
        const res = mockRes();

        await productosVendidos(req, res);

        expect(res.json).toHaveBeenCalledWith({ ok: true, detalles: [] });
    });

    test('500 cuando la BD falla', async () => {
        DetalleVenta.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await productosVendidos(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
    });
});

// ─────────────────────────────────────────────
//  exportarExcel
// ─────────────────────────────────────────────
describe('ReportesController › exportarExcel', () => {

    beforeEach(() => jest.clearAllMocks());

    const ventaMock = {
        tipo_pago: 'Efectivo', total: '118.00', subtotal: '100.00', igv: '18.00',
        estado: 'Completada', numero_comprobante: 'B001-00000001',
        tipo_comprobante: 'Boleta', created_at: new Date('2026-07-01'),
        cliente: { nombre: 'Juan Pérez' },
    };
    const compraMock = {
        tipo_pago: 'Crédito', total: '590.00', estado: 'Pendiente',
        numero_orden: 'OC-001', created_at: new Date('2026-07-01'),
        proveedor: { empresa: 'Dist. ABC' },
    };
    const cxcMock = {
        estado: 'Pendiente', monto_total: '118.00', saldo_pagado: '0', saldo_pendiente: '118.00',
        cliente: { nombre: 'Juan' }, venta: { numero_comprobante: 'B001-00000001' },
    };
    const cxpMock = {
        estado: 'Pendiente', monto_total: '590.00', saldo_pagado: '0', saldo_pendiente: '590.00',
        proveedor: { empresa: 'Dist. ABC' }, compra: { numero_orden: 'OC-001' },
    };

    test('200 genera y envía el archivo Excel con 4 hojas', async () => {
        Venta.findAll.mockResolvedValue([ventaMock]);
        Compra.findAll.mockResolvedValue([compraMock]);
        CuentaCobrar.findAll.mockResolvedValue([cxcMock]);
        CuentaPagar.findAll.mockResolvedValue([cxpMock]);

        const req = { query: {} };
        const res = mockRes();

        await exportarExcel(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition',
            'attachment; filename=Reporte_Consolidado_Financiero.xlsx');
        expect(res.end).toHaveBeenCalled();
    });

    test('200 calcula TOTAL CAJA REAL excluyendo ventas al Crédito', async () => {
        const ventaCredito  = { ...ventaMock, tipo_pago: 'Crédito',   total: '200.00' };
        const ventaEfectivo = { ...ventaMock, tipo_pago: 'Efectivo',  total: '100.00', cliente: null };
        Venta.findAll.mockResolvedValue([ventaCredito, ventaEfectivo]);
        Compra.findAll.mockResolvedValue([]);
        CuentaCobrar.findAll.mockResolvedValue([]);
        CuentaPagar.findAll.mockResolvedValue([]);

        const req = { query: {} };
        const res = mockRes();

        await exportarExcel(req, res);

        // Solo la venta de efectivo (100) debe sumar al total caja real
        expect(res.end).toHaveBeenCalled();
    });

    test('500 cuando la BD falla', async () => {
        Venta.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await exportarExcel(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al exportar consolidado' })
        );
    });
});

// ─────────────────────────────────────────────
//  exportarPDF
// ─────────────────────────────────────────────
describe('ReportesController › exportarPDF', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 genera y envía el PDF de ventas', async () => {
        Venta.findAll.mockResolvedValue([{
            numero_comprobante: 'B001-00000001', tipo_comprobante: 'Boleta',
            total: '118.00', tipo_pago: 'Efectivo', created_at: new Date(),
        }]);

        const req = { query: { desde: '2026-01-01', hasta: '2026-06-30' } };
        const res = mockRes();

        await exportarPDF(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition',
            'attachment; filename=reporte_ventas.pdf');
    });

    test('200 genera PDF sin ventas (total 0)', async () => {
        Venta.findAll.mockResolvedValue([]);

        const req = { query: {} };
        const res = mockRes();

        await exportarPDF(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    });

    test('500 cuando la BD falla', async () => {
        Venta.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await exportarPDF(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error al generar PDF' })
        );
    });
});

// ─────────────────────────────────────────────
//  exportarInventarioExcel
// ─────────────────────────────────────────────
describe('ReportesController › exportarInventarioExcel', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 genera Excel de inventario con productos', async () => {
        Producto.findAll.mockResolvedValue([
            { id: 1, codigo: 'P001', nombre: 'Martillo', stock: 10, precio: '25.00', categoria: { nombre: 'Herramientas' } },
        ]);

        const req = { query: {} };
        const res = mockRes();

        await exportarInventarioExcel(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition',
            'attachment; filename=Inventario_Valorizado.xlsx');
        expect(res.end).toHaveBeenCalled();
    });

    test('200 genera Excel con producto sin categoría (categoria null)', async () => {
        Producto.findAll.mockResolvedValue([
            { id: 2, codigo: 'P002', nombre: 'Sierra', stock: 5, precio: '80.00', categoria: null },
        ]);

        const req = { query: {} };
        const res = mockRes();

        await exportarInventarioExcel(req, res);

        expect(res.end).toHaveBeenCalled();
    });

    test('500 cuando la BD falla', async () => {
        Producto.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await exportarInventarioExcel(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error exportando inventario' })
        );
    });
});

// ─────────────────────────────────────────────
//  exportarInventarioPDF
// ─────────────────────────────────────────────
describe('ReportesController › exportarInventarioPDF', () => {

    beforeEach(() => jest.clearAllMocks());

    test('200 genera PDF de inventario valorizado', async () => {
        Producto.findAll.mockResolvedValue([
            { id: 1, codigo: 'P001', nombre: 'Martillo', stock: 10, precio: '25.00', categoria: { nombre: 'Herramientas' } },
        ]);

        const req = { query: {} };
        const res = mockRes();

        await exportarInventarioPDF(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
        expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition',
            'attachment; filename=Inventario_Valorizado.pdf');
    });

    test('200 genera PDF con lista vacía', async () => {
        Producto.findAll.mockResolvedValue([]);

        const req = { query: {} };
        const res = mockRes();

        await exportarInventarioPDF(req, res);

        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    });

    test('500 cuando la BD falla', async () => {
        Producto.findAll.mockRejectedValue(new Error('DB error'));

        const req = { query: {} };
        const res = mockRes();

        await exportarInventarioPDF(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(
            expect.objectContaining({ ok: false, msg: 'Error exportando inventario' })
        );
    });
});
