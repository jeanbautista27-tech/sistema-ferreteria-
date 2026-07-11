const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productosController');
const { verifyToken, requireRole } = require('../middlewares/auth');
const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
    filename:    (req, file, cb) => cb(null, `prod_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

// Lectura: todos los autenticados (Cajero necesita ver productos en POS)
// Escritura: Almacenero y Administrador
const ESCRITURA = requireRole('Administrador', 'Almacenero');

router.get('/',     verifyToken, ctrl.getAll);
router.get('/:id',  verifyToken, ctrl.getOne);
router.post('/',    verifyToken, ESCRITURA, upload.single('imagen'), ctrl.create);
router.put('/:id',  verifyToken, ESCRITURA, upload.single('imagen'), ctrl.update);
router.delete('/:id', verifyToken, ESCRITURA, ctrl.remove);

module.exports = router;
