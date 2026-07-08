const express = require('express');
const router = express.Router();
const cuentasPagarController = require('../controllers/cuentasPagarController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, cuentasPagarController.listar);
router.get('/:id', verifyToken, cuentasPagarController.detalle);
router.post('/:id/abonos', verifyToken, cuentasPagarController.registrarAbono);

module.exports = router;
