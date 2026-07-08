import { useState, useEffect } from 'react';
import { FileBarChart, Download, FileSpreadsheet, PackageSearch, Landmark, FileText, BadgeDollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Reportes() {
    const [filtros, setFiltros] = useState({ desde: '', hasta: '' });
    const [resumen, setResumen] = useState(null);
    const [loading, setLoading] = useState(false);

    // Colocar el periodo del mes actual por defecto
    useEffect(() => {
        const d = new Date();
        const y = d.getFullYear(); const m = String(d.getMonth() + 1).padStart(2, '0');
        const ultimoDia = new Date(y, d.getMonth() + 1, 0).getDate();
        setFiltros({ desde: `${y}-${m}-01`, hasta: `${y}-${m}-${ultimoDia}` });
    }, []);

    const cargarResumen = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filtros.desde) params.append('desde', filtros.desde);
            if (filtros.hasta) params.append('hasta', filtros.hasta);
            const r = await api.get(`/reportes/ventas?${params}`);
            setResumen(r.data);
            if (r.data.cantidad_ventas === 0) toast('No se encontraron transacciones en dichas fechas.');
        } catch { toast.error('Error al cargar métricas de ventas'); }
        finally { setLoading(false); }
    };

    const exportar = (tipo) => {
        const params = new URLSearchParams();
        if (filtros.desde && tipo.includes('ventas')) params.append('desde', filtros.desde);
        if (filtros.hasta && tipo.includes('ventas')) params.append('hasta', filtros.hasta);

        let urlDescarga = '';
        let fileName = '';

        if (tipo === 'ventas-excel') {
            urlDescarga = `/api/reportes/exportar-excel?${params}`;
            fileName = 'Libro_Consolidado_Financiero.xlsx';
        } else if (tipo === 'ventas-pdf') {
            urlDescarga = `/api/reportes/exportar-pdf?${params}`;
            fileName = 'Resumen_Ventas_y_Egresos.pdf';
        } else if (tipo === 'inventario-excel') {
            urlDescarga = `/api/reportes/exportar-inventario-excel`;
            fileName = 'Inventario_Valorizado.xlsx';
        } else if (tipo === 'inventario-pdf') {
            urlDescarga = `/api/reportes/exportar-inventario-pdf`;
            fileName = 'Inventario_Valorizado.pdf';
        }

        const a = document.createElement('a');
        a.href = urlDescarga;
        a.download = fileName; // El Backend define el nombre en el Disposition header usualmente, pero como es GET directo del anchor lo fuerza local si usamos react-router links, aquí el a.href gatilla la descarga nativa del navegador.
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`Exportación iniciada... Revise sus Descargas.`);
    };

    return (
        <div>
            <div className="page-title"><FileBarChart size={24} /> Centro de Reportes y Descargas</div>

            <div className="grid grid-2" style={{ gap: 24, marginBottom: 24 }}>

                {/* Panel 1: Financiero */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-color)' }}>
                        <Landmark size={20} /> Libro Mayor Financiero
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                        Extrae ingresos de Caja Diaria, egresos para proveedores, deudores vencidos (CxC) y las obligaciones que tienes con proveedores (CxP), clasificado por el período seleccionado.
                    </p>

                    <div style={{ background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, marginBottom: 16 }}>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 140 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>Emisión Desde</label>
                                <input type="date" className="form-control" value={filtros.desde} onChange={e => setFiltros({ ...filtros, desde: e.target.value })} />
                            </div>
                            <div className="form-group" style={{ margin: 0, flex: 1, minWidth: 140 }}>
                                <label style={{ fontSize: 11, fontWeight: 700, opacity: 0.7 }}>Emisión Hasta</label>
                                <input type="date" className="form-control" value={filtros.hasta} onChange={e => setFiltros({ ...filtros, hasta: e.target.value })} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                        <button className="btn btn-primary" style={{ flex: 1 }} onClick={cargarResumen} disabled={loading}>
                            {loading ? 'Calculando...' : <><BadgeDollarSign size={16} /> Resumen en Pantalla</>}
                        </button>
                        <button className="btn" style={{ background: '#16A34A', color: 'white' }} onClick={() => exportar('ventas-excel')}>
                            <FileSpreadsheet size={16} /> Excel Maestro
                        </button>
                        <button className="btn" style={{ background: '#DC2626', color: 'white' }} onClick={() => exportar('ventas-pdf')}>
                            <FileText size={16} /> Docs PDF
                        </button>
                    </div>
                </div>

                {/* Panel 2: Almacén */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-light)' }}>
                        <PackageSearch size={20} /> Auditoría de Almacén
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
                        A diferencia del reporte financiero, el recuento de mercadería no obedece a épocas pasadas sino al **Stock exacto del momento actual**. Calcula tu capital almacenado en Soles.
                    </p>

                    <div className="empty-state" style={{ padding: '24px 0', border: '1px dashed var(--border-color)', borderRadius: 8, marginBottom: 16 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 500 }}><span style={{ color: 'var(--success-color)' }}>●</span> Se auditará el estado actual de los depósitos.</p>
                    </div>

                    <div style={{ display: 'flex', gap: 12, marginTop: 'auto' }}>
                        <button className="btn" style={{ flex: 1, background: '#16A34A', color: 'white', borderColor: '#16A34A' }} onClick={() => exportar('inventario-excel')}>
                            <FileSpreadsheet size={16} /> Descargar Stock Múltiple (Excel)
                        </button>
                        <button className="btn" style={{ background: '#DC2626', color: 'white' }} onClick={() => exportar('inventario-pdf')}>
                            <Download size={16} /> PDF
                        </button>
                    </div>
                </div>
            </div>

            {/* Fila Inferior: Previsualización de Resumen de Caja Rápida */}
            {resumen !== null && (
                <div style={{ marginTop: 24 }}>
                    <h3 style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16 }}>Previsualización del Período Estipulado</h3>
                    <div className="grid grid-3">
                        <div className="gradient-card purple">
                            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>Ventas Brutas (+IGV)</div>
                            <div style={{ fontSize: 32, fontWeight: 800 }}>S/ {parseFloat(resumen.total_ventas || 0).toFixed(2)}</div>
                        </div>
                        <div className="gradient-card pink">
                            <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>Impuesto de Ingresos Identificado</div>
                            <div style={{ fontSize: 32, fontWeight: 800 }}>S/ {parseFloat(resumen.total_igv || 0).toFixed(2)}</div>
                        </div>
                        <div className="stat-card">
                            <div className="label">Volumen Operativo</div>
                            <div className="value">{resumen.cantidad_ventas || 0}</div>
                            <div className="sub">Transacciones contables generadas</div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
