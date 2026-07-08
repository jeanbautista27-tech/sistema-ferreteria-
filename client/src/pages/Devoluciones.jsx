import { useState, useEffect } from 'react';
import { RotateCcw, Eye, FileText, Ban, X } from 'lucide-react';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function Devoluciones() {
    const { usuario } = useAuthStore();
    const [devoluciones, setDevoluciones] = useState([]);
    const [detalle, setDetalle] = useState(null);

    const load = async () => {
        try {
            const r = await api.get('/devoluciones');
            setDevoluciones(r.data.devoluciones || []);
        } catch (error) {
            console.error('Error cargando devoluciones:', error);
        }
    };

    useEffect(() => { load(); }, []);

    const verDetalle = async (id) => {
        try {
            const r = await api.get(`/devoluciones/${id}`);
            setDetalle(r.data.devolucion);
        } catch (error) {
            console.error('Error obteniendo detalle', error);
        }
    };

    return (
        <div>
            <div className="page-title"><RotateCcw size={24} /> Notas de Crédito / Devoluciones</div>
            <div className="card mt-4">
                <div className="table-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Fecha</th>
                                <th>Nº Comprobante</th>
                                <th>Venta Asoc.</th>
                                <th>Cliente</th>
                                <th>Atendido Por</th>
                                <th>Reembolso</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devoluciones.map(d => (
                                <tr key={d.id}>
                                    <td>{new Date(d.createdAt).toLocaleString()}</td>
                                    <td><strong>{d.numero_comprobante}</strong><br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{d.tipo_reembolso}</span></td>
                                    <td>{d.venta?.numero_comprobante}</td>
                                    <td>{d.venta?.cliente?.nombre || 'Cliente General'}</td>
                                    <td>{d.usuario?.nombre}</td>
                                    <td><strong style={{ color: 'var(--danger-color)' }}>S/ {parseFloat(d.total_reembolso).toFixed(2)}</strong></td>
                                    <td>
                                        <button className="btn-icon" onClick={() => verDetalle(d.id)} title="Ver Detalle"><Eye size={16} /></button>
                                        <button className="btn-icon text-primary" onClick={() => window.print()} title="Imprimir Nota"><FileText size={16} /></button>
                                    </td>
                                </tr>
                            ))}
                            {devoluciones.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-4">No hay devoluciones registradas</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {detalle && (
                <div className="modal-overlay" onClick={() => setDetalle(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Detalle Devolución: {detalle.numero_comprobante}</div>
                            <button className="modal-close" onClick={() => setDetalle(null)}><X /></button>
                        </div>
                        <div className="modal-body" style={{ background: 'var(--bg-main)', padding: 16 }}>
                            <div className="card" style={{ marginBottom: 16, border: 'none' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, fontSize: 13 }}>
                                    <div><strong>Venta Origen:</strong><br />{detalle.venta?.numero_comprobante}</div>
                                    <div><strong>Cliente:</strong><br />{detalle.venta?.cliente ? detalle.venta.cliente.nombre : 'Cliente General'}</div>
                                    <div><strong>Tipo Reembolso:</strong><br /><span className={`badge ${detalle.tipo_reembolso === 'Efectivo' ? 'badge-warning' : 'badge-info'}`}>{detalle.tipo_reembolso}</span></div>
                                    <div><strong>Fecha:</strong><br />{new Date(detalle.createdAt).toLocaleString()}</div>
                                    <div style={{ gridColumn: 'span 4', fontSize: 12, padding: 8, background: 'var(--bg-secondary)', borderRadius: 6 }}>
                                        <strong>Motivo declarado: </strong> {detalle.motivo}
                                    </div>
                                </div>
                            </div>
                            <h5>Productos Devueltos</h5>
                            <div className="table-wrapper mt-2">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Código</th>
                                            <th>Producto</th>
                                            <th>Cantidad</th>
                                            <th>Precio Unit.</th>
                                            <th>Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {detalle.detalles?.map(d => (
                                            <tr key={d.id}>
                                                <td className="text-muted">{d.producto?.codigo || '—'}</td>
                                                <td>{d.producto?.nombre}</td>
                                                <td><strong className="text-danger">-{d.cantidad}</strong></td>
                                                <td>S/ {parseFloat(d.precio_unitario).toFixed(2)}</td>
                                                <td><strong>S/ {parseFloat(d.subtotal).toFixed(2)}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'right', fontWeight: 'bold' }}>TOTAL REEMBOLSADO:</td>
                                            <td style={{ fontWeight: 'bold', color: 'var(--danger-color)' }}>S/ {parseFloat(detalle.total_reembolso).toFixed(2)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
