require('dotenv').config();
const express    = require('express');
const cors       = require('cors');
const helmet     = require('helmet');
const compression = require('compression');
const rateLimit  = require('express-rate-limit');
const path       = require('path');
const fs         = require('fs');
const sequelize  = require('./config/db');
require('./models'); // setup associations

const app  = express();
const isProd = process.env.NODE_ENV === 'production';

// ── Seguridad: cabeceras HTTP seguras ─────────────────────────
app.use(helmet());

// ── Compresión de respuestas ──────────────────────────────────
app.use(compression());

// ── CORS dinámico ─────────────────────────────────────────────
// En producción usa FRONTEND_URL del .env; en desarrollo permite localhost:5173
const allowedOrigins = isProd
    ? [process.env.FRONTEND_URL].filter(Boolean)
    : ['http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // Permitir peticiones sin origin (Postman, curl, server-to-server)
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        callback(new Error(`CORS: origen no permitido → ${origin}`));
    },
    credentials: true,
}));

// ── Rate limiting: protección contra fuerza bruta en login ────
const loginLimiter = rateLimit({
    windowMs:         15 * 60 * 1000,                              // 15 minutos
    max:              parseInt(process.env.LOGIN_RATE_LIMIT_MAX) || 10,
    standardHeaders:  true,
    legacyHeaders:    false,
    message: { ok: false, msg: 'Demasiados intentos. Intenta de nuevo en 15 minutos.' },
});

// ── Body parsers ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Uploads dir ──────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// ── API Routes ────────────────────────────────────────────────
app.use('/api/auth',          loginLimiter, require('./routes/authRoutes'));
app.use('/api/categorias',    require('./routes/categoriasRoutes'));
app.use('/api/proveedores',   require('./routes/proveedoresRoutes'));
app.use('/api/productos',     require('./routes/productosRoutes'));
app.use('/api/clientes',      require('./routes/clientesRoutes'));
app.use('/api/ventas',        require('./routes/ventasRoutes'));
app.use('/api/cotizaciones',  require('./routes/cotizacionesRoutes'));
app.use('/api/cuentas-cobrar',require('./routes/cuentasCobrarRoutes'));
app.use('/api/cuentas-pagar', require('./routes/cuentasPagarRoutes'));
app.use('/api/devoluciones',  require('./routes/devolucionesRoutes'));
app.use('/api/compras',       require('./routes/comprasRoutes'));
app.use('/api/caja',          require('./routes/cajaRoutes'));
app.use('/api/inventario',    require('./routes/inventarioRoutes'));
app.use('/api/reportes',      require('./routes/reportesRoutes'));
app.use('/api/usuarios',      require('./routes/usuariosRoutes'));
app.use('/api/configuracion', require('./routes/configuracionRoutes'));
app.use('/api/logs',          require('./routes/logRoutes'));
app.use('/api/dashboard',     require('./routes/dashboardRoutes'));
app.use('/api/mantenimiento', require('./routes/mantenimientoRoutes'));

// ── Health check ──────────────────────────────────────────────
app.get('/api/health', (_req, res) =>
    res.json({ ok: true, msg: 'Sistema Ferretería activo', env: process.env.NODE_ENV })
);

// ── Manejador global de errores ───────────────────────────────
// En producción NO se expone el stack trace al cliente
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        ok:    false,
        msg:   isProd ? 'Error interno del servidor' : err.message,
        ...(isProd ? {} : { stack: err.stack }),
    });
});

// ── Arranque ──────────────────────────────────────────────────
const PORT = process.env.PORT || 3002;

sequelize.authenticate()
    .then(() => {
        console.log('✅ Conexión a BD exitosa');
        app.listen(PORT, () =>
            console.log(`🔧 Servidor Ferretería corriendo en http://localhost:${PORT} [${process.env.NODE_ENV || 'development'}]`)
        );
    })
    .catch(err => {
        console.error('❌ Error de conexión a BD:', err.message);
        process.exit(1);
    });
