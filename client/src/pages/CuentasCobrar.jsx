import { useState, useEffect } from 'react';
import { CreditCard, Eye, Plus, FileText, CheckCircle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function CuentasCobrar() {
    const [cuentas, setCuentas] = useState([]);
    const [filtros, setFiltros] = useState({ estado: 'Pendiente' });
    const [detalle, setDetalle] = useState(null);
    const [abonoModal, setAbonoModal] = useState(null);
    const [formAbono, setFormAbono] = useState({ monto: '', metodo_pago: 'Efectivo', referencia: '' });
    const [loading, setLoading] = useState(false);

    const loadCuentas = async () => {
        try {
            const params = new URLSearchParams();
            if (filtros.estado) params.append('estado', filtros.estado);
            const r = await api.get(`/cuentas-cobrar?${params.toString()}`);
            setCuentas(r.data.cuentas);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        loadCuentas();
    }, [filtros]);

    const verDetalle = async (id) => {
        try {
            const r = await api.get(`/cuentas-cobrar/${id}`);
            setDetalle(r.data.cuenta);
        } catch (error) {
            toast.error('Error al cargar detalle');
        }
    };

    const registrarAbono = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post(`/cuentas-cobrar/${abonoModal.id}/abonos`, formAbono);
            toast.success('Abono registrado exitosamente');
            setAbonoModal(null);
            setFormAbono({ monto: '', metodo_pago: 'Efectivo', referencia: '' });
            loadCuentas();
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error al abonar');
        } finally {
            setLoading(false);
        }
    };

    const estadoBadge = { Pendiente: 'badge-warning', Pagado: 'badge-success', Anulado: 'badge-danger' };

    return (
        <div>
            <div className="page-title"><CreditCard size={22} /> Cuentas por Cobrar</div>

            <div className="card mb-4" style={{ marginBottom: 16 }}>
                <div className="toolbar">
                    <select className="form-control" style={{ width: 160 }} value={filtros.estado} onChange={e => setFiltros({ ...filtros, estado: e.target.value })}>
                        <option value="">Todos los Estados</option>
                        <option value="Pendiente">Deuda Pendiente</option>
                        <option value="Pagado">Deuda Pagada</option>
                        <option value="Anulado">Anulados</option>
                    </select>
                    <button className="btn btn-primary" onClick={loadCuentas}>Refrescar</button>

                    <div className="toolbar-stats" style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
                        <div style={{ padding: '0 12px', borderLeft: '2px solid var(--accent-color)' }}>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Cobranza Pendiente</div>
                            <strong style={{ color: 'var(--danger-color)' }}>
                                S/ {cuentas.filter(c => c.estado === 'Pendiente').reduce((a, b) => a + parseFloat(b.saldo_pendiente), 0).toFixed(2)}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Ref. Venta</th>
                                <th>Cliente</th>
                                <th>Total Facturado</th>
                                <th>Pagado</th>
                                <th>Saldo Deudor</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cuentas.map(c => (
                                <tr key={c.id}>
                                    <td style={{ color: 'var(--accent-light)', fontFamily: 'monospace' }}>{c.venta?.numero_comprobante}</td>
                                    <td>
                                        <div style={{ fontWeight: 500 }}>{c.cliente?.nombre}</div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>DOC: {c.cliente?.numero_documento}</div>
                                    </td>
                                    <td>S/ {parseFloat(c.monto_total).toFixed(2)}</td>
                                    <td className="text-success">S/ {parseFloat(c.saldo_pagado).toFixed(2)}</td>
                                    <td className="text-danger" style={{ fontWeight: 700 }}>S/ {parseFloat(c.saldo_pendiente).toFixed(2)}</td>
                                    <td><span className={`badge ${estadoBadge[c.estado]}`}>{c.estado}</span></td>
                                    <td style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn-icon view" onClick={() => verDetalle(c.id)} title="Ver Historial de Abonos"><Eye size={14} /></button>
                                        {c.estado === 'Pendiente' && (
                                            <button className="btn-icon edit text-success" onClick={() => setAbonoModal(c)} title="Registrar Abono"><Plus size={14} /></button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {cuentas.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-4">No hay cuentas que coincidan con los filtros</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de Abono */}
            {abonoModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <div className="modal-title">Registrar Cobranza (Abono)</div>
                            <button className="modal-close" onClick={() => setAbonoModal(null)}><X /></button>
                        </div>
                        <form onSubmit={registrarAbono}>
                            <div className="modal-body">
                                <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 8, marginBottom: 16 }}>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Cliente: {abonoModal.cliente?.nombre}</div>
                                    <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Venta: {abonoModal.venta?.numero_comprobante}</div>
                                    <div style={{ fontSize: 16, marginTop: 4 }}>Saldo Restante: <strong className="text-danger">S/ {parseFloat(abonoModal.saldo_pendiente).toFixed(2)}</strong></div>
                                </div>
                                <div className="form-group">
                                    <label>Monto a Abonar (S/)</label>
                                    <input type="number" step="0.01" max={abonoModal.saldo_pendiente} required className="form-control" value={formAbono.monto} onChange={e => setFormAbono({ ...formAbono, monto: e.target.value })} autoFocus />
                                </div>
                                <div className="form-group">
                                    <label>Método de Pago</label>
                                    <select className="form-control" value={formAbono.metodo_pago} onChange={e => setFormAbono({ ...formAbono, metodo_pago: e.target.value })}>
                                        <option value="Efectivo">Efectivo (Directo a Caja)</option>
                                        <option value="Transferencia Bancaria">Transferencia Bancaria</option>
                                        <option value="Yape">Yape</option>
                                        <option value="Plin">Plin</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Nº de Operación / Referencia (Opcional)</label>
                                    <input className="form-control" value={formAbono.referencia} onChange={e => setFormAbono({ ...formAbono, referencia: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setAbonoModal(null)}>Cancelar</button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Procesando...' : '💰 Guardar Abono'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal Detalle / Historial */}
            {detalle && (
                <div className="modal-overlay" onClick={() => setDetalle(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Detalle de Crédito — {detalle.venta?.numero_comprobante}</div>
                            <button className="modal-close" onClick={() => setDetalle(null)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row" style={{ marginBottom: 16 }}>
                                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Deudor</div><div style={{ fontWeight: 600 }}>{detalle.cliente?.nombre}</div></div>
                                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Monto Total</div><div style={{ fontWeight: 600 }}>S/ {parseFloat(detalle.monto_total).toFixed(2)}</div></div>
                                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Estado</div><div><span className={`badge ${estadoBadge[detalle.estado]}`}>{detalle.estado}</span></div></div>
                                <div>
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Progreso de Pago</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                                        <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${Math.min(100, Math.max(0, (parseFloat(detalle.saldo_pagado) / parseFloat(detalle.monto_total)) * 100))}%`, background: 'var(--green)' }} />
                                        </div>
                                        <span style={{ fontSize: 11 }}>{Math.round((parseFloat(detalle.saldo_pagado) / parseFloat(detalle.monto_total)) * 100)}%</span>
                                    </div>
                                </div>
                            </div>

                            <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8, marginTop: 24 }}><FileText size={14} style={{ display: 'inline', marginRight: 6 }} />Historial de Pagos</h3>
                            {detalle.abonos && detalle.abonos.length > 0 ? (
                                <div className="table-wrapper">
                                    <table>
                                        <thead><tr><th>Fecha</th><th>Cajero</th><th>Método</th><th>Referencia</th><th>Monto Entregado</th></tr></thead>
                                        <tbody>
                                            {detalle.abonos.map(ab => (
                                                <tr key={ab.id}>
                                                    <td style={{ fontSize: 12 }}>{new Date(ab.created_at).toLocaleString('es-PE')}</td>
                                                    <td>{ab.cajero?.nombre}</td>
                                                    <td>{ab.metodo_pago}</td>
                                                    <td>{ab.referencia || '-'}</td>
                                                    <td className="text-success" style={{ fontWeight: 600 }}>+ S/ {parseFloat(ab.monto).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: '20px 0', border: '1px dashed var(--border-color)', borderRadius: 8 }}>
                                    <p style={{ margin: 0, color: 'var(--text-muted)' }}>Aún no se han registrado abonos o adelantos.</p>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
