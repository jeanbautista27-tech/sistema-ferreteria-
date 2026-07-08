import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TrendingUp, Eye, X, Ban, Printer, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ConfirmModal from '../components/ui/ConfirmModal';
import TicketVenta from '../components/ventas/TicketVenta';
import useAuthStore from '../store/authStore';

export default function Ventas() {
    const { usuario } = useAuthStore();
    const [ventas, setVentas] = useState([]);
    const [detalle, setDetalle] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [filtros, setFiltros] = useState({ desde: '', hasta: '', estado: '' });

    // Devoluciones
    const [modalDevolucion, setModalDevolucion] = useState(false);
    const [formDevolucion, setFormDevolucion] = useState({ motivo: '', tipo_reembolso: 'Nota Credito', items: {} });

    // Configuración empresa para ticket
    const [empresa, setEmpresa] = useState({});
    const ticketRef = useRef();

    const load = async () => {
        const params = new URLSearchParams();
        if (filtros.desde) params.append('desde', filtros.desde);
        if (filtros.hasta) params.append('hasta', filtros.hasta);
        if (filtros.estado) params.append('estado', filtros.estado);
        const r = await api.get(`/ventas?${params.toString()}`);
        setVentas(r.data.ventas);
    };

    useEffect(() => {
        load();
        api.get('/configuracion').then(r => setEmpresa(r.data.configuracion || {})).catch(() => { });
    }, []);

    const verDetalle = async (id) => {
        const r = await api.get(`/ventas/${id}`);
        const v = r.data.venta;
        v.detalle = v.detalles; // Compatibilidad con el TicketVenta
        setDetalle(v);
    };

    const handlePrint = () => {
        window.print();
    };

    const anularVenta = async () => {
        try { await api.put(`/ventas/${selectedId}/anular`); toast.success('Venta anulada'); load(); setDetalle(null); }
        catch (err) { toast.error(err.response?.data?.msg || 'Error al anular'); }
    };

    const abrirDevolucion = () => {
        // Inicializar todas las cantidades en 0
        const items = {};
        detalle.detalles.forEach(d => items[d.producto_id] = 0);
        setFormDevolucion({ motivo: '', tipo_reembolso: 'Nota Credito', items });
        setModalDevolucion(true);
    };

    const cambiarDevCantidad = (pid, val) => {
        setFormDevolucion(prev => ({ ...prev, items: { ...prev.items, [pid]: val } }));
    };

    const procesarDevolucion = async () => {
        // Preparar array con los que tengan cantidad > 0
        const itemsToReturn = Object.entries(formDevolucion.items)
            .filter(([_, qty]) => Number(qty) > 0)
            .map(([pid, qty]) => ({ producto_id: Number(pid), cantidad: Number(qty) }));

        if (itemsToReturn.length === 0) return toast.error('Debe seleccionar al menos 1 producto para devolver');
        if (!formDevolucion.motivo.trim()) return toast.error('Especifique un motivo para la devolución');

        try {
            await api.post('/devoluciones', {
                venta_id: detalle.id,
                motivo: formDevolucion.motivo,
                tipo_reembolso: formDevolucion.tipo_reembolso,
                items: itemsToReturn
            });
            toast.success('Devolución procesada correctamente');
            setModalDevolucion(false);
            setDetalle(null);
            load();
        } catch (error) {
            toast.error(error.response?.data?.msg || 'Error al procesar devolución');
        }
    };

    const estadoBadge = { Completada: 'badge-success', Anulada: 'badge-danger', Pendiente: 'badge-warning' };
    const total = ventas.reduce((a, v) => v.estado === 'Completada' ? a + parseFloat(v.total) : a, 0);

    return (
        <div>
            <div className="page-title"><TrendingUp size={22} />Historial de Ventas</div>
            <div className="card mb-4" style={{ marginBottom: 16 }}>
                <div className="toolbar">
                    <input type="date" className="form-control" style={{ width: 160 }} value={filtros.desde} onChange={e => setFiltros({ ...filtros, desde: e.target.value })} />
                    <input type="date" className="form-control" style={{ width: 160 }} value={filtros.hasta} onChange={e => setFiltros({ ...filtros, hasta: e.target.value })} />
                    <select className="form-control" style={{ width: 140 }} value={filtros.estado} onChange={e => setFiltros({ ...filtros, estado: e.target.value })}>
                        <option value="">Todos</option><option value="Completada">Completada</option><option value="Anulada">Anulada</option>
                    </select>
                    <button className="btn btn-primary" onClick={load}>Filtrar</button>
                </div>
            </div>

            <div className="grid grid-3 mb-4" style={{ marginBottom: 16 }}>
                <div className="stat-card"><div className="label">Total Ventas</div><div className="value">S/ {total.toFixed(2)}</div></div>
                <div className="stat-card"><div className="label">N° Ventas</div><div className="value">{ventas.filter(v => v.estado === 'Completada').length}</div></div>
                <div className="stat-card"><div className="label">Anuladas</div><div className="value">{ventas.filter(v => v.estado === 'Anulada').length}</div></div>
            </div>

            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Comprobante</th><th>Tipo</th><th>Cliente</th><th>Total</th><th>Pago</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {ventas.map(v => (
                                <tr key={v.id}>
                                    <td style={{ color: 'var(--accent-light)', fontFamily: 'monospace' }}>{v.numero_comprobante}</td>
                                    <td>{v.tipo_comprobante}</td>
                                    <td>{v.cliente?.nombre || 'Cliente General'}</td>
                                    <td><strong>S/ {parseFloat(v.total).toFixed(2)}</strong></td>
                                    <td>{v.tipo_pago}</td>
                                    <td><span className={`badge ${estadoBadge[v.estado]}`}>{v.estado}</span></td>
                                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(v.created_at).toLocaleString('es-PE')}</td>
                                    <td style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn-icon view" onClick={() => verDetalle(v.id)}><Eye size={14} /></button>
                                        {v.estado === 'Completada' && <button className="btn-icon del" onClick={() => { setSelectedId(v.id); setConfirmOpen(true); }}><Ban size={14} /></button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {detalle && (
                <div className="modal-overlay" onClick={() => setDetalle(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Detalle Venta — {detalle.numero_comprobante}</div>
                            <button className="modal-close" onClick={() => setDetalle(null)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row" style={{ marginBottom: 12 }}>
                                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Cliente</div><div style={{ fontWeight: 600 }}>{detalle.cliente?.nombre || 'General'}</div></div>
                                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Fecha</div><div>{new Date(detalle.created_at).toLocaleString('es-PE')}</div></div>
                                <div><div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Tipo Pago</div><div>{detalle.tipo_pago}</div></div>
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
                                <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>IGV (18%): S/ {parseFloat(detalle.igv).toFixed(2)}</div>
                                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-light)' }}>TOTAL: S/ {parseFloat(detalle.total).toFixed(2)}</div>
                            </div>

                            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                    {detalle.estado === 'Completada' && (
                                        <button className="btn btn-secondary" onClick={abrirDevolucion} style={{ color: 'var(--danger-color)', borderColor: 'var(--danger-color)' }}>
                                            <RotateCcw size={16} /> Procesar Devolución
                                        </button>
                                    )}
                                </div>
                                <button className="btn btn-primary" onClick={handlePrint}>
                                    <Printer size={16} /> Imprimir Comprobante
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Devolución */}
            {modalDevolucion && detalle && (
                <div className="modal-overlay" onClick={() => setModalDevolucion(false)} style={{ zIndex: 1100 }}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Devolución / Nota de Crédito</div>
                            <button className="modal-close" onClick={() => setModalDevolucion(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                                Venta Origen: <strong>{detalle.numero_comprobante}</strong>. Ingrese la cantidad a devolver por cada producto. Si no se devuelve un ítem, déjelo en 0.
                            </p>

                            <div className="table-wrapper mb-4">
                                <table>
                                    <thead><tr><th>Producto</th><th>Vendido</th><th>Precio Un.</th><th>A Devolver</th></tr></thead>
                                    <tbody>
                                        {detalle.detalles?.map(d => (
                                            <tr key={d.id}>
                                                <td>{d.producto?.nombre}</td>
                                                <td>{d.cantidad}</td>
                                                <td>S/ {parseFloat(d.precio_unitario).toFixed(2)}</td>
                                                <td style={{ width: 120 }}>
                                                    <input
                                                        type="number"
                                                        className="form-control"
                                                        min="0"
                                                        max={d.cantidad}
                                                        value={formDevolucion.items[d.producto_id] || 0}
                                                        onChange={e => cambiarDevCantidad(d.producto_id, Math.min(Number(e.target.value), d.cantidad))}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Tipo de Reembolso</label>
                                    <select className="form-control" value={formDevolucion.tipo_reembolso} onChange={e => setFormDevolucion({ ...formDevolucion, tipo_reembolso: e.target.value })}>
                                        <option value="Nota Credito">Generar Nota de Crédito / Saldo a Favor</option>
                                        <option value="Efectivo">Retirar Efectivo en Caja</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Motivo de la Devolución *</label>
                                <textarea className="form-control" rows={2} placeholder="Ej. Producto dañado, cliente se arrepintió, etc." value={formDevolucion.motivo} onChange={e => setFormDevolucion({ ...formDevolucion, motivo: e.target.value })}></textarea>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModalDevolucion(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={procesarDevolucion}>Confirmar Devolución</button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={anularVenta} title="¿Anular venta?" message="Se revertirá el stock de los productos vendidos. Esta acción no se puede deshacer." type="danger" confirmText="Anular Venta" />

            {/* Componente Oculto para Impresión */}
            {detalle && createPortal(
                <div className="print-only">
                    <TicketVenta ref={ticketRef} venta={detalle} empresa={empresa} />
                </div>,
                document.body
            )}
        </div>
    );
}
