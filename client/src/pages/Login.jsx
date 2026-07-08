import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wrench, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import useAuthStore from '../store/authStore';

export default function Login() {
    const [form, setForm] = useState({ email: '', password: '' });
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.email || !form.password) return toast.error('Complete todos los campos');
        setLoading(true);
        try {
            const { data } = await api.post('/auth/login', form);
            login(data.token, data.usuario);
            toast.success(`¡Bienvenido, ${data.usuario.nombre}!`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Credenciales incorrectas');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <div className="login-logo">
                    <div className="login-logo-icon"><Wrench size={30} color="white" /></div>
                    <h1>Sistema Ferretería</h1>
                    <p>Ingresa tus credenciales para continuar</p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <div style={{ position: 'relative' }}>
                            <input id="email" className="form-control" type="email" placeholder="admin@ferreteria.com"
                                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                style={{ paddingLeft: '36px' }} />
                            <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <div style={{ position: 'relative' }}>
                            <input id="password" className="form-control" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
                                style={{ paddingLeft: '36px', paddingRight: '40px' }} />
                            <Lock size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <button type="button" onClick={() => setShowPass(!showPass)}
                                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                            </button>
                        </div>
                    </div>
                    <button id="btn-login" className="btn btn-primary btn-lg w-full" type="submit" disabled={loading} style={{ marginTop: 8 }}>
                        {loading ? <><div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />Ingresando...</> : 'Ingresar al Sistema'}
                    </button>
                </form>
                <div style={{ marginTop: 20, padding: '12px', background: 'rgba(124,58,237,0.08)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
                    Admin: <strong style={{ color: 'var(--accent-light)' }}>admin@ferreteria.com</strong> / <strong style={{ color: 'var(--accent-light)' }}>admin123</strong>
                </div>
            </div>
        </div>
    );
}
