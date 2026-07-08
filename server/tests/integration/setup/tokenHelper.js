/**
 * tokenHelper.js
 * Genera tokens JWT firmados con el mismo secreto del .env
 * para usar en los headers Authorization de los tests de integración.
 */
require('dotenv').config();
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'ferreteria_super_secret_2024';

/**
 * @param {object} payload  Campos adicionales del usuario (id, nombre, email, rol)
 * @returns {string}        Token JWT sin el prefijo "Bearer"
 */
const generarToken = (payload = {}) => {
    const defaults = {
        id:     1,
        nombre: 'Test Admin',
        email:  'admin@test.com',
        rol:    'Administrador',
    };
    return jwt.sign({ ...defaults, ...payload }, SECRET, { expiresIn: '1h' });
};

module.exports = { generarToken };
