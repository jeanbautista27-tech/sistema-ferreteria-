const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/proveedoresController');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Lectura: todos (Almacenero los necesita al crear compras)
// Escritura: Almacenero y Administrador
const ESCRITURA = requireRole('Administrador', 'Almacenero');

router.get('/',       verifyToken, ctrl.getAll);
router.post('/',      verifyToken, ESCRITURA, ctrl.create);
router.put('/:id',    verifyToken, ESCRITURA, ctrl.update);
router.delete('/:id', verifyToken, ESCRITURA, ctrl.remove);

module.exports = router;
