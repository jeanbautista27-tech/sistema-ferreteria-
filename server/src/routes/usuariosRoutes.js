const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/usuariosController');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

router.get('/', verifyToken, ctrl.getAll);
router.get('/roles', verifyToken, ctrl.getRoles);
router.post('/', verifyToken, requireAdmin, ctrl.create);
router.put('/:id', verifyToken, requireAdmin, ctrl.update);
router.delete('/:id', verifyToken, requireAdmin, ctrl.remove);

module.exports = router;
