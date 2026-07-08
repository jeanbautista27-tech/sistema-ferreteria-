const router = require('express').Router();
const ctrl = require('../controllers/mantenimientoController');
const { verifyToken, requireAdmin } = require('../middlewares/auth');

// Solo administrador puede usar el módulo de mantenimiento
router.use(verifyToken, requireAdmin);

router.get('/estado', ctrl.estadoSistema);
router.get('/backup', ctrl.crearBackup);
router.get('/listar-backups', ctrl.listarBackups);
router.post('/restaurar', ctrl.uploadMiddleware, ctrl.restaurarBackup);
router.post('/restablecer', ctrl.restablecerSistema);

module.exports = router;
