/**
 * ecosystem.config.js — Configuración de PM2 para producción
 *
 * Uso:
 *   pm2 start ecosystem.config.js          # Iniciar
 *   pm2 stop ferreteria-api                # Detener
 *   pm2 restart ferreteria-api             # Reiniciar
 *   pm2 logs ferreteria-api                # Ver logs
 *   pm2 save && pm2 startup                # Persistir al reiniciar el servidor
 */
module.exports = {
    apps: [
        {
            name:             'ferreteria-api',
            script:           'src/app.js',
            instances:        'max',        // Un proceso por núcleo de CPU
            exec_mode:        'cluster',    // Modo cluster para máximo rendimiento
            watch:            false,        // No recargar en cambios (solo desarrollo)
            max_memory_restart: '500M',     // Reiniciar si supera 500 MB de RAM

            // Variables de entorno para producción
            env_production: {
                NODE_ENV: 'production',
                PORT:     3002,
            },

            // Variables de entorno para desarrollo
            env_development: {
                NODE_ENV: 'development',
                PORT:     3002,
            },

            // Logs
            out_file:   './logs/pm2-out.log',
            error_file: './logs/pm2-error.log',
            log_date_format: 'YYYY-MM-DD HH:mm:ss',

            // Política de reinicio
            autorestart:   true,
            restart_delay: 3000,           // Esperar 3 s antes de reiniciar
            max_restarts:  10,             // Máximo 10 reinicios automáticos
        },
    ],
};
