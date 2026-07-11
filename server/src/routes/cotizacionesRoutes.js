const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cotizacionesController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Cajero y Administrador gestionan cotizaciones
const COTIZACIONES = requireRole('Administrador', 'Cajero');

router.get('/',           verifyToken, COTIZACIONES, ctrl.getAll);
router.get('/:id',        verifyToken, COTIZACIONES, ctrl.getOne);
router.post('/',          verifyToken, COTIZACIONES, ctrl.create);
router.put('/:id/anular', verifyToken, COTIZACIONES, ctrl.anular);

module.exports = router;
