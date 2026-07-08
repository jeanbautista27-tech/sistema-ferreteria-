import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Truck, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Proveedores() {
    const [proveedores, setProveedores] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ empresa: '', ruc: '', contacto: '', telefono: '', email: '', direccion: '' });

    const load = () => api.get('/proveedores').then(r => setProveedores(r.data.proveedores));
    useEffect(() => { load(); }, []);

    const filtered = proveedores.filter(p => p.empresa.toLowerCase().includes(search.toLowerCase()) || p.ruc?.includes(search));
    const openCreate = () => { setEditing(null); setForm({ empresa: '', ruc: '', contacto: '', telefono: '', email: '', direccion: '' }); setModalOpen(true); };
    const openEdit = (p) => { setEditing(p); setForm({ empresa: p.empresa, ruc: p.ruc || '', contacto: p.contacto || '', telefono: p.telefono || '', email: p.email || '', direccion: p.direccion || '' }); setModalOpen(true); };

    const handleSave = async () => {
        if (!form.empresa) return toast.error('La razón social es requerida');
        try {
            if (editing) { await api.put(`/proveedores/${editing.id}`, form); toast.success('Proveedor actualizado'); }
            else { await api.post('/proveedores', form); toast.success('Proveedor creado'); }
            setModalOpen(false); load();
        } catch (err) { toast.error(err.response?.data?.msg || 'Error'); }
    };

    const handleDelete = async () => {
        try { await api.delete(`/proveedores/${selectedId}`); toast.success('Proveedor eliminado'); load(); }
        catch { toast.error('Error al eliminar'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="page-title" style={{ marginBottom: 0 }}><Truck size={22} />Proveedores</div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={15} />Nuevo Proveedor</button>
            </div>
            <div className="card">
                <div className="toolbar">
                    <div className="search-box" style={{ flex: 1 }}>
                        <Search size={15} />
                        <input className="form-control" placeholder="Buscar por empresa o RUC..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Empresa</th><th>RUC</th><th>Contacto</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {filtered.map(p => (
                                <tr key={p.id}>
                                    <td><strong>{p.empresa}</strong></td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{p.ruc || '—'}</td>
                                    <td>{p.contacto || '—'}</td>
                                    <td>{p.telefono || '—'}</td>
                                    <td>{p.email || '—'}</td>
                                    <td style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn-icon edit" onClick={() => openEdit(p)}><Edit size={14} /></button>
                                        <button className="btn-icon del" onClick={() => { setSelectedId(p.id); setConfirmOpen(true); }}><Trash2 size={14} /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modalOpen && (
                <div className="modal-overlay" onClick={() => setModalOpen(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><div className="modal-title">{editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}</div><button className="modal-close" onClick={() => setModalOpen(false)}><X /></button></div>
                        <div className="modal-body">
                            <div className="form-group"><label>Razón Social *</label><input className="form-control" value={form.empresa} onChange={e => setForm({ ...form, empresa: e.target.value })} /></div>
                            <div className="form-row">
                                <div className="form-group"><label>RUC</label><input className="form-control" value={form.ruc} onChange={e => setForm({ ...form, ruc: e.target.value })} /></div>
                                <div className="form-group"><label>Contacto</label><input className="form-control" value={form.contacto} onChange={e => setForm({ ...form, contacto: e.target.value })} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
                                <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                            </div>
                            <div className="form-group"><label>Dirección</label><input className="form-control" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="¿Eliminar proveedor?" message="El proveedor será desactivado." />
        </div>
    );
}
