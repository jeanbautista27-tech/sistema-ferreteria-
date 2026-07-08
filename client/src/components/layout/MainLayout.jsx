import { Outlet, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './Sidebar';
import useAuthStore from '../../store/authStore';
import { Menu } from 'lucide-react';

const pageNames = {
    '/': 'Dashboard', '/pos': 'Punto de Venta', '/productos': 'Productos',
    '/categorias': 'Categorías', '/clientes': 'Clientes', '/proveedores': 'Proveedores',
    '/ventas': 'Historial de Ventas', '/compras': 'Compras', '/caja': 'Caja',
    '/inventario': 'Inventario', '/reportes': 'Reportes', '/usuarios': 'Usuarios',
    '/configuracion': 'Configuración', '/logs': 'Logs del Sistema'
};


export default function MainLayout() {
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const usuario = useAuthStore(s => s.usuario);
    const pageName = pageNames[location.pathname] || 'Ferretería';

    return (
        <div className="app-layout">
            <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
            <div className="main-content">
                {/* ===== TOP NAV ===== */}
                <header className="header">
                    {/* Nombre del módulo activo */}
                    <div style={{
                        fontSize: 17, fontWeight: 800, color: 'var(--text-primary)',
                        letterSpacing: '-0.3px',
                    }}>
                        {pageName}
                    </div>

                    {/* Iconos derecha */}
                    <div className="header-right">
                        <button className="header-menu-btn" title="Menú Móvil" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={20} />
                        </button>
                    </div>
                </header>

                {/* ===== CONTENIDO ===== */}
                <div className="page-wrapper">
                    <Outlet />
                </div>
            </div>
        </div>
    );
}
