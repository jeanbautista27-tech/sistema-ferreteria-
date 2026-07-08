import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Tag, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Categorias() {
    const [categorias, setCategorias] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ nombre: '', descripcion: '' });

    const load = () => api.get('/categorias').then(r => setCategorias(r.data.categorias));
    useEffect(() => { load(); }, []);

    const openCreate = () => { setEditing(null); setForm({ nombre: '', descripcion: '' }); setModalOpen(true); };
    const openEdit = (c) => { setEditing(c); setForm({ nombre: c.nombre, descripcion: c.descripcion || '' }); setModalOpen(true); };

    const handleSave = async () => {
        if (!form.nombre) return toast.error('El nombre es requerido');
        try {
            if (editing) { await api.put(`/categorias/${editing.id}`, form); toast.success('Categoría actualizada'); }
            else { await api.post('/categorias', form); toast.success('Categoría creada'); }
            setModalOpen(false); load();
        } catch (err) { toast.error(err.response?.data?.msg || 'Error'); }
    };

    const handleDelete = async () => {
        try { await api.delete(`/categorias/${selectedId}`); toast.success('Categoría eliminada'); load(); }
        catch { toast.error('Error al eliminar'); }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="page-title" style={{ marginBottom: 0 }}><Tag size={22} />Categorías</div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={15} />Nueva Categoría</button>
            </div>
            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>#</th><th>Nombre</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {categorias.map(c => (
                                <tr key={c.id}>
                                    <td style={{ color: 'var(--text-muted)' }}>{c.id}</td>
                                    <td><strong>{c.nombre}</strong></td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{c.descripcion || '—'}</td>
                                    <td><span className={`badge ${c.activo ? 'badge-success' : 'badge-danger'}`}>{c.activo ? 'Activo' : 'Inactivo'}</span></td>
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
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header"><div className="modal-title">{editing ? 'Editar Categoría' : 'Nueva Categoría'}</div><button className="modal-close" onClick={() => setModalOpen(false)}><X /></button></div>
                        <div className="modal-body">
                            <div className="form-group"><label>Nombre *</label><input className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Ej: Herramientas Eléctricas" /></div>
                            <div className="form-group"><label>Descripción</label><textarea className="form-control" rows={3} value={form.descripcion} onChange={e => setForm({ ...form, descripcion: e.target.value })} /></div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="¿Eliminar categoría?" message="Esta acción desactivará la categoría." />
        </div>
    );
}
