const { Op, fn, col, literal } = require('sequelize');
const { Venta, DetalleVenta, Producto, Categoria, Compra, Caja, Proveedor, Cliente, CuentaCobrar, CuentaPagar } = require('../models');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

const resumenVentas = async (req, res) => {
    try {
        const { desde, hasta } = req.query;
        const where = { estado: 'Completada' };
        if (desde && hasta) where.created_at = { [Op.between]: [new Date(desde), new Date(hasta + ' 23:59:59')] };

        const ventas = await Venta.findAll({ where });
        const totalVentas = ventas.reduce((a, v) => a + parseFloat(v.total), 0);
        const totalIgv = ventas.reduce((a, v) => a + parseFloat(v.igv), 0);

        res.json({ ok: true, total_ventas: totalVentas, total_igv: totalIgv, cantidad_ventas: ventas.length });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

const productosVendidos = async (req, res) => {
    try {
        const { desde, hasta } = req.query;
        const where = {};
        if (desde && hasta) where['$venta.created_at$'] = { [Op.between]: [new Date(desde), new Date(hasta + ' 23:59:59')] };

        const detalles = await DetalleVenta.findAll({
            attributes: ['producto_id', [fn('SUM', col('cantidad')), 'total_cantidad'], [fn('SUM', col('subtotal')), 'total_subtotal']],
            include: [
                { model: Producto, as: 'producto', attributes: ['nombre', 'codigo'] },
                { model: Venta, attributes: [], where: { estado: 'Completada', ...(desde && hasta ? { created_at: { [Op.between]: [new Date(desde), new Date(hasta + ' 23:59:59')] } } : {}) } }
            ],
            group: ['producto_id'],
            order: [[literal('total_cantidad'), 'DESC']],
            limit: 20
        });
        res.json({ ok: true, detalles });
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error', error: err.message });
    }
};

const exportarExcel = async (req, res) => {
    try {
        const { desde, hasta } = req.query;
        const whereFechas = {};
        if (desde && hasta) whereFechas.created_at = { [Op.between]: [new Date(desde), new Date(hasta + ' 23:59:59')] };

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Ferretería Sistema';
        const estilosCabecera = {
            font: { bold: true, color: { argb: 'FFFFFFFF' } },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }, // Azul profesional
            border: { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } },
            alignment: { vertical: 'middle', horizontal: 'center' }
        };

        // ============================================
        // HOJA 1: VENTAS (INGRESOS)
        // ============================================
        const ventas = await Venta.findAll({ where: { estado: 'Completada', ...whereFechas }, include: [{ model: Cliente, as: 'cliente' }], order: [['created_at', 'DESC']] });
        const sheetVentas = workbook.addWorksheet('1. Ingresos (Ventas)');
        sheetVentas.columns = [
            { header: 'Fecha Emisión', key: 'fecha', width: 20 },
            { header: 'N° Comprobante', key: 'numero', width: 18 },
            { header: 'Cliente', key: 'cliente', width: 30 },
            { header: 'Tipo Pago', key: 'pago', width: 15 },
            { header: 'Subtotal', key: 'subtotal', width: 12, style: { numFmt: '"S/"#,##0.00' } },
            { header: 'IGV', key: 'igv', width: 12, style: { numFmt: '"S/"#,##0.00' } },
            { header: 'Total Real', key: 'total', width: 14, style: { numFmt: '"S/"#,##0.00' } },
            { header: 'Estado', key: 'estado', width: 12 }
        ];
        sheetVentas.getRow(1).eachCell(c => { Object.assign(c, estilosCabecera); });

        let totalCajaVentas = 0;
        ventas.forEach(v => {
            if (v.tipo_pago !== 'Crédito') totalCajaVentas += parseFloat(v.total);
            sheetVentas.addRow({
                fecha: new Date(v.created_at).toLocaleString('es-PE'), numero: v.numero_comprobante,
                cliente: v.cliente ? v.cliente.nombre : 'Público General', pago: v.tipo_pago,
                subtotal: parseFloat(v.subtotal), igv: parseFloat(v.igv), total: parseFloat(v.total), estado: v.estado
            });
        });
        sheetVentas.autoFilter = 'A1:H1';

        // Fila de totales
        const tfVentas = sheetVentas.addRow(['', '', '', 'TOTAL CAJA REAL:', '', '', totalCajaVentas, '']);
        tfVentas.font = { bold: true, color: { argb: 'FF16A34A' } }; // Verde

        // ============================================
        // HOJA 2: COMPRAS (EGRESOS)
        // ============================================
        const compras = await Compra.findAll({ where: { ...whereFechas }, include: [{ model: Proveedor, as: 'proveedor' }], order: [['created_at', 'DESC']] });
        const sheetCompras = workbook.addWorksheet('2. Egresos (Compras)');
        sheetCompras.columns = [
            { header: 'Fecha Emisión', key: 'fecha', width: 20 },
            { header: 'O/C N°', key: 'numero', width: 18 },
            { header: 'Proveedor', key: 'proveedor', width: 30 },
            { header: 'Tipo Pago', key: 'pago', width: 15 },
            { header: 'Total Emisión', key: 'total', width: 14, style: { numFmt: '"S/"#,##0.00' } },
            { header: 'Estado', key: 'estado', width: 14 }
        ];
        sheetCompras.getRow(1).eachCell(c => { Object.assign(c, estilosCabecera); c.fill.fgColor.argb = 'FFDC2626'; }); // Rojo para egresos

        let egresoTotalContado = 0;
        compras.forEach(c => {
            if (c.tipo_pago !== 'Crédito' && c.estado !== 'Anulada') egresoTotalContado += parseFloat(c.total);
            sheetCompras.addRow({
                fecha: new Date(c.created_at).toLocaleString('es-PE'), numero: c.numero_orden,
                proveedor: c.proveedor ? c.proveedor.empresa : 'N/A', pago: c.tipo_pago,
                total: parseFloat(c.total), estado: c.estado
            });
        });
        sheetCompras.autoFilter = 'A1:F1';
        const tfCompras = sheetCompras.addRow(['', '', '', 'TOTAL SALIDO CAJA:', egresoTotalContado, '']);
        tfCompras.font = { bold: true, color: { argb: 'FFDC2626' } };

        // ============================================
        // HOJA 3: CUENTAS POR COBRAR (DEUDORES)
        // ============================================
        const cxpCobrar = await CuentaCobrar.findAll({ include: [{ model: Cliente, as: 'cliente' }, { model: Venta, as: 'venta' }], order: [['created_at', 'DESC']] });
        const sheetCxc = workbook.addWorksheet('3. Activos (CxC)');
        sheetCxc.columns = [
            { header: 'Cliente Deudor', key: 'cliente', width: 32 },
            { header: 'Venta Vinculada', key: 'venta', width: 18 },
            { header: 'Total Facturado', key: 'total', width: 15, style: { numFmt: '"S/"#,##0.00' } },
            { header: 'Abonado', key: 'pagado', width: 15, style: { numFmt: '"S/"#,##0.00' } },
            { header: 'Riesgo / Deuda Actual', key: 'deuda', width: 18, style: { numFmt: '"S/"#,##0.00' } },
            { header: 'Estado', key: 'estado', width: 14 }
        ];
        sheetCxc.getRow(1).eachCell(c => { Object.assign(c, estilosCabecera); c.fill.fgColor.argb = 'FFD97706'; }); // Naranja (Activos Pendientes)

        let totalCarteraCobrar = 0;
        cxpCobrar.forEach(c => {
            if (c.estado === 'Pendiente') totalCarteraCobrar += parseFloat(c.saldo_pendiente);
            sheetCxc.addRow({
                cliente: c.cliente ? c.cliente.nombre : 'N/A', venta: c.venta ? c.venta.numero_comprobante : '-',
                total: parseFloat(c.monto_total), pagado: parseFloat(c.saldo_pagado), deuda: parseFloat(c.saldo_pendiente), estado: c.estado
            });
        });
        sheetCxc.autoFilter = 'A1:F1';
        const tfCxc = sheetCxc.addRow(['', '', '', 'DEUDA PENDIENTE POR RECOLECTAR:', totalCarteraCobrar, '']);
        tfCxc.font = { bold: true, color: { argb: 'FFD97706' } };

        // ============================================
        // HOJA 4: CUENTAS POR PAGAR (PASIVOS)
        // ============================================
        const cxPagar = await CuentaPagar.findAll({ include: [{ model: Proveedor, as: 'proveedor' }, { model: Compra, as: 'compra' }], order: [['created_at', 'DESC']] });
        const sheetCxp = workbook.addWorksheet('4. Pasivos (CxP)');
        sheetCxp.columns = [
            { header: 'Proveedor (Acreedor)', key: 'proveedor', width: 32 },
            { header: 'O/C Vinculada', key: 'compra', width: 18 },
            { header: 'Total O/C', key: 'total', width: 15, style: { numFmt: '"S/"#,##0.00' } },
            { header: 'Abonado', key: 'pagado', width: 15, style: { numFmt: '"S/"#,##0.00' } },
            { header: 'Deuda por Pagar', key: 'deuda', width: 18, style: { numFmt: '"S/"#,##0.00' } },
            { header: 'Estado', key: 'estado', width: 14 }
        ];
        sheetCxp.getRow(1).eachCell(c => { Object.assign(c, estilosCabecera); c.fill.fgColor.argb = 'FF7C3AED'; }); // Morado (Pasivos)

        let totalCarteraPagar = 0;
        cxPagar.forEach(c => {
            if (c.estado === 'Pendiente') totalCarteraPagar += parseFloat(c.saldo_pendiente);
            sheetCxp.addRow({
                proveedor: c.proveedor ? c.proveedor.empresa : 'N/A', compra: c.compra ? c.compra.numero_orden : '-',
                total: parseFloat(c.monto_total), pagado: parseFloat(c.saldo_pagado), deuda: parseFloat(c.saldo_pendiente), estado: c.estado
            });
        });
        sheetCxp.autoFilter = 'A1:F1';
        const tfCxp = sheetCxp.addRow(['', '', '', 'TOTAL QUE SE DEBE AL EXTERIOR:', totalCarteraPagar, '']);
        tfCxp.font = { bold: true, color: { argb: 'FF7C3AED' } };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Reporte_Consolidado_Financiero.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al exportar consolidado', error: err.message });
    }
};

