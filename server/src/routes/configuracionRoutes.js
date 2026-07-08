const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/configuracionController');
const { verifyToken } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../../uploads')),
    filename: (req, file, cb) => cb(null, `logo_${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.get('/', verifyToken, ctrl.getAll);
router.put('/', verifyToken, upload.single('logo'), ctrl.update);

module.exports = router;
