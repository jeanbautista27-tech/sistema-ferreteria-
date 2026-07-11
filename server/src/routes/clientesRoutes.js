const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/clientesController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Lectura: Cajero necesita buscar clientes en el POS
// Escritura: solo Administrador
const ESCRITURA = requireRole('Administrador');

router.get('/',      verifyToken, ctrl.getAll);
router.post('/',     verifyToken, ESCRITURA, ctrl.create);
router.put('/:id',   verifyToken, ESCRITURA, ctrl.update);
router.delete('/:id',verifyToken, ESCRITURA, ctrl.remove);

module.exports = router;
