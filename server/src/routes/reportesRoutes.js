const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/reportesController');
const { verifyToken } = require('../middlewares/auth');

router.get('/ventas', verifyToken, ctrl.resumenVentas);
router.get('/productos-vendidos', verifyToken, ctrl.productosVendidos);
router.get('/exportar-excel', verifyToken, ctrl.exportarExcel);
router.get('/exportar-pdf', verifyToken, ctrl.exportarPDF);
router.get('/exportar-inventario-excel', verifyToken, ctrl.exportarInventarioExcel);
router.get('/exportar-inventario-pdf', verifyToken, ctrl.exportarInventarioPDF);

module.exports = router;
