import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
    Database, Download, Upload, RotateCcw, Activity,
    CheckCircle, AlertTriangle, HardDrive, Clock, Shield
} from 'lucide-react';

export default function Mantenimiento() {
    const [estado, setEstado] = useState(null);
    const [loadingEstado, setLoadingEstado] = useState(true);
    const [loadingBackup, setLoadingBackup] = useState(false);
    const [loadingRestore, setLoadingRestore] = useState(false);
    const [loadingReset, setLoadingReset] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const [archivoRestore, setArchivoRestore] = useState(null);
    const fileRef = useRef();

    useEffect(() => { fetchEstado(); }, []);

    const fetchEstado = async () => {
        try {
            setLoadingEstado(true);
            const { data } = await api.get('/mantenimiento/estado');
            if (data.ok) setEstado(data);
        } catch {
            toast.error('No se pudo obtener el estado del sistema');
        } finally {
            setLoadingEstado(false);
        }
    };

    // ── 1. Backup ────────────────────────────────────────
    const handleBackup = async () => {
        setLoadingBackup(true);
        const tid = toast.loading('Generando copia de seguridad...');
        try {
            const res = await api.get('/mantenimiento/backup', { responseType: 'blob' });
            const cd = res.headers['content-disposition'] || '';
            const match = cd.match(/filename="(.+)"/);
            const filename = match ? match[1] : `backup_ferreteria_${Date.now()}.sql`;
            const url = URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url; a.download = filename; a.click();
            URL.revokeObjectURL(url);
            toast.success('✅ Backup descargado correctamente', { id: tid });
            fetchEstado();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Error al generar backup', { id: tid });
        } finally {
            setLoadingBackup(false);
        }
    };

    // ── 2. Restaurar ─────────────────────────────────────
    const handleRestore = async () => {
        if (!archivoRestore) return toast.error('Selecciona un archivo .sql primero');
        if (!window.confirm(
            '⚠️ Esta acción reemplazará TODOS los datos actuales con el backup.\n¿Deseas continuar?'
        )) return;

        const form = new FormData();
        form.append('backup', archivoRestore);
        setLoadingRestore(true);
        const tid = toast.loading('Restaurando base de datos...');
        try {
            const { data } = await api.post('/mantenimiento/restaurar', form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success(data.msg, { id: tid });
            setArchivoRestore(null);
            if (fileRef.current) fileRef.current.value = '';
            fetchEstado();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Error al restaurar', { id: tid });
        } finally {
            setLoadingRestore(false);
        }
    };

    // ── 3. Restablecer ───────────────────────────────────
    const handleReset = async () => {
        if (confirmText !== 'RESTABLECER') {
            return toast.error('Debes escribir exactamente "RESTABLECER" para confirmar');
        }
        setLoadingReset(true);
        const tid = toast.loading('Restableciendo el sistema...');
        try {
            const { data } = await api.post('/mantenimiento/restablecer', { confirmacion: confirmText });
            toast.success(data.msg, { id: tid, duration: 6000 });
            setConfirmText('');
            fetchEstado();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Error al restablecer', { id: tid });
        } finally {
            setLoadingReset(false);
        }
    };

    return (
        <div className="page-container">
            {/* ── Header ──────────────────────────────────── */}
            <div className="page-header">
                <div className="page-title">
                    <HardDrive size={22} />
                    <div>
                        <h1>Mantenimiento del Sistema</h1>
                        <p className="page-subtitle">Gestión, backup y restablecimiento de la base de datos</p>
                    </div>
                </div>
                <button className="btn btn-secondary" onClick={fetchEstado} disabled={loadingEstado}>
                    <Activity size={16} /> Actualizar Estado
                </button>
            </div>

            {/* ── Estado del sistema ──────────────────────── */}
            <div className="mant-estado-card">
                <div className="mant-estado-header">
                    <Activity size={18} />
                    <h3>Estado Actual del Sistema</h3>
                    {!loadingEstado && <span className="badge badge-success">En línea</span>}
                </div>
                {loadingEstado ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                        Cargando estado...
                    </div>
                ) : estado ? (
                    <div className="mant-estado-grid">
                        {estado.estado?.map(row => (
                            <div key={row.tabla} className="mant-stat-item">
                                <span className="mant-stat-value">{row.registros.toLocaleString()}</span>
                                <span className="mant-stat-label">{row.tabla}</span>
                            </div>
                        ))}
                        <div className="mant-stat-item mant-stat-highlight">
                            <span className="mant-stat-value">{estado.backupCount ?? 0}</span>
                            <span className="mant-stat-label">backups guardados</span>
                        </div>
                    </div>
                ) : null}
            </div>

            {/* ── Las 3 tarjetas de acción ─────────────── */}
            <div className="mant-grid">

                {/* ─── COPIA DE SEGURIDAD ─────────────────── */}
                <div className="mant-card mant-card-backup">
                    <div className="mant-card-icon mant-icon-backup">
                        <Database size={28} />
                    </div>
                    <h2>Copia de Seguridad</h2>
                    <p className="mant-card-desc">
                        Genera un archivo <strong>.sql</strong> con toda la información actual del sistema.
                        El archivo se descargará automáticamente.
                    </p>

                    <div className="mant-info-list">
                        <div className="mant-info-item"><CheckCircle size={14} className="icon-green" /> Incluye todos los datos transaccionales</div>
                        <div className="mant-info-item"><CheckCircle size={14} className="icon-green" /> Incluye configuración y usuarios</div>
                        <div className="mant-info-item"><CheckCircle size={14} className="icon-green" /> Formato SQL compatible con MySQL</div>
                    </div>

                    <button
                        className="btn btn-primary mant-btn"
                        onClick={handleBackup}
                        disabled={loadingBackup}
                    >
                        <Download size={18} />
                        {loadingBackup ? 'Generando...' : 'Descargar Backup'}
                    </button>
                </div>

                {/* ─── RESTAURAR BACKUP ───────────────────── */}
                <div className="mant-card mant-card-restore">
                    <div className="mant-card-icon mant-icon-restore">
                        <Upload size={28} />
                    </div>
                    <h2>Restaurar Sistema</h2>
                    <p className="mant-card-desc">
                        Carga un archivo <strong>.sql</strong> de backup para restaurar el estado anterior del sistema.
                        Esta acción reemplazará los datos actuales.
                    </p>

                    <div className="mant-info-list">
                        <div className="mant-info-item"><AlertTriangle size={14} className="icon-orange" /> Reemplazará todos los datos actuales</div>
                        <div className="mant-info-item"><CheckCircle size={14} className="icon-green" /> Solo admite archivos .sql</div>
                        <div className="mant-info-item"><CheckCircle size={14} className="icon-green" /> Tamaño máximo: 100 MB</div>
                    </div>

                    <div className="mant-file-zone" onClick={() => fileRef.current?.click()}>
                        <Upload size={20} />
                        <span>
                            {archivoRestore
                                ? archivoRestore.name
                                : 'Haz clic o arrastra un archivo .sql aquí'}
                        </span>
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".sql"
                            style={{ display: 'none' }}
                            onChange={e => setArchivoRestore(e.target.files[0] || null)}
                        />
                    </div>

                    <button
                        className="btn mant-btn mant-btn-orange"
                        onClick={handleRestore}
                        disabled={!archivoRestore || loadingRestore}
                    >
                        <Upload size={18} />
                        {loadingRestore ? 'Restaurando...' : 'Restaurar Backup'}
                    </button>
                </div>

                {/* ─── RESTABLECER SISTEMA ────────────────── */}
                <div className="mant-card mant-card-reset">
                    <div className="mant-card-icon mant-icon-reset">
                        <RotateCcw size={28} />
                    </div>
                    <h2>Restablecer Sistema</h2>
                    <p className="mant-card-desc">
                        Elimina todos los datos transaccionales del negocio actual (ventas, compras, inventario,
                        clientes, etc.) dejando el sistema listo para un nuevo negocio.
                    </p>

                    <div className="mant-info-list">
                        <div className="mant-info-item"><CheckCircle size={14} className="icon-green" /> Conserva configuración de la empresa</div>
                        <div className="mant-info-item"><CheckCircle size={14} className="icon-green" /> Conserva el usuario Administrador</div>
                        <div className="mant-info-item"><AlertTriangle size={14} className="icon-red" /> Elimina ventas, compras, productos, clientes</div>
                        <div className="mant-info-item"><AlertTriangle size={14} className="icon-red" /> Acción IRREVERSIBLE sin backup</div>
                    </div>

                    <div className="mant-confirm-zone">
                        <Shield size={16} />
                        <span>Escribe <strong>RESTABLECER</strong> para confirmar</span>
                    </div>
                    <input
                        type="text"
                        className="form-input mant-confirm-input"
                        placeholder="Escribe: RESTABLECER"
                        value={confirmText}
                        onChange={e => setConfirmText(e.target.value)}
                    />

                    <button
                        className="btn mant-btn mant-btn-red"
                        onClick={handleReset}
                        disabled={confirmText !== 'RESTABLECER' || loadingReset}
                    >
                        <RotateCcw size={18} />
                        {loadingReset ? 'Restableciendo...' : 'Restablecer Sistema'}
                    </button>
                </div>

            </div>

            {/* ── Aviso legal ─────────────────────────────── */}
            <div className="mant-aviso">
                <Shield size={15} />
                <span>
                    Módulo restringido a <strong>Administradores</strong>.
                    Se recomienda crear una copia de seguridad antes de cualquier operación de restauración o restablecimiento.
                    Toda actividad queda registrada en el log de auditoría.
                </span>
            </div>
        </div>
    );
}
