const { execSync, exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const DB = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    pass: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'ferreteria_db',
};

// ─── DIR de backups ───────────────────────────────────
const backupsDir = path.join(__dirname, '../../backups');
if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });

// ─── Multer: subida de archivo .sql ──────────────────
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, backupsDir),
    filename: (req, file, cb) => cb(null, `restore_${Date.now()}.sql`),
});
const upload = multer({ storage, limits: { fileSize: 100 * 1024 * 1024 } });
exports.uploadMiddleware = upload.single('backup');

// ─── 1. CREAR BACKUP ─────────────────────────────────
exports.crearBackup = async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const filename = `backup_ferreteria_${timestamp}.sql`;
        const filepath = path.join(backupsDir, filename);

        const passArg = DB.pass ? `-p${DB.pass}` : '';
        const cmd = `mysqldump -h ${DB.host} -u ${DB.user} ${passArg} --single-transaction --routines --triggers ${DB.name}`;

        const output = execSync(cmd).toString();
        fs.writeFileSync(filepath, output, 'utf8');

        res.setHeader('Content-Type', 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Length', Buffer.byteLength(output, 'utf8'));
        return res.send(output);
    } catch (err) {
        console.error('Error al crear backup:', err.message);
        return res.status(500).json({ ok: false, msg: 'Error al generar backup. Verifique que mysqldump esté disponible en el servidor.', error: err.message });
    }
};

// ─── 2. LISTAR BACKUPS GUARDADOS ─────────────────────
exports.listarBackups = async (req, res) => {
    try {
        const files = fs.readdirSync(backupsDir)
            .filter(f => f.endsWith('.sql') && f.startsWith('backup_'))
            .map(f => {
                const stat = fs.statSync(path.join(backupsDir, f));
                return {
                    nombre: f,
                    tamanio: (stat.size / 1024).toFixed(2) + ' KB',
                    fecha: stat.mtime.toLocaleString('es-PE'),
                };
            })
            .sort((a, b) => b.fecha.localeCompare(a.fecha));
        return res.json({ ok: true, backups: files });
    } catch (err) {
        return res.status(500).json({ ok: false, msg: 'Error al listar backups', error: err.message });
    }
};

// ─── 3. RESTAURAR BACKUP ─────────────────────────────
exports.restaurarBackup = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ ok: false, msg: 'No se recibió ningún archivo SQL.' });

        const filepath = req.file.path;
        const passArg = DB.pass ? `-p${DB.pass}` : '';
        const cmd = `mysql -h ${DB.host} -u ${DB.user} ${passArg} ${DB.name} < "${filepath}"`;

        execSync(cmd, { shell: 'cmd' });
        fs.unlinkSync(filepath); // limpiar el archivo temporal

        return res.json({ ok: true, msg: '✅ Base de datos restaurada exitosamente.' });
    } catch (err) {
        console.error('Error al restaurar backup:', err.message);
        return res.status(500).json({ ok: false, msg: 'Error al restaurar. Verifique el archivo SQL.', error: err.message });
    }
};

// ─── 4. RESTABLECER SISTEMA ──────────────────────────
// Limpia todos los datos transaccionales preservando configuracion y admin
exports.restablecerSistema = async (req, res) => {
    try {
        const { confirmacion } = req.body;
        if (confirmacion !== 'RESTABLECER') {
            return res.status(400).json({ ok: false, msg: 'Confirmación incorrecta. Escriba RESTABLECER para continuar.' });
        }

        const passArg = DB.pass ? `-p${DB.pass}` : '';
        const sql = `
            SET FOREIGN_KEY_CHECKS=0;
            TRUNCATE TABLE audit_logs;
            TRUNCATE TABLE caja_egresos;
            TRUNCATE TABLE caja;
            TRUNCATE TABLE detalle_ventas;
            TRUNCATE TABLE ventas;
            TRUNCATE TABLE detalle_compras;
            TRUNCATE TABLE compras;
            TRUNCATE TABLE inventario_movimientos;
            TRUNCATE TABLE productos;
            TRUNCATE TABLE clientes;
            TRUNCATE TABLE proveedores;
            TRUNCATE TABLE categorias;
            DELETE FROM usuarios WHERE rol_id != 1;
            SET FOREIGN_KEY_CHECKS=1;
        `;

        const cmd = `mysql -h ${DB.host} -u ${DB.user} ${passArg} ${DB.name} -e "${sql.replace(/\n\s*/g, ' ')}"`;
        execSync(cmd, { shell: 'cmd' });

        return res.json({ ok: true, msg: '✅ Sistema restablecido. Datos transaccionales eliminados. Configuración y administrador conservados.' });
    } catch (err) {
        console.error('Error al restablecer:', err.message);
        return res.status(500).json({ ok: false, msg: 'Error al restablecer el sistema.', error: err.message });
    }
};

// ─── 5. ESTADO DEL SISTEMA ───────────────────────────
exports.estadoSistema = async (req, res) => {
    try {
        const passArg = DB.pass ? `-p${DB.pass}` : '';
        const sql = `SELECT 'ventas' AS t, COUNT(*) AS n FROM ventas UNION ALL SELECT 'compras', COUNT(*) FROM compras UNION ALL SELECT 'productos', COUNT(*) FROM productos UNION ALL SELECT 'clientes', COUNT(*) FROM clientes UNION ALL SELECT 'categorias', COUNT(*) FROM categorias UNION ALL SELECT 'usuarios', COUNT(*) FROM usuarios;`;
        const raw = execSync(`mysql -h ${DB.host} -u ${DB.user} ${passArg} ${DB.name} -e "${sql}" --batch --skip-column-names`).toString().trim();
        const rows = raw.split('\n').map(r => { const [t, n] = r.split('\t'); return { tabla: t, registros: parseInt(n) }; });

        // Info backups
        const backupCount = fs.readdirSync(backupsDir).filter(f => f.endsWith('.sql') && f.startsWith('backup_')).length;

        return res.json({ ok: true, estado: rows, backupCount });
    } catch (err) {
        return res.status(500).json({ ok: false, msg: 'Error al obtener estado', error: err.message });
    }
};
