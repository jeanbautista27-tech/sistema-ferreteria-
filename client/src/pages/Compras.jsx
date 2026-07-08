import { useState, useEffect } from 'react';
import { Plus, Eye, Truck, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Compras() {
    const [compras, setCompras] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [productos, setProductos] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [detalle, setDetalle] = useState(null);
    const [form, setForm] = useState({ proveedor_id: '', fecha_esperada: '', observaciones: '', estado: 'Pendiente', tipo_pago: 'Efectivo' });
    const [items, setItems] = useState([{ producto_id: '', cantidad: 1, precio_unitario: '' }]);

    const load = () => api.get('/compras').then(r => setCompras(r.data.compras));
    useEffect(() => {
        load();
        api.get('/proveedores').then(r => setProveedores(r.data.proveedores));
        api.get('/productos').then(r => setProductos(r.data.productos));
    }, []);

    const addItem = () => setItems(prev => [...prev, { producto_id: '', cantidad: 1, precio_unitario: '' }]);
    const removeItem = (i) => setItems(prev => prev.filter((_, idx) => idx !== i));
    const updateItem = (i, field, val) => setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: val } : it));

    const handleSave = async () => {
        if (!form.proveedor_id) return toast.error('Selecciona un proveedor');
        if (items.some(i => !i.producto_id || !i.precio_unitario)) return toast.error('Completa todos los productos');
        try {
            await api.post('/compras', { ...form, items });
            toast.success('Orden de compra registrada');
            setModalOpen(false); setItems([{ producto_id: '', cantidad: 1, precio_unitario: '' }]);
            setForm({ proveedor_id: '', fecha_esperada: '', observaciones: '', estado: 'Pendiente', tipo_pago: 'Efectivo' });
            load();
        } catch (err) { toast.error(err.response?.data?.msg || 'Error'); }
    };

    const recibirCompra = async (id) => {
        try { await api.put(`/compras/${id}/recibir`); toast.success('Compra recibida y stock actualizado'); load(); }
        catch (err) { toast.error(err.response?.data?.msg || 'Error'); }
    };

    const verDetalle = async (id) => {
        const r = await api.get(`/compras/${id}`);
        setDetalle(r.data.compra);
    };

    const estadoBadge = { Pendiente: 'badge-warning', Recibida: 'badge-success', Anulada: 'badge-danger', Parcial: 'badge-info' };
    const totales = items.reduce((a, i) => a + (parseFloat(i.precio_unitario || 0) * parseInt(i.cantidad || 0)), 0);

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="page-title" style={{ marginBottom: 0 }}><Truck size={22} />Compras</div>
                <button className="btn btn-primary" onClick={() => setModalOpen(true)}><Plus size={15} />Nueva Compra</button>
            </div>
            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>N° Orden</th><th>Proveedor</th><th>Total</th><th>Pago</th><th>Estado</th><th>Fecha</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {compras.map(c => (
                                <tr key={c.id}>
                                    <td style={{ color: 'var(--accent-light)', fontFamily: 'monospace' }}>{c.numero_orden}</td>
                                    <td>{c.proveedor?.empresa}</td>
                                    <td><strong>S/ {parseFloat(c.total).toFixed(2)}</strong></td>
                                    <td><span className={`badge ${c.tipo_pago === 'Crédito' ? 'badge-warning' : 'badge-info'}`}>{c.tipo_pago || 'Efectivo'}</span></td>
                                    <td><span className={`badge ${estadoBadge[c.estado]}`}>{c.estado}</span></td>
                                    <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(c.created_at).toLocaleDateString('es-PE')}</td>
                                    <td style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn-icon view" onClick={() => verDetalle(c.id)}><Eye size={14} /></button>
                                        {c.estado === 'Pendiente' && <button className="btn-icon" style={{ background: 'rgba(34,197,94,0.12)', color: '#4ade80' }} onClick={() => recibirCompra(c.id)} title="Marcar como Recibida"><CheckCircle size={14} /></button>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal modal-xl" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><div className="modal-title">Nueva Orden de Compra</div><button className="modal-close" onClick={() => setModalOpen(false)}><X /></button></div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label>Proveedor *</label>
                                    <select className="form-control" value={form.proveedor_id} onChange={e => setForm({ ...form, proveedor_id: e.target.value })}>
                                        <option value="">Seleccionar...</option>
                                        {proveedores.map(p => <option key={p.id} value={p.id}>{p.empresa}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label>Fecha Esperada</label><input type="date" className="form-control" value={form.fecha_esperada} onChange={e => setForm({ ...form, fecha_esperada: e.target.value })} /></div>
                                <div className="form-group"><label>Estado Inicial</label>
                                    <select className="form-control" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                                        <option value="Pendiente">Pendiente</option><option value="Recibida">Recibida (actualiza stock)</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>Tipo de Pago</label>
                                    <select className="form-control" value={form.tipo_pago} onChange={e => setForm({ ...form, tipo_pago: e.target.value })}>
                                        <option value="Efectivo">Al Contado (Caja Diaria)</option>
                                        <option value="Crédito">Al Crédito (Cuentas por Pagar)</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ marginBottom: 12 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <strong style={{ fontSize: 13 }}>Productos</strong>
                                    <button className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={13} />Agregar</button>
                                </div>
                                {items.map((item, i) => (
                                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 80px 120px auto', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                                        <div className="form-group" style={{ margin: 0 }}>
                                            <select className="form-control" value={item.producto_id} onChange={e => updateItem(i, 'producto_id', e.target.value)}>
                                                <option value="">Seleccionar producto...</option>
                                                {productos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                                            </select>
                                        </div>
                                        <input type="number" className="form-control" placeholder="Cant." min={1} value={item.cantidad} onChange={e => updateItem(i, 'cantidad', e.target.value)} />
                                        <input type="number" className="form-control" placeholder="Precio Un." value={item.precio_unitario} onChange={e => updateItem(i, 'precio_unitario', e.target.value)} />
                                        <button className="btn-icon del" onClick={() => removeItem(i)}><X size={13} /></button>
                                    </div>
                                ))}
                            </div>
                            <div style={{ textAlign: 'right', fontSize: 16, fontWeight: 700, color: 'var(--accent-light)' }}>Total: S/ {totales.toFixed(2)}</div>
                            <div className="form-group" style={{ marginTop: 10 }}><label>Observaciones</label><textarea className="form-control" rows={2} value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>Registrar Compra</button>
                        </div>
                    </div>
                </div>
            )}

            {detalle && (
                <div className="modal-overlay" onClick={() => setDetalle(null)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><div className="modal-title">Detalle — {detalle.numero_orden}</div><button className="modal-close" onClick={() => setDetalle(null)}><X /></button></div>
                        <div className="modal-body">
                            <p style={{ marginBottom: 12 }}><strong>Proveedor:</strong> {detalle.proveedor?.empresa} &nbsp;|&nbsp; <strong>Estado:</strong> {detalle.estado}</p>
                            <div className="table-wrapper"><table>
                                <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio Un.</th><th>Subtotal</th></tr></thead>
                                <tbody>
                                    {detalle.detalles?.map(d => (
                                        <tr key={d.id}><td>{d.producto?.nombre}</td><td>{d.cantidad}</td><td>S/ {parseFloat(d.precio_unitario).toFixed(2)}</td><td>S/ {parseFloat(d.subtotal).toFixed(2)}</td></tr>
                                    ))}
                                </tbody>
                            </table></div>
                            <div style={{ textAlign: 'right', marginTop: 12, fontSize: 18, fontWeight: 800 }}>Total: S/ {parseFloat(detalle.total).toFixed(2)}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
