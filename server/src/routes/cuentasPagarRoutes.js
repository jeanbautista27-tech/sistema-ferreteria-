const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cuentasPagarController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Administrador gestiona cuentas por pagar (pagos a proveedores)
const CXP = requireRole('Administrador');

router.get('/',            verifyToken, CXP, ctrl.listar);
router.get('/:id',         verifyToken, CXP, ctrl.detalle);
router.post('/:id/abonos', verifyToken, CXP, ctrl.registrarAbono);

module.exports = router;
