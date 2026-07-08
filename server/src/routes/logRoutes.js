const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/logController');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

router.get('/', verifyToken, requireAdmin, ctrl.getAll);

module.exports = router;
