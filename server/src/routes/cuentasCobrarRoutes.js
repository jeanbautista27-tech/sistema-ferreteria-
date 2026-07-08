const express = require('express');
const router = express.Router();
const cuentasCobrarController = require('../controllers/cuentasCobrarController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, cuentasCobrarController.listar);
router.get('/:id', verifyToken, cuentasCobrarController.detalle);
router.post('/:id/abonos', verifyToken, cuentasCobrarController.registrarAbono);

module.exports = router;
