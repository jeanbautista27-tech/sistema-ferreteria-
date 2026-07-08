const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/inventarioController');
const { verifyToken } = require('../middlewares/auth');

router.get('/stock', verifyToken, ctrl.getStock);
router.get('/movimientos', verifyToken, ctrl.getMovimientos);
router.post('/ajustar', verifyToken, ctrl.ajustarStock);

module.exports = router;
