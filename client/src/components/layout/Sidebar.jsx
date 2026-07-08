import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, ShoppingCart, Package, Tag, Users, Truck,
    TrendingUp, DollarSign, Warehouse, FileBarChart, Settings, Shield,
    LogOut, RotateCcw, X, HardDrive
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/pos', icon: ShoppingCart, label: 'Punto de Venta' },
    { to: '/productos', icon: Package, label: 'Productos' },
    { to: '/categorias', icon: Tag, label: 'Categorías' },
    { to: '/inventario', icon: Warehouse, label: 'Inventario' },
    { to: '/compras', icon: Truck, label: 'Compras' },
    { to: '/proveedores', icon: Truck, label: 'Proveedores' },
    { to: '/ventas', icon: TrendingUp, label: 'Ventas' },
    { to: '/devoluciones', icon: RotateCcw, label: 'Devoluciones / NC' },
    { to: '/clientes', icon: Users, label: 'Clientes' },
    { to: '/caja', icon: DollarSign, label: 'Caja' },
    { to: '/reportes', icon: FileBarChart, label: 'Reportes' },
    { to: '/usuarios', icon: Shield, label: 'Usuarios' },
    { to: '/configuracion', icon: Settings, label: 'Configuración' },
    { to: '/mantenimiento', icon: HardDrive, label: 'Mantenimiento' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
    const { usuario, logout } = useAuthStore();
    const navigate = useNavigate();

    const [empresa, setEmpresa] = useState({ nombre: 'Ferretería', logo: null });

    useEffect(() => {
        api.get('/configuracion')
            .then(r => {
                const cfg = r.data.configuracion || {};
                setEmpresa({
                    nombre: cfg.empresa_nombre || 'Ferretería',
                    logo: cfg.empresa_logo || null,
                });
            })
            .catch(() => { });
    }, []);

    const handleLogout = () => {
        logout();
        toast.success('Sesión cerrada');
        navigate('/login');
    };

    return (
        <>
            {/* Backdrop oscuro para móvil cuando está abierto */}
            {isOpen && (
                <div
                    className="sidebar-backdrop"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* ===== LOGO + NOMBRE EMPRESA ===== */}
                <div className="sidebar-logo">
                    {empresa.logo ? (
                        <img
                            src={`/uploads/${empresa.logo}`}
                            alt="Logo empresa"
                            style={{
                                width: 38, height: 38, borderRadius: '50%',
                                objectFit: 'cover', flexShrink: 0,
                                border: '2px solid rgba(255,255,255,0.4)',
                                boxShadow: '0 3px 10px rgba(0,0,0,0.25)',
                            }}
                        />
                    ) : (
                        <div className="sidebar-logo-icon">
                            {empresa.nombre.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                            fontSize: 12, fontWeight: 800, color: 'white',
                            lineHeight: 1.25, wordBreak: 'break-word',
                        }}>
                            {empresa.nombre}
                        </div>
                        <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                            Sistema de Gestión
                        </div>
                    </div>
                    {/* Botón X para cerrar el Drawer en móvil */}
                    <button className="sidebar-close-btn" onClick={() => setIsOpen && setIsOpen(false)}>
                        <X size={16} />
                    </button>
                </div>

                <div className="sidebar-heading">MENÚ</div>

                <nav className="sidebar-nav">
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                        >
                            <item.icon size={18} />
                            <span>{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Tarjeta inferior de stats */}
                <div className="sidebar-stat-card">
                    <div className="sidebar-stat-icon">
                        <Settings size={22} />
                    </div>
                    <div className="sidebar-stat-label">
                        {usuario?.nombre || 'Sistema'}
                    </div>
                    <div className="sidebar-stat-value">
                        {usuario?.rol || 'Admin'}
                    </div>
                </div>

                <div className="sidebar-footer">
                    <div className="user-info">
                        <div className="user-avatar">{usuario?.nombre?.[0]?.toUpperCase() || 'A'}</div>
                        <div className="user-details">
                            <div className="user-name">{usuario?.nombre || 'Usuario'}</div>
                            <div className="user-role">{usuario?.rol || 'Rol'}</div>
                        </div>
                        <button className="logout-btn" onClick={handleLogout} title="Cerrar sesión">
                            <LogOut size={15} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
