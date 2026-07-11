const express = require('express');
const router = express.Router();
const devolucionesController = require('../controllers/devolucionesController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Cajero y Administrador gestionan devoluciones
const DEVOLUCIONES = requireRole('Administrador', 'Cajero');

router.get('/',    verifyToken, DEVOLUCIONES, devolucionesController.getAll);
router.get('/:id', verifyToken, DEVOLUCIONES, devolucionesController.getOne);
router.post('/',   verifyToken, DEVOLUCIONES, devolucionesController.create);

module.exports = router;
