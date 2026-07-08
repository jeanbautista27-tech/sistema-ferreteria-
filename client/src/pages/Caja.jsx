import { useState, useEffect } from 'react';
import { DollarSign, Plus, Minus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Caja() {
    const [caja, setCaja] = useState(null);
    const [historial, setHistorial] = useState([]);
    const [modalAbrir, setModalAbrir] = useState(false);
    const [modalMov, setModalMov] = useState(false);
    const [montoInicial, setMontoInicial] = useState('');
    const [movForm, setMovForm] = useState({ concepto: '', monto: '', tipo: 'Egreso' });

    const load = async () => {
        const [cajaR, histR] = await Promise.all([api.get('/caja/actual'), api.get('/caja/historial')]);
        setCaja(cajaR.data.caja);
        setHistorial(histR.data.cajas);
    };
    useEffect(() => { load(); }, []);

    const abrirCaja = async () => {
        try { await api.post('/caja/abrir', { monto_inicial: parseFloat(montoInicial || 0) }); toast.success('Caja abierta'); setModalAbrir(false); load(); }
        catch (err) { toast.error(err.response?.data?.msg || 'Error al abrir caja'); }
    };

    const cerrarCaja = async () => {
        if (!caja) return;
        try { await api.put(`/caja/${caja.id}/cerrar`, {}); toast.success('Caja cerrada'); load(); }
        catch (err) { toast.error(err.response?.data?.msg || 'Error al cerrar caja'); }
    };

    const registrarMov = async () => {
        if (!movForm.concepto || !movForm.monto) return toast.error('Completa los campos');
        if (!caja) return toast.error('No hay caja abierta');
        try { await api.post('/caja/movimiento', { caja_id: caja.id, ...movForm }); toast.success('Movimiento registrado'); setModalMov(false); setMovForm({ concepto: '', monto: '', tipo: 'Egreso' }); load(); }
        catch { toast.error('Error al registrar'); }
    };

    return (
        <div>
            <div className="page-title"><DollarSign size={22} />Caja</div>

            <div className="grid grid-2 mb-4" style={{ marginBottom: 16 }}>
                <div className="card">
                    <div className="card-header"><div className="card-title">Estado de Caja</div>
                        <span className={`badge ${caja ? 'badge-success' : 'badge-danger'}`}>{caja ? '● Abierta' : '● Cerrada'}</span>
                    </div>
                    {caja ? (
                        <div>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 8 }}>Abierta por: <strong>{caja.usuario?.nombre}</strong></p>
                            <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 12 }}>Apertura: {new Date(caja.fecha_apertura).toLocaleString('es-PE')}</p>
                            <p style={{ fontSize: 13, marginBottom: 12 }}>Monto Inicial: <strong>S/ {parseFloat(caja.monto_inicial).toFixed(2)}</strong></p>
                            <div style={{ display: 'flex', gap: 8 }}>
                                <button className="btn btn-secondary" onClick={() => setModalMov(true)}><Plus size={14} />Movimiento</button>
                                <button className="btn btn-danger" onClick={cerrarCaja}>Cerrar Caja</button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 12, fontSize: 13 }}>No hay ninguna caja abierta. Abre una para registrar ventas.</p>
                            <button className="btn btn-primary" onClick={() => setModalAbrir(true)}><Plus size={14} />Abrir Caja</button>
                        </div>
                    )}
                </div>
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 12 }}>Movimientos Recientes</div>
                    {caja?.movimientos?.length > 0 ? (
                        <div className="table-wrapper" style={{ maxHeight: 200, overflow: 'auto' }}>
                            <table>
                                <thead><tr><th>Concepto</th><th>Tipo</th><th>Monto</th></tr></thead>
                                <tbody>
                                    {caja.movimientos.slice(0, 10).map(m => (
                                        <tr key={m.id}>
                                            <td>{m.concepto}</td>
                                            <td><span className={`badge ${m.tipo === 'Ingreso' ? 'badge-success' : 'badge-danger'}`}>{m.tipo}</span></td>
                                            <td className={m.tipo === 'Ingreso' ? 'text-success' : 'text-danger'}>S/ {parseFloat(m.monto).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin movimientos registrados</p>}
                </div>
            </div>

            <div className="card">
                <div className="card-title" style={{ marginBottom: 12 }}>Historial de Cajas</div>
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Usuario</th><th>Apertura</th><th>Cierre</th><th>M. Inicial</th><th>Ventas</th><th>Egresos</th><th>M. Final</th><th>Estado</th></tr></thead>
                        <tbody>
                            {historial.map(c => (
                                <tr key={c.id}>
                                    <td>{c.usuario?.nombre}</td>
                                    <td style={{ fontSize: 11 }}>{new Date(c.fecha_apertura).toLocaleString('es-PE')}</td>
                                    <td style={{ fontSize: 11 }}>{c.fecha_cierre ? new Date(c.fecha_cierre).toLocaleString('es-PE') : '—'}</td>
                                    <td>S/ {parseFloat(c.monto_inicial).toFixed(2)}</td>
                                    <td className="text-success">S/ {parseFloat(c.total_ventas || 0).toFixed(2)}</td>
                                    <td className="text-danger">S/ {parseFloat(c.total_egresos || 0).toFixed(2)}</td>
                                    <td><strong>S/ {parseFloat(c.monto_final || 0).toFixed(2)}</strong></td>
                                    <td><span className={`badge ${c.estado === 'Abierta' ? 'badge-success' : 'badge-purple'}`}>{c.estado}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalAbrir && (
                <div className="modal-overlay" onClick={() => setModalAbrir(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><div className="modal-title">Abrir Caja</div><button className="modal-close" onClick={() => setModalAbrir(false)}><X /></button></div>
                        <div className="modal-body">
                            <div className="form-group"><label>Monto Inicial (S/)</label><input type="number" className="form-control" placeholder="0.00" value={montoInicial} onChange={e => setMontoInicial(e.target.value)} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModalAbrir(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={abrirCaja}>Abrir Caja</button>
                        </div>
                    </div>
                </div>
            )}

            {modalMov && (
                <div className="modal-overlay" onClick={() => setModalMov(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><div className="modal-title">Registrar Movimiento</div><button className="modal-close" onClick={() => setModalMov(false)}><X /></button></div>
                        <div className="modal-body">
                            <div className="form-group"><label>Tipo</label>
                                <select className="form-control" value={movForm.tipo} onChange={e => setMovForm({ ...movForm, tipo: e.target.value })}>
                                    <option value="Egreso">Egreso</option><option value="Ingreso">Ingreso</option>
                                </select>
                            </div>
                            <div className="form-group"><label>Concepto</label><input className="form-control" value={movForm.concepto} onChange={e => setMovForm({ ...movForm, concepto: e.target.value })} placeholder="Ej: Pago a proveedor" /></div>
                            <div className="form-group"><label>Monto (S/)</label><input type="number" className="form-control" value={movForm.monto} onChange={e => setMovForm({ ...movForm, monto: e.target.value })} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModalMov(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={registrarMov}>Registrar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
