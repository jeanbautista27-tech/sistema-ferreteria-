import { useState, useEffect } from 'react';
import { Warehouse, Search, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Inventario() {
    const [productos, setProductos] = useState([]);
    const [movimientos, setMovimientos] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [nuevoStock, setNuevoStock] = useState('');
    const [motivo, setMotivo] = useState('');
    const [tab, setTab] = useState('stock');

    const load = async () => {
        const [pR, mR] = await Promise.all([api.get('/inventario/stock'), api.get('/inventario/movimientos')]);
        setProductos(pR.data.productos);
        setMovimientos(mR.data.movimientos);
    };
    useEffect(() => { load(); }, []);

    const filtered = productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

    const openAjuste = (p) => { setSelected(p); setNuevoStock(p.stock); setMotivo(''); setModalOpen(true); };

    const handleAjuste = async () => {
        if (nuevoStock === '') return toast.error('Ingresa el nuevo stock');
        try {
            await api.post('/inventario/ajustar', { producto_id: selected.id, cantidad: parseInt(nuevoStock), motivo });
            toast.success('Stock ajustado correctamente');
            setModalOpen(false); load();
        } catch (err) { toast.error(err.response?.data?.msg || 'Error al ajustar'); }
    };

    const tipoColor = { Entrada: 'badge-success', Salida: 'badge-danger', Ajuste: 'badge-warning', Venta: 'badge-info', Compra: 'badge-purple' };

    return (
        <div>
            <div className="page-title"><Warehouse size={22} />Inventario</div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {['stock', 'movimientos'].map(t => (
                    <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setTab(t)}>
                        {t === 'stock' ? '📦 Stock Actual' : '📋 Movimientos'}
                    </button>
                ))}
            </div>

            {tab === 'stock' && (
                <div className="card">
                    <div className="toolbar" style={{ marginBottom: 12 }}>
                        <div className="search-box" style={{ flex: 1 }}>
                            <Search size={15} />
                            <input className="form-control" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Producto</th><th>Categoría</th><th>Unidad</th><th>Stock Actual</th><th>Stock Mín.</th><th>Estado</th><th>Acciones</th></tr></thead>
                            <tbody>
                                {filtered.map(p => (
                                    <tr key={p.id}>
                                        <td><strong>{p.nombre}</strong></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{p.categoria?.nombre || '—'}</td>
                                        <td>{p.unidad}</td>
                                        <td><span className={p.stock <= p.stock_minimo ? 'text-danger font-bold' : 'text-success font-bold'}>{p.stock}</span></td>
                                        <td>{p.stock_minimo}</td>
                                        <td>
                                            {p.stock === 0 ? <span className="badge badge-danger">Sin Stock</span>
                                                : p.stock <= p.stock_minimo ? <span className="badge badge-warning">Stock Bajo</span>
                                                    : <span className="badge badge-success">Normal</span>}
                                        </td>
                                        <td><button className="btn-icon edit" onClick={() => openAjuste(p)} title="Ajustar stock"><Edit size={14} /></button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'movimientos' && (
                <div className="card">
                    <div className="table-wrapper">
                        <table>
                            <thead><tr><th>Fecha</th><th>Producto</th><th>Tipo</th><th>Cantidad</th><th>Stock Antes</th><th>Stock Después</th><th>Motivo</th><th>Usuario</th></tr></thead>
                            <tbody>
                                {movimientos.map(m => (
                                    <tr key={m.id}>
                                        <td style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{new Date(m.created_at).toLocaleString('es-PE')}</td>
                                        <td>{m.producto?.nombre}</td>
                                        <td><span className={`badge ${tipoColor[m.tipo] || 'badge-purple'}`}>{m.tipo}</span></td>
                                        <td className={m.cantidad > 0 ? 'text-success' : 'text-danger'}>{m.cantidad > 0 ? '+' : ''}{m.cantidad}</td>
                                        <td>{m.stock_antes}</td>
                                        <td><strong>{m.stock_despues}</strong></td>
                                        <td style={{ color: 'var(--text-secondary)' }}>{m.motivo || '—'}</td>
                                        <td>{m.usuario?.nombre}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {modalOpen && selected && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">Ajustar Stock — {selected.nombre}</div>
                            <button className="modal-close" onClick={() => setModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="alert alert-warning">Stock actual: <strong>{selected.stock} {selected.unidad}</strong></div>
                            <div className="form-group"><label>Nuevo Stock</label><input type="number" className="form-control" value={nuevoStock} onChange={e => setNuevoStock(e.target.value)} min={0} /></div>
                            <div className="form-group"><label>Motivo del ajuste</label><input className="form-control" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Ej: Conteo físico, corrección, merma..." /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleAjuste}>Aplicar Ajuste</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
