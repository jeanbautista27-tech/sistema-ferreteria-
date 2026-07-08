import { useState, useEffect, useRef } from 'react';
import { FileText, Eye, X, Ban, Printer, FileDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ConfirmModal from '../components/ui/ConfirmModal';
import TicketCotizacion from '../components/ventas/TicketCotizacion';
import { createPortal } from 'react-dom';

export default function Cotizaciones() {
    const navigate = useNavigate();
    const [cotizaciones, setCotizaciones] = useState([]);
    const [detalle, setDetalle] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [filtros, setFiltros] = useState({ estado: '' });
    const ticketRef = useRef();
    const [empresa, setEmpresa] = useState({});

    const load = async () => {
        try {
            const params = new URLSearchParams();
            if (filtros.estado) params.append('estado', filtros.estado);
            const r = await api.get(`/cotizaciones?${params.toString()}`);
            setCotizaciones(r.data.cotizaciones);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        load();
        api.get('/configuracion').then(r => setEmpresa(r.data.configuracion || {})).catch(() => { });
    }, [filtros]);

    const verDetalle = async (id) => {
        const r = await api.get(`/cotizaciones/${id}`);
        setDetalle(r.data.cotizacion);
    };

    const anularCotizacion = async () => {
        try {
            await api.put(`/cotizaciones/${selectedId}/anular`);
            toast.success('Cotización anulada');
            load();
            setDetalle(null);
        } catch (err) { toast.error(err.response?.data?.msg || 'Error al anular'); }
    };

    const estadoBadge = { Pendiente: 'badge-warning', Convertida: 'badge-success', Anulada: 'badge-danger', Vencida: 'badge-info' };

    return (
        <div>
            <div className="page-title"><FileText size={22} /> Cotizaciones & Proformas</div>
            <div className="card mb-4" style={{ marginBottom: 16 }}>
                <div className="toolbar">
                    <select className="form-control" style={{ width: 160 }} value={filtros.estado} onChange={e => setFiltros({ ...filtros, estado: e.target.value })}>
                        <option value="">Todos los Estados</option>
                        <option value="Pendiente">Pendiente</option>
                        <option value="Convertida">Convertida a Venta</option>
                        <option value="Anulada">Anulada</option>
                    </select>
                    <button className="btn btn-primary" onClick={load}>Filtrar</button>
                    <button className="btn btn-secondary" onClick={() => navigate('/pos')} style={{ marginLeft: 'auto' }}>Nueva Proforma (POS)</button>
                </div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Comprobante</th><th>Cliente</th><th>Emisor</th><th>Estado</th><th>Fecha Emisión</th><th>Total</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {cotizaciones.map(c => (
                                <tr key={c.id}>
                                    <td style={{ color: 'var(--accent-light)', fontFamily: 'monospace' }}>{c.numero_comprobante}</td>
                                    <td>{c.cliente?.nombre || 'Cliente General'}</td>
                                    <td>{c.usuario?.nombre}</td>
                                    <td><span className={`badge ${estadoBadge[c.estado]}`}>{c.estado}</span></td>
                                    <td style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{new Date(c.created_at).toLocaleString('es-PE')}</td>
                                    <td><strong>S/ {parseFloat(c.total).toFixed(2)}</strong></td>
                                    <td style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn-icon view" onClick={() => verDetalle(c.id)} title="Ver en detalle"><Eye size={14} /></button>
                                        {c.estado === 'Pendiente' && (
                                            <>
                                                <button className="btn-icon text-success" onClick={() => navigate(`/pos?cotizacion_id=${c.id}`)} title="Convertir a Venta"><FileDown size={14} /></button>
                                                <button className="btn-icon del" onClick={() => { setSelectedId(c.id); setConfirmOpen(true); }} title="Anular"><Ban size={14} /></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {cotizaciones.length === 0 && <tr><td colSpan={7} className="text-center text-muted py-4">No hay cotizaciones registradas</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {detalle && (
                <div className="modal-overlay" onClick={() => setDetalle(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Detalle Proforma — {detalle.numero_comprobante}</div>
                            <button className="modal-close" onClick={() => setDetalle(null)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row" style={{ marginBottom: 12 }}>
                                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cliente</div><div style={{ fontWeight: 600 }}>{detalle.cliente?.nombre || 'General'}</div></div>
                                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fecha</div><div>{new Date(detalle.created_at).toLocaleString('es-PE')}</div></div>
                                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Estado</div><div><span className={`badge ${estadoBadge[detalle.estado]}`}>{detalle.estado}</span></div></div>
                                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Validez</div><div>{detalle.validez_dias} Días</div></div>
                            </div>
                            <div className="table-wrapper">
                                <table>
                                    <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio Un.</th><th>Subtotal</th></tr></thead>
                                    <tbody>
                                        {detalle.detalles?.map(d => (
                                            <tr key={d.id}>
                                                <td>{d.producto?.nombre}</td>
                                                <td>{d.cantidad} {d.producto?.unidad}</td>
                                                <td>S/ {parseFloat(d.precio_unitario).toFixed(2)}</td>
                                                <td><strong>S/ {parseFloat(d.subtotal).toFixed(2)}</strong></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div style={{ textAlign: 'right', marginTop: 12 }}>
                                {parseFloat(detalle.descuento) > 0 && <div style={{ fontSize: 13, color: 'var(--danger-color)' }}>Descuento: - S/ {parseFloat(detalle.descuento).toFixed(2)}</div>}
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>IGV (18%): S/ {parseFloat(detalle.igv).toFixed(2)}</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-light)' }}>TOTAL PACTADO: S/ {parseFloat(detalle.total).toFixed(2)}</div>
                            </div>

                            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    {detalle.estado === 'Pendiente' && (
                                        <button className="btn btn-secondary text-success" onClick={() => navigate(`/pos?cotizacion_id=${detalle.id}`)}>
                                            <FileDown size={16} style={{ marginRight: 6 }} /> Convertir a Venta
                                        </button>
                                    )}
                                </div>
                                <button className="btn btn-primary" onClick={() => window.print()}>
                                    <Printer size={16} style={{ marginRight: 6 }} /> Imprimir Proforma
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={anularCotizacion} title="¿Anular Proforma?" message="Esta cotización quedará archivada como anulada." type="danger" confirmText="Anular Cotización" />

            {/* Componente Oculto para Impresión */}
            {detalle && createPortal(
                <div className="print-only">
                    <TicketCotizacion ref={ticketRef} cotizacion={detalle} empresa={empresa} />
                </div>,
                document.body
            )}
        </div>
    );
}
