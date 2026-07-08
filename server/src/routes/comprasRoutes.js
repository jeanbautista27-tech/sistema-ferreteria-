const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/comprasController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, ctrl.getAll);
router.get('/:id', verifyToken, ctrl.getOne);
router.post('/', verifyToken, ctrl.create);
router.put('/:id/recibir', verifyToken, ctrl.recibirCompra);

module.exports = router;
