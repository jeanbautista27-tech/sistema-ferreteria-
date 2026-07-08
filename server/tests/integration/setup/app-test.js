/**
 * app-test.js
 * Instancia Express idéntica a app.js pero SIN sequelize.authenticate()
 * ni app.listen() — lista para supertest.
 */
require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',         require('../../../src/routes/authRoutes'));
app.use('/api/productos',    require('../../../src/routes/productosRoutes'));
app.use('/api/ventas',       require('../../../src/routes/ventasRoutes'));
app.use('/api/compras',      require('../../../src/routes/comprasRoutes'));
app.use('/api/clientes',     require('../../../src/routes/clientesRoutes'));
app.use('/api/caja',         require('../../../src/routes/cajaRoutes'));
app.use('/api/inventario',   require('../../../src/routes/inventarioRoutes'));
app.use('/api/devoluciones', require('../../../src/routes/devolucionesRoutes'));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

module.exports = app;
