const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/comprasController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Almacenero y Administrador gestionan compras
const COMPRAS = requireRole('Administrador', 'Almacenero');

router.get('/',              verifyToken, COMPRAS, ctrl.getAll);
router.get('/:id',           verifyToken, COMPRAS, ctrl.getOne);
router.post('/',             verifyToken, COMPRAS, ctrl.create);
router.put('/:id/recibir',   verifyToken, COMPRAS, ctrl.recibirCompra);

module.exports = router;
