import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Productos from './pages/Productos';
import Categorias from './pages/Categorias';
import Clientes from './pages/Clientes';
import Proveedores from './pages/Proveedores';
import Ventas from './pages/Ventas';
import Devoluciones from './pages/Devoluciones';
import Cotizaciones from './pages/Cotizaciones';
import Compras from './pages/Compras';
import Caja from './pages/Caja';
import CuentasCobrar from './pages/CuentasCobrar';
import CuentasPagar from './pages/CuentasPagar';
import Inventario from './pages/Inventario';
import Reportes from './pages/Reportes';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import Logs from './pages/Logs';
import Mantenimiento from './pages/Mantenimiento';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="pos" element={<POS />} />
                    <Route path="productos" element={<Productos />} />
                    <Route path="categorias" element={<Categorias />} />
                    <Route path="clientes" element={<Clientes />} />
                    <Route path="proveedores" element={<Proveedores />} />
                    <Route path="ventas" element={<Ventas />} />
                    <Route path="devoluciones" element={<Devoluciones />} />
                    <Route path="cotizaciones" element={<Cotizaciones />} />
                    <Route path="compras" element={<Compras />} />
                    <Route path="caja" element={<Caja />} />
                    <Route path="cuentas-cobrar" element={<CuentasCobrar />} />
                    <Route path="cuentas-pagar" element={<CuentasPagar />} />
                    <Route path="inventario" element={<Inventario />} />
                    <Route path="reportes" element={<Reportes />} />
                    <Route path="usuarios" element={<Usuarios />} />
                    <Route path="configuracion" element={<Configuracion />} />
                    <Route path="logs" element={<Logs />} />
                    <Route path="mantenimiento" element={<Mantenimiento />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
