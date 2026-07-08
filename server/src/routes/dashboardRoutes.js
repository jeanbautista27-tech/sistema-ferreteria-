const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { verifyToken } = require('../middlewares/auth');

router.get('/', verifyToken, ctrl.getDashboardStats);

module.exports = router;
