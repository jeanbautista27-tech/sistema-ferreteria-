const express = require('express');
const router = express.Router();
const cotizacionesController = require('../controllers/cotizacionesController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, cotizacionesController.getAll);
router.get('/:id', verifyToken, cotizacionesController.getOne);
router.post('/', verifyToken, cotizacionesController.create);
router.put('/:id/anular', verifyToken, cotizacionesController.anular);

module.exports = router;
