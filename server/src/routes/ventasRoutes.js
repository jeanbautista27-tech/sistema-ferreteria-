const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/ventasController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Cajero y Administrador operan ventas
const VENTAS = requireRole('Administrador', 'Cajero');

router.get('/',          verifyToken, VENTAS, ctrl.getAll);
router.get('/:id',       verifyToken, VENTAS, ctrl.getOne);
router.post('/',         verifyToken, VENTAS, ctrl.create);
router.put('/:id/anular',verifyToken, VENTAS, ctrl.anular);

module.exports = router;
