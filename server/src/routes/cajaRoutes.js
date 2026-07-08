const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cajaController');
const { verifyToken } = require('../middlewares/auth');

router.get('/actual', verifyToken, ctrl.getCajaActual);
router.get('/historial', verifyToken, ctrl.getHistorial);
router.post('/abrir', verifyToken, ctrl.abrir);
router.put('/:id/cerrar', verifyToken, ctrl.cerrar);
router.post('/movimiento', verifyToken, ctrl.registrarMovimiento);

module.exports = router;
