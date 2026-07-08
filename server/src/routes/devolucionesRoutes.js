const express = require('express');
const router = express.Router();
const devolucionesController = require('../controllers/devolucionesController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, devolucionesController.getAll);
router.get('/:id', verifyToken, devolucionesController.getOne);
router.post('/', verifyToken, devolucionesController.create);

module.exports = router;
