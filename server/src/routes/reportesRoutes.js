const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportesController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Solo Administrador accede a reportes financieros
const REPORTES = requireRole('Administrador');

router.get('/ventas',                  verifyToken, REPORTES, ctrl.resumenVentas);
router.get('/productos-vendidos',      verifyToken, REPORTES, ctrl.productosVendidos);
router.get('/exportar-excel',          verifyToken, REPORTES, ctrl.exportarExcel);
router.get('/exportar-pdf',            verifyToken, REPORTES, ctrl.exportarPDF);
router.get('/exportar-inventario-excel', verifyToken, REPORTES, ctrl.exportarInventarioExcel);
router.get('/exportar-inventario-pdf',   verifyToken, REPORTES, ctrl.exportarInventarioPDF);

module.exports = router;
