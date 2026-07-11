const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/comprasController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Administrador negocia y registra las órdenes de compra
// Almacenero recibe la mercancía y actualiza el stock
router.get('/',            verifyToken, requireRole('Administrador', 'Almacenero'), ctrl.getAll);
router.get('/:id',         verifyToken, requireRole('Administrador', 'Almacenero'), ctrl.getOne);
router.post('/',           verifyToken, requireRole('Administrador'),               ctrl.create);
router.put('/:id/recibir', verifyToken, requireRole('Administrador', 'Almacenero'), ctrl.recibirCompra);

module.exports = router;
