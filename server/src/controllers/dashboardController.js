const { Op, fn, col, literal } = require('sequelize');
const { Venta, DetalleVenta, Compra, Producto, Categoria, Cliente, Caja } = require('../models');
const sequelize = require('../config/db');

const getDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startOfThisWeek = new Date(today);
        startOfThisWeek.setDate(today.getDate() - 6); // Last 7 days
        startOfThisWeek.setHours(0, 0, 0, 0);

        // 1. Métricas Base (Tarjetas de estadísticas)
        const totalProductos = await Producto.count();
        const totalClientes = await Cliente.count();
        const ventasHoy = await Venta.count({ where: { estado: 'Completada', created_at: { [Op.gte]: startOfToday } } });
        const productosStockBajo = await Producto.findAll({ where: { stock: { [Op.lte]: col('stock_minimo') } }, limit: 5 });

        // Determinar si hay caja abierta real
        const cajaActiva = await Caja.findOne({ where: { estado: 'Abierta' } });

        // Ventas y Compras totales del día (Suma de montos)
        const ventasHoyTotalRaw = await Venta.findAll({
            where: { estado: 'Completada', created_at: { [Op.gte]: startOfToday } },
            attributes: [[fn('SUM', col('total')), 'total']]
        });
        const ventasHoyMonto = ventasHoyTotalRaw[0]?.getDataValue('total') || 0;

        // 2. Tendencia de Ventas (Últimos 7 días)
        const ventasUltimosDias = await Venta.findAll({
            where: { estado: 'Completada', created_at: { [Op.gte]: startOfThisWeek } },
            attributes: [
                [fn('DATE', col('created_at')), 'fecha'],
                [fn('SUM', col('total')), 'total_dia']
            ],
            group: [fn('DATE', col('created_at'))],
            order: [[fn('DATE', col('created_at')), 'ASC']]
        });

        // 3. Compras vs Ventas (Gráficos de barra por días)
        // Para hacer match con el diseño, enviaremos los acumulados de los últimos 6 días
        let fechasGrafico = [];
        let ventasData = [];
        let comprasData = [];

        for (let i = 5; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const diaStr = d.toISOString().split('T')[0];
            fechasGrafico.push(diaStr);

            // Buscar si vendió ese día
            const ventaDia = ventasUltimosDias.find(v => v.getDataValue('fecha') === diaStr);
            ventasData.push(ventaDia ? parseFloat(ventaDia.getDataValue('total_dia')) : 0);
        }

        // Recuperar compras de los mismos 6 días
        const refStartCompras = new Date(today); refStartCompras.setDate(today.getDate() - 5); refStartCompras.setHours(0, 0, 0, 0);
        const comprasUltimosDias = await Compra.findAll({
            where: { created_at: { [Op.gte]: refStartCompras } },
            attributes: [
                [fn('DATE', col('created_at')), 'fecha'],
                [fn('SUM', col('total')), 'total_dia']
            ],
            group: [fn('DATE', col('created_at'))]
        });

        for (let i = 0; i < 6; i++) {
            const cDia = comprasUltimosDias.find(c => c.getDataValue('fecha') === fechasGrafico[i]);
            comprasData.push(cDia ? parseFloat(cDia.getDataValue('total_dia')) : 0);
        }

        // 4. Ventas por Categoría (Barras 3D)
        const topCategorias = await DetalleVenta.findAll({
            attributes: [
                [col('producto.categoria.nombre'), 'categoria'],
                [fn('SUM', col('DetalleVenta.subtotal')), 'total_vendido']
            ],
            include: [
                { model: Producto, as: 'producto', attributes: [], include: [{ model: Categoria, as: 'categoria', attributes: [] }] },
                { model: Venta, attributes: [], where: { estado: 'Completada' } }
            ],
            group: ['producto.categoria.id', 'producto.categoria.nombre'],
            order: [[literal('total_vendido'), 'DESC']],
            limit: 5,
            raw: true
        });

        // 5. Últimas ventas (Tickets recientes)
        const ultimasVentas = await Venta.findAll({
            where: { estado: 'Completada' },
            include: [{ model: Cliente, as: 'cliente', attributes: ['nombre'] }],
            order: [['created_at', 'DESC']],
            limit: 5
        });

        // Sumatorias parciales para la distribución global (Dona)
        const totalVentasGlobalRaw = await Venta.findAll({ where: { estado: 'Completada' }, attributes: [[fn('SUM', col('total')), 'total']] });
        const totalComprasGlobalRaw = await Compra.findAll({ attributes: [[fn('SUM', col('total')), 'total']] });
        const globalVenta = parseFloat(totalVentasGlobalRaw[0]?.getDataValue('total') || 0);
        const globalCompra = parseFloat(totalComprasGlobalRaw[0]?.getDataValue('total') || 0);
        const margenInfo = Math.max(0, globalVenta - globalCompra);

        res.json({
            ok: true,
            kpis: {
                totalProductos,
                totalClientes,
                ventasHoy,
                ventasHoyMonto,
                cajaAbierta: !!cajaActiva
            },
            stockCritico: productosStockBajo, // [{nombre, stock, stock_minimo}]
            tendenciaVentas: { // Para el line chart
                fechas: ventasUltimosDias.map(v => v.getDataValue('fecha')),
                totales: ventasUltimosDias.map(v => parseFloat(v.getDataValue('total_dia')))
            },
            comparativa6Dias: { // Para las barras verdes y amarillas
                fechas: fechasGrafico,
                ventas: ventasData,
                compras: comprasData
            },
            ventasPorCategoria: topCategorias, // Para barras 3D
            ultimasVentas: ultimasVentas,
            distribucion: {
                ventas: globalVenta,
                compras: globalCompra,
                margen: margenInfo
            }
        });

    } catch (error) {
        res.status(500).json({ ok: false, msg: 'Error al generar dashboard stats', error: error.message });
    }
};

module.exports = { getDashboardStats };
