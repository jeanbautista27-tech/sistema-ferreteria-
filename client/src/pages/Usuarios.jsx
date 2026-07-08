import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Shield, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import ConfirmModal from '../components/ui/ConfirmModal';

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [roles, setRoles] = useState([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ nombre: '', email: '', password: '', rol_id: '' });

    const load = () => api.get('/usuarios').then(r => setUsuarios(r.data.usuarios));
    useEffect(() => {
        load();
        api.get('/usuarios/roles').then(r => setRoles(r.data.roles));
    }, []);

    const openCreate = () => { setEditing(null); setForm({ nombre: '', email: '', password: '', rol_id: '' }); setModalOpen(true); };
    const openEdit = (u) => { setEditing(u); setForm({ nombre: u.nombre, email: u.email, password: '', rol_id: u.rol_id }); setModalOpen(true); };

    const handleSave = async () => {
        if (!form.nombre || !form.email || !form.rol_id) return toast.error('Completa los campos requeridos');
        if (!editing && !form.password) return toast.error('La contraseña es requerida para nuevos usuarios');
        try {
            if (editing) { await api.put(`/usuarios/${editing.id}`, form); toast.success('Usuario actualizado'); }
            else { await api.post('/usuarios', form); toast.success('Usuario creado'); }
            setModalOpen(false); load();
        } catch (err) { toast.error(err.response?.data?.msg || 'Error'); }
    };

    const handleDelete = async () => {
        try { await api.delete(`/usuarios/${selectedId}`); toast.success('Usuario desactivado'); load(); }
        catch { toast.error('Error al eliminar'); }
    };

    const rolBadge = { Administrador: 'badge-purple', Cajero: 'badge-info', Almacenero: 'badge-warning' };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div className="page-title" style={{ marginBottom: 0 }}><Shield size={22} />Usuarios</div>
                <button className="btn btn-primary" onClick={openCreate}><Plus size={15} />Nuevo Usuario</button>
            </div>
            <div className="card">
                <div className="table-wrapper">
                    <table>
                        <thead><tr><th>Nombre</th><th>Email</th><th>Rol</th><th>Último Login</th><th>Estado</th><th>Acciones</th></tr></thead>
                        <tbody>
                            {usuarios.map(u => (
                                <tr key={u.id}>
                                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>{u.nombre[0]}</div><strong>{u.nombre}</strong></div></td>
                                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                                    <td><span className={`badge ${rolBadge[u.rol?.nombre] || 'badge-purple'}`}>{u.rol?.nombre}</span></td>
                                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{u.ultimo_login ? new Date(u.ultimo_login).toLocaleString('es-PE') : 'Nunca'}</td>
                                    <td><span className={`badge ${u.activo ? 'badge-success' : 'badge-danger'}`}>{u.activo ? 'Activo' : 'Inactivo'}</span></td>
                                    <td style={{ display: 'flex', gap: 6 }}>
                                        <button className="btn-icon edit" onClick={() => openEdit(u)}><Edit size={14} /></button>
                                        <button className="btn-icon del" onClick={() => { setSelectedId(u.id); setConfirmOpen(true); }}><Trash2 size={14} /></button>
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
                        <div className="modal-header"><div className="modal-title">{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</div><button className="modal-close" onClick={() => setModalOpen(false)}><X /></button></div>
                        <div className="modal-body">
                            <div className="form-group"><label>Nombre *</label><input className="form-control" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} /></div>
                            <div className="form-group"><label>Email *</label><input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></div>
                            <div className="form-group"><label>{editing ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label><input type="password" className="form-control" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} /></div>
                            <div className="form-group"><label>Rol *</label>
                                <select className="form-control" value={form.rol_id} onChange={e => setForm({ ...form, rol_id: e.target.value })}>
                                    <option value="">Seleccionar rol...</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.nombre}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
                            <button className="btn btn-primary" onClick={handleSave}>Guardar</button>
                        </div>
                    </div>
                </div>
            )}
            <ConfirmModal isOpen={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} title="¿Desactivar usuario?" message="El usuario perderá el acceso al sistema." />
        </div>
    );
}
