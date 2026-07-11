const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventarioController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Almacenero y Administrador gestionan inventario
const INVENTARIO = requireRole('Administrador', 'Almacenero');

router.get('/stock',       verifyToken, INVENTARIO, ctrl.getStock);
router.get('/movimientos', verifyToken, INVENTARIO, ctrl.getMovimientos);
router.post('/ajustar',    verifyToken, INVENTARIO, ctrl.ajustarStock);

module.exports = router;
