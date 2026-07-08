import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, Package, X, Barcode } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ConfirmModal from '../components/ui/ConfirmModal';
import useBarcodeScanner from '../hooks/useBarcodeScanner';

const UNIDADES = ['und', 'kg', 'g', 'm', 'cm', 'lt', 'ml', 'caja', 'bolsa', 'par', 'rollo', 'saco', 'galón', 'balde'];

export default function Productos() {
    const [productos, setProductos] = useState([]);
    const [categorias, setCategorias] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ codigo: '', nombre: '', descripcion: '', categoria_id: '', proveedor_id: '', precio_compra: '', precio_venta: '', stock: 0, stock_minimo: 5, unidad: 'und' });
    const [imageFile, setImageFile] = useState(null);
    const fileRef = useRef();

    const load = () => api.get('/productos').then(r => setProductos(r.data.productos));
    useEffect(() => {
        load();
        api.get('/categorias').then(r => setCategorias(r.data.categorias));
        api.get('/proveedores').then(r => setProveedores(r.data.proveedores));
    }, []);

    // Escáner en la vista general
    useBarcodeScanner((codigoEscaner) => {
        if (modalOpen || confirmOpen) return; // No hacer nada si hay modales abiertos
        setSearch(codigoEscaner);
        toast.success(`Código escaneado: ${codigoEscaner}`, { icon: '🔍' });
    });

    const filtered = productos.filter(p =>
        p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo?.includes(search)
    );

    const openCreate = () => { setEditing(null); setForm({ codigo: '', nombre: '', descripcion: '', categoria_id: '', proveedor_id: '', precio_compra: '', precio_venta: '', stock: 0, stock_minimo: 5, unidad: 'und' }); setImageFile(null); setModalOpen(true); };
    const openEdit = (p) => { setEditing(p); setForm({ codigo: p.codigo || '', nombre: p.nombre, descripcion: p.descripcion || '', categoria_id: p.categoria_id || '', proveedor_id: p.proveedor_id || '', precio_compra: p.precio_compra, precio_venta: p.precio_venta, stock: p.stock, stock_minimo: p.stock_minimo, unidad: p.unidad }); setImageFile(null); setModalOpen(true); };

    const handleSave = async () => {
        if (!form.nombre || !form.precio_venta) return toast.error('Nombre y precio de venta son requeridos');
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => { if (v !== '') fd.append(k, v); });
            if (imageFile) fd.append('imagen', imageFile);
            if (editing) { await api.put(`/productos/${editing.id}`, fd); toast.success('Producto actualizado'); }
            else { await api.post('/productos', fd); toast.success('Producto creado'); }
            setModalOpen(false); load();
        } catch (err) { toast.error(err.response?.data?.msg || 'Error al guardar'); }
    };

    const handleDelete = async () => {
        try { await api.delete(`/productos/${selectedId}`); toast.success('Producto eliminado'); load(); }
        catch (err) { toast.error('Error al eliminar'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="page-title" style={{ marginBottom: 0 }}><Package size={22} />Productos</div>
                <button id="btn-nuevo-producto" className="btn btn-primary" onClick={openCreate}><Plus size={15} />Nuevo Producto</button>
            </div>
            <div className="card">
                <div className="toolbar">
                    <div className="search-box" style={{ flex: 1 }}>
                        <Search size={15} />
                        <input className="form-control" placeholder="Buscar por nombre o código..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 13, marginRight: 8 }}>
                        <Barcode size={18} />
                        <span style={{ display: 'none' }} className="d-sm-inline">Lector Activo</span>
                    </div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio Compra</th><th>Precio Venta</th><th>Stock</th><th>Unidad</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id}>
                                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{p.codigo || '—'}</td>
                                    <td><strong>{p.nombre}</strong></td>
                                    <td>{p.categoria?.nombre || '—'}</td>
                                    <td>S/ {parseFloat(p.precio_compra).toFixed(2)}</td>
                                    <td><strong style={{ color: 'var(--accent-light)' }}>S/ {parseFloat(p.precio_venta).toFixed(2)}</strong></td>
                                    <td><span className={p.stock <= p.stock_minimo ? 'text-danger font-bold' : 'text-success'}>{p.stock}</span></td>
                                    <td>{p.unidad}</td>
                                    <td><span className={`badge ${p.activo ? 'badge-success' : 'badge-danger'}`}>{p.activo ? 'Activo' : 'Inactivo'}</span></td>
                                    <td style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn-icon edit" onClick={() => openEdit(p)}><Edit size={14} /></button>
                                        <button className="btn-icon del" onClick={() => { setSelectedId(p.id); setConfirmOpen(true); }}><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>No se encontraron productos</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">{editing ? 'Editar Producto' : 'Nuevo Producto'}</div>
                            <button className="modal-close" onClick={() => setModalOpen(false)}><X /></button>
                        </div>
                        <div className="modal-body">
                            <div className="form-row">
                                <div className="form-group"><label>Código SKU</label><input className="form-control" value={form.codigo} onChange={e => setForm({ ...form, codigo: e.target.value })} placeholder="Opcional" /></div>
                                <div className="form-group"><label>Nombre *</label><input className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre del producto" /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Categoría</label>
                                    <select className="form-control" value={form.categoria_id} onChange={e => setForm({ ...form, categoria_id: e.target.value })}>
                                        <option value="">Sin categoría</option>
                                        {categorias.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                                    </select>
                                </div>
                                <div className="form-group"><label>Proveedor</label>
                                    <select className="form-control" value={form.proveedor_id} onChange={e => setForm({ ...form, proveedor_id: e.target.value })}>
                                        <option value="">Sin proveedor</option>
                                        {proveedores.map(p => <option key={p.id} value={p.id}>{p.empresa}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row-3">
                                <div className="form-group"><label>Precio Compra</label><input type="number" className="form-control" value={form.precio_compra} onChange={e => setForm({ ...form, precio_compra: e.target.value })} /></div>
                                <div className="form-group"><label>Precio Venta *</label><input type="number" className="form-control" value={form.precio_venta} onChange={e => setForm({ ...form, precio_venta: e.target.value })} /></div>
                                <div className="form-group"><label>Unidad</label>
                                    <select className="form-control" value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })}>
                                        {UNIDADES.map(u => <option key={u} value={u}>{u}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Stock Actual</label><input type="number" className="form-control" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} /></div>
                                <div className="form-group"><label>Stock Mínimo</label><input type="number" className="form-control" value={form.stock_minimo} onChange={e => setForm({ ...form, stock_minimo: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label>Descripción</label><textarea className="form-control" rows={2} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
                            <div className="form-group">
                                <label>Imagen</label>
                                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => setImageFile(e.target.files[0])} />
                                <button className="btn btn-secondary btn-sm" onClick={() => fileRef.current.click()}><Plus size={13} />{imageFile ? imageFile.name : 'Seleccionar imagen'}</button>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>Guardar Producto</button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="¿Eliminar producto?" message="El producto será desactivado del catálogo." />
        </div>
    );
}
