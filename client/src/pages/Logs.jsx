import { useState, useEffect } from 'react';
import { FileText, Search } from 'lucide-react';
import api from '../api/axios';

export default function Logs() {
    const [logs, setLogs] = useState([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        api.get('/logs').then(r => setLogs(r.data.logs || []));
    }, []);

    const filtered = logs.filter(l =>
        l.accion?.toLowerCase().includes(search.toLowerCase()) ||
        l.usuario?.nombre?.toLowerCase().includes(search.toLowerCase()) ||
        l.tabla_afectada?.toLowerCase().includes(search.toLowerCase())
    );

    const accionColor = {
        LOGIN: 'badge-success', LOGOUT: 'badge-warning',
        CREATE: 'badge-info', UPDATE: 'badge-purple', DELETE: 'badge-danger'
    };

    return (
        <div>
            <div className="page-title"><FileText size={22} />Logs del Sistema</div>
            <div className="card">
                <div className="toolbar" style={{ marginBottom: 12 }}>
                    <div className="search-box" style={{ flex: 1 }}>
                        <Search size={15} />
                        <input className="form-control" placeholder="Buscar por acción, usuario o tabla..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Tabla</th><th>Registro ID</th><th>IP</th></tr></thead>
                        <tbody>
                            {filtered.map(l => (
                                <tr key={l.id}>
                                    <td style={{ fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{new Date(l.created_at).toLocaleString('es-PE')}</td>
                                    <td>{l.usuario?.nombre || '—'}</td>
                                    <td><span className={`badge ${accionColor[l.accion] || 'badge-purple'}`}>{l.accion}</span></td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{l.tabla_afectada || '—'}</td>
                                    <td style={{ color: 'var(--text-muted)' }}>{l.registro_id || '—'}</td>
                                    <td style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l.ip || '—'}</td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 30 }}>No hay logs disponibles</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
