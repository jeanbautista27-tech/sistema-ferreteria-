const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cuentasCobrarController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Cajero y Administrador gestionan cuentas por cobrar
const CXC = requireRole('Administrador', 'Cajero');

router.get('/',             verifyToken, CXC, ctrl.listar);
router.get('/:id',          verifyToken, CXC, ctrl.detalle);
router.post('/:id/abonos',  verifyToken, CXC, ctrl.registrarAbono);

module.exports = router;
