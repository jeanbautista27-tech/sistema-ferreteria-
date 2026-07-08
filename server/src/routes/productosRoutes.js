const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productosController');
const { verifyToken } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
    filename: (req, file, cb) => cb(null, `prod_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', verifyToken, ctrl.getAll);
router.get('/:id', verifyToken, ctrl.getOne);
router.post('/', verifyToken, upload.single('imagen'), ctrl.create);
router.put('/:id', verifyToken, upload.single('imagen'), ctrl.update);
router.delete('/:id', verifyToken, ctrl.remove);

module.exports = router;