const exportarPDF = async (req, res) => {
    try {
        const { desde, hasta } = req.query;
        const where = { estado: 'Completada' };
        if (desde && hasta) where.created_at = { [Op.between]: [new Date(desde), new Date(hasta + ' 23:59:59')] };
        const ventas = await Venta.findAll({ where, order: [['created_at', 'DESC']] });
        const total = ventas.reduce((a, v) => a + parseFloat(v.total), 0);

        const doc = new PDFDocument({ margin: 40 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=reporte_ventas.pdf');
        doc.pipe(res);

        doc.fontSize(18).font('Helvetica-Bold').text('REPORTE DE VENTAS', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').text(`Período: ${desde || '—'} al ${hasta || '—'}`, { align: 'center' });
        doc.moveDown(1);

        const headers = ['Comprobante', 'Tipo', 'Total', 'Pago', 'Fecha'];
        const colWidths = [130, 70, 70, 70, 130];
        let x = 40;
        doc.font('Helvetica-Bold').fontSize(10);
        headers.forEach((h, i) => { doc.text(h, x, doc.y, { width: colWidths[i], continued: true }); x += colWidths[i]; });
        doc.moveDown(0.5);
        doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.2);

        doc.font('Helvetica').fontSize(9);
        ventas.slice(0, 50).forEach(v => {
            let xRow = 40;
            const y = doc.y;
            const row = [v.numero_comprobante, v.tipo_comprobante, `S/ ${parseFloat(v.total).toFixed(2)}`, v.tipo_pago, new Date(v.created_at).toLocaleDateString('es-PE')];
            row.forEach((cell, i) => { doc.text(cell, xRow, y, { width: colWidths[i] }); xRow += colWidths[i]; });
            doc.moveDown(0.4);
        });

        doc.moveDown(1);
        doc.font('Helvetica-Bold').fontSize(12).text(`TOTAL: S/ ${total.toFixed(2)}`, { align: 'right' });
        doc.end();
    } catch (err) {
        res.status(500).json({ ok: false, msg: 'Error al generar PDF', error: err.message });
    }
};

const exportarInventarioExcel = async (req, res) => {
    try {
        const productos = await Producto.findAll({ include: [{ model: Categoria, as: 'categoria' }], order: [['nombre', 'ASC']] });
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Ferretería Sistema';
        const sheet = workbook.addWorksheet('Inventario Valorizado');

        sheet.columns = [
            { header: 'Código', key: 'codigo', width: 15 },
            { header: 'Producto', key: 'nombre', width: 35 },
            { header: 'Categoría', key: 'categoria', width: 20 },
            { header: 'Stock Físico', key: 'stock', width: 14, style: { alignment: { horizontal: 'center' } } },
            { header: 'Precio Unidad', key: 'precio', width: 15, style: { numFmt: '"S/"#,##0.00' } },
            { header: 'Valorización Total', key: 'valor', width: 18, style: { numFmt: '"S/"#,##0.00' } }
        ];

        sheet.getRow(1).eachCell(c => {
            c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF059669' } }; // Verde esmeralda
            c.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        let capitalTotal = 0;
        let itemsTotal = 0;
        productos.forEach(p => {
            const val = p.stock * parseFloat(p.precio);
            capitalTotal += val;
            itemsTotal += p.stock;
            sheet.addRow({
                codigo: p.codigo, nombre: p.nombre, categoria: p.categoria ? p.categoria.nombre : '-',
                stock: p.stock, precio: parseFloat(p.precio), valor: val
            });
        });
        sheet.autoFilter = 'A1:F1';

        const filaTotal = sheet.addRow(['', '', 'TOTAL ALMACÉN:', itemsTotal, '', capitalTotal]);
        filaTotal.font = { bold: true };

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=Inventario_Valorizado.xlsx');
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error exportando inventario', error: error.message });
    }
};

const exportarInventarioPDF = async (req, res) => {
    try {
        const productos = await Producto.findAll({ include: [{ model: Categoria, as: 'categoria' }], order: [['nombre', 'ASC']] });

        const doc = new PDFDocument({ margin: 40 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=Inventario_Valorizado.pdf');
        doc.pipe(res);

        doc.fontSize(18).font('Helvetica-Bold').text('INVENTARIO VALORIZADO', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica').text(`Generado el: ${new Date().toLocaleString('es-PE')}`, { align: 'center' });
        doc.moveDown(1.5);

        const colWidths = [80, 200, 70, 70, 90];
        const headers = ['Código', 'Producto', 'Stock', 'Precio (S/)', 'Total (S/)'];

        // Cabecera de Tabla
        let x = 40;
        doc.font('Helvetica-Bold').fontSize(10);
        headers.forEach((h, i) => { doc.text(h, x, doc.y, { width: colWidths[i] }); x += colWidths[i]; });
        doc.moveDown(0.5);
        doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);

        let capitalTotal = 0;
        doc.font('Helvetica').fontSize(9);

        productos.forEach(p => {
            // Control de salto de página
            if (doc.y > 700) {
                doc.addPage();
                doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown(0.5);
            }

            const val = p.stock * parseFloat(p.precio);
            capitalTotal += val;

            let xRow = 40;
            const y = doc.y;
            const row = [p.codigo || '-', p.nombre, p.stock.toString(), parseFloat(p.precio).toFixed(2), val.toFixed(2)];

            row.forEach((cell, i) => { doc.text(cell, xRow, y, { width: colWidths[i] }); xRow += colWidths[i]; });
            doc.moveDown(0.4);
        });

        doc.moveDown(1);
        doc.moveTo(40, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').fontSize(12).text(`VALOR TOTAL ALMACÉN: S/ ${capitalTotal.toFixed(2)}`, { align: 'right' });

        doc.end();
    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error exportando inventario', error: error.message });
    }
};

module.exports = { resumenVentas, productosVendidos, exportarExcel, exportarPDF, exportarInventarioExcel, exportarInventarioPDF };
