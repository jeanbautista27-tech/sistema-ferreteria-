const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cajaController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Cajero y Administrador operan la caja
const CAJA = requireRole('Administrador', 'Cajero');

router.get('/actual',       verifyToken, CAJA, ctrl.getCajaActual);
router.get('/historial',    verifyToken, CAJA, ctrl.getHistorial);
router.post('/abrir',       verifyToken, CAJA, ctrl.abrir);
router.put('/:id/cerrar',   verifyToken, CAJA, ctrl.cerrar);
router.post('/movimiento',  verifyToken, CAJA, ctrl.registrarMovimiento);

module.exports = router;
