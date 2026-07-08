import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Clientes() {
    const [clientes, setClientes] = useState([]);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ nombre: '', tipo_documento: 'DNI', numero_documento: '', telefono: '', email: '', direccion: '', tipo_cliente: 'Regular' });

    const load = () => api.get('/clientes').then(r => setClientes(r.data.clientes));
    useEffect(() => { load(); }, []);

    const filtered = clientes.filter(c => c.nombre.toLowerCase().includes(search.toLowerCase()) || c.numero_documento?.includes(search));
    const openCreate = () => { setEditing(null); setForm({ nombre: '', tipo_documento: 'DNI', numero_documento: '', telefono: '', email: '', direccion: '', tipo_cliente: 'Regular' }); setModalOpen(true); };
    const openEdit = (c) => { setEditing(c); setForm({ nombre: c.nombre, tipo_documento: c.tipo_documento, numero_documento: c.numero_documento || '', telefono: c.telefono || '', email: c.email || '', direccion: c.direccion || '', tipo_cliente: c.tipo_cliente }); setModalOpen(true); };

    const handleSave = async () => {
        if (!form.nombre) return toast.error('El nombre es requerido');
        try {
            if (editing) { await api.put(`/clientes/${editing.id}`, form); toast.success('Cliente actualizado'); }
            else { await api.post('/clientes', form); toast.success('Cliente creado'); }
            setModalOpen(false); load();
        } catch (err) { toast.error(err.response?.data?.msg || 'Error'); }
    };

    const handleDelete = async () => {
        try { await api.delete(`/clientes/${selectedId}`); toast.success('Cliente eliminado'); load(); }
        catch { toast.error('Error al eliminar'); }
    };

    const tipoBadge = { Regular: 'badge-purple', Mayorista: 'badge-info', VIP: 'badge-pink' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="page-title" style={{ marginBottom: 0 }}><Users size={22} />Clientes</div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={15} />Nuevo Cliente</button>
            </div>
            <div className="card">
                <div className="toolbar">
                    <div className="search-box" style={{ flex: 1 }}>
                        <Search size={15} />
                        <input className="form-control" placeholder="Buscar por nombre o documento..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Nombre</th><th>Documento</th><th>Teléfono</th><th>Email</th><th>Tipo</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {filtered.map(c => (
                                <tr key={c.id}>
                                    <td><strong>{c.nombre}</strong></td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{c.tipo_documento}: {c.numero_documento || '—'}</td>
                                    <td>{c.telefono || '—'}</td>
                                    <td>{c.email || '—'}</td>
                                    <td><span className={`badge ${tipoBadge[c.tipo_cliente] || 'badge-purple'}`}>{c.tipo_cliente}</span></td>
                                    <td style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn-icon edit" onClick={() => openEdit(c)}><Edit size={14} /></button>
                                        <button className="btn-icon del" onClick={() => { setSelectedId(c.id); setConfirmOpen(true); }}><Trash2 size={14} /></button>
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
                        <div className="modal-header"><div className="modal-title">{editing ? 'Editar Cliente' : 'Nuevo Cliente'}</div><button className="modal-close" onClick={() => setModalOpen(false)}><X /></button></div>
                        <div className="modal-body">
                            <div className="form-group"><label>Nombre *</label><input className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Tipo Documento</label>
                                    <select className="form-control" value={form.tipo_documento} onChange={e => setForm({ ...form, tipo_documento: e.target.value })}>
                                        <option value="DNI">DNI</option><option value="RUC">RUC</option><option value="CE">CE</option>
                                    </select>
                                </div>
                                <div className="form-group"><label>N° Documento</label><input className="form-control" value={form.numero_documento} onChange={e => setForm({ ...form, numero_documento: e.target.value })} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Teléfono</label><input className="form-control" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></div>
                                <div className="form-group"><label>Email</label><input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Dirección</label><input className="form-control" value={form.direccion} onChange={e => setForm({ ...form, direccion: e.target.value })} /></div>
                                <div className="form-group"><label>Tipo Cliente</label>
                                    <select className="form-control" value={form.tipo_cliente} onChange={e => setForm({ ...form, tipo_cliente: e.target.value })}>
                                        <option value="Regular">Regular</option><option value="Mayorista">Mayorista</option><option value="VIP">VIP</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="¿Eliminar cliente?" message="El cliente será desactivado del sistema." />
        </div>
    );
}
