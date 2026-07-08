const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/proveedoresController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, ctrl.getAll);
router.post('/', verifyToken, ctrl.create);
router.put('/:id', verifyToken, ctrl.update);
router.delete('/:id', verifyToken, ctrl.remove);

module.exports = router;
