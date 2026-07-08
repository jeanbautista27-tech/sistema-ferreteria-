require('dotenv').config();
const { Sequelize } = require('sequelize');

// Railway inyecta MYSQLPORT con un valor distinto al 3306 estándar.
// DB_PORT permite sobrescribirlo desde las variables de entorno del servicio.
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host:    process.env.DB_HOST,
        port:    parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
        dialect: 'mysql',
        logging: false,
        timezone: '-05:00',
        pool: { max: 10, min: 0, acquire: 30000, idle: 10000 },
        dialectOptions: {
            // Necesario cuando Railway usa SSL en la conexión MySQL
            ssl: process.env.DB_SSL === 'true'
                ? { rejectUnauthorized: false }
                : false,
        },
    }
);

module.exports = sequelize;
