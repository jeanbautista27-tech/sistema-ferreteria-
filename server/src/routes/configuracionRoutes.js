const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/configuracionController');
const { verifyToken, requireRole } = require('../middlewares/auth');
const multer = require('multer');
const path   = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
    filename:    (req, file, cb) => cb(null, `logo_${Date.now()}${path.extname(file.originalname)}`),
});
const upload = multer({ storage });

// Lectura: todos (Sidebar carga el nombre/logo de la empresa)
// Escritura: solo Administrador
router.get('/',  verifyToken, ctrl.getAll);
router.put('/',  verifyToken, requireRole('Administrador'), upload.single('logo'), ctrl.update);

module.exports = router;
