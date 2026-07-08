import { useState, useEffect } from 'react';
import {
    TrendingUp, Package, DollarSign, Users,
    AlertTriangle, ShoppingCart
} from 'lucide-react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, Filler, ArcElement
} from 'chart.js';
import api from '../api/axios';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, Title, Tooltip, Legend, Filler, ArcElement
);

/* =====================================================================
   Helpers
   ===================================================================== */
function Bar3D({ color1, color2, heights, labels }) {
    return (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, justifyContent: 'center', height: 130, paddingBottom: 20, position: 'relative' }}>
            {heights.map((h, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                    {/* Doble barra tipo 3D */}
                    <div style={{ display: 'flex', gap: 3, alignItems: 'flex-end' }}>
                        <div style={{
                            width: 14, height: h * 1.1,
                            borderRadius: '6px 6px 3px 3px',
                            background: color1,
                            boxShadow: '2px -2px 0 rgba(255,255,255,0.35) inset',
                        }} />
                        <div style={{
                            width: 14, height: h * 0.85,
                            borderRadius: '6px 6px 3px 3px',
                            background: color2,
                            boxShadow: '2px -2px 0 rgba(255,255,255,0.35) inset',
                        }} />
                    </div>
                    <span style={{ fontSize: 9.5, color: '#9ca3af', fontWeight: 600, whiteSpace: 'nowrap', textAlign: 'center' }}>{labels[i]}</span>
                </div>
            ))}
        </div>
    );
}

function DonutChart({ pct, color, size = 120, strokeWidth = 14 }) {
    const r = (size - strokeWidth) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (pct / 100) * circ;
    return (
        <div style={{ position: 'relative', width: size, height: size }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke="#e9e9f5" strokeWidth={strokeWidth} />
                <circle cx={size / 2} cy={size / 2} r={r}
                    fill="none" stroke={color} strokeWidth={strokeWidth}
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.8s ease' }}
                />
            </svg>
            <div style={{
                position: 'absolute', inset: 0, display: 'flex',
                flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: '#1e1b4b' }}>{pct}%</span>
            </div>
        </div>
    );
}

function CircleDots({ total = 6, active = 4, color }) {
    return (
        <div style={{ display: 'flex', gap: 5 }}>
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: i < active ? color : '#e5e7eb',
                    boxShadow: i < active ? `0 2px 6px ${color}55` : 'none',
                    transition: 'all 0.3s'
                }} />
            ))}
        </div>
    );
}

/* =====================================================================
   Dashboard
   ===================================================================== */
export default function Dashboard() {
    const [stats, setStats] = useState({
        totalVentas: 0, totalProductos: 0, totalClientes: 0,
        cajaAbierta: false, ventasHoy: 0, totalCompras: 0
    });
    const [dashData, setDashData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/dashboard')
            .then(res => {
                const data = res.data;
                setStats({
                    totalVentas: data.kpis.ventasHoyMonto,
                    totalProductos: data.kpis.totalProductos,
                    totalClientes: data.kpis.totalClientes,
                    cajaAbierta: data.kpis.cajaAbierta,
                    ventasHoy: data.kpis.ventasHoy,
                    totalCompras: data.distribucion.compras
                });
                setDashData(data);
            })
            .catch(err => {
                console.error(err);
                if (err.response?.status !== 401) {
                    toast.error('Error al conectar con el servidor.');
                }
            })
            .finally(() => setLoading(false));
    }, []);

    /* Gráfico de línea (área amarilla) */
    const lineData = {
        labels: dashData?.tendenciaVentas?.fechas.map(f => new Date(f).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', timeZone: 'UTC' })) || ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
        datasets: [{
            label: 'Ventas S/',
            data: dashData?.tendenciaVentas?.totales || [0, 0, 0, 0, 0, 0, 0],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245,158,11,0.15)',
            tension: 0.45, fill: true,
            pointBackgroundColor: '#7c3aed',
            pointBorderColor: '#fff', pointBorderWidth: 2, pointRadius: 4,
        }]
    };
    const lineOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { color: '#9ca3af', font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
            y: { ticks: { color: '#9ca3af', font: { size: 9 } }, grid: { color: 'rgba(0,0,0,0.04)' } }
        }
    };

    /* Gráfico de barras verde (derecha arriba) */
    const compFechasFormat = dashData?.comparativa6Dias?.fechas.map(f => new Date(f).toLocaleDateString('es-PE', { day: 'numeric', month: 'numeric', timeZone: 'UTC' })) || [];

    const barGreenData = {
        labels: compFechasFormat,
        datasets: [{
            data: dashData?.comparativa6Dias?.ventas || [],
            backgroundColor: '#14b8a6',
            borderRadius: 5, barThickness: 12,
        }]
    };
    /* Gráfico de barras amarillo (derecha) */
    const barYellowData = {
        labels: compFechasFormat,
        datasets: [{
            data: dashData?.comparativa6Dias?.compras || [],
            backgroundColor: '#f59e0b',
            borderRadius: 5, barThickness: 12,
        }]
    };
    const miniBarOpts = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return 'S/ ' + c.raw.toFixed(2); } } } },
        scales: {
            x: { ticks: { color: '#9ca3af', font: { size: 8 } }, grid: { display: false } },
            y: { ticks: { color: '#9ca3af', font: { size: 8 } }, grid: { color: 'rgba(0,0,0,0.04)' } }
        }
    };

    /* Donut multicolor (leyenda) */
    const distData = dashData?.distribucion || { ventas: 0, compras: 0, margen: 0 };
    const maxValDist = Math.max(1, distData.ventas + distData.compras + distData.margen);
    const distribucionPct = {
        ventas: Math.round((distData.ventas / maxValDist) * 100) || 0,
        compras: Math.round((distData.compras / maxValDist) * 100) || 0,
        margen: Math.round((distData.margen / maxValDist) * 100) || 0
    };

    const donutMultiData = {
        datasets: [{
            data: [distData.ventas, distData.compras, distData.margen],
            backgroundColor: ['#7c3aed', '#14b8a6', '#c084fc'],
            borderWidth: 0, cutout: '60%',
        }]
    };
    const donutOpts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } };

    if (loading) return <div className="loading-center"><div className="spinner" /></div>;
    if (!dashData) return (
        <div className="empty-state" style={{ padding: '40px', marginTop: 20 }}>
            <AlertTriangle size={40} color="#f59e0b" style={{ marginBottom: 10 }} />
            <h3>No se pudo cargar el Dashboard</h3>
            <p>Por favor intente recargar la página. Verifique su conexión y que el servidor se encuentre en ejecución.</p>
        </div>
    );

    /* Barras 3D heights */
    const topCats = dashData.ventasPorCategoria || [];
    const maxCatTotal = Math.max(...topCats.map(c => parseFloat(c.total_vendido)), 1);

    // Normalizar alturas para el gráfico 3D (max 130px de contenedor visual)
    const bar3dH = topCats.map(c => Math.max(10, (parseFloat(c.total_vendido) / maxCatTotal) * 90));
    const bar3dL = topCats.map(c => c.categoria ? (c.categoria.length > 8 ? c.categoria.substring(0, 8) + '.' : c.categoria) : 'Varios');

    if (bar3dH.length === 0) { bar3dH.push(10); bar3dL.push('Sin data'); }

    /* Progress bars */
    const coloresStock = ['purple', 'pink', 'green', 'yellow', 'blue'];
    const progItems = (dashData?.stockCritico || []).slice(0, 3).map((p, i) => {
        const pct = Math.round((p.stock / Math.max(p.stock_minimo, 1)) * 100);
        return {
            label: `${p.stock} u.`, pct: Math.min(Math.max(pct, 5), 100),
            color: coloresStock[i], name: p.nombre.length > 25 ? p.nombre.substring(0, 25) + '...' : p.nombre
        }
    });

    /* Burbuja stats (Últimas Ventas List)*/
    const ultVentasList = dashData?.ultimasVentas || [];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* ============= FILA 1 ============= */}
            <div className="dash-grid-4">

                {/* [1] Barras 3D tipo cilindro */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 6 }}>Ventas por Categoría</div>
                    <Bar3D
                        color1="#14b8a6" color2="#c084fc"
                        heights={bar3dH} labels={bar3dL}
                    />
                </div>

                {/* [2] Donut 76% */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <DonutChart pct={stats.cajaAbierta ? 76 : 30} color="#f59e0b" size={130} strokeWidth={16} />
                    <div style={{ marginTop: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e1b4b' }}>Estado Caja</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>
                            {stats.cajaAbierta ? 'Operativa' : 'Cerrada'}
                        </div>
                    </div>
                </div>

                {/* [3] Donut 53% */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <DonutChart pct={53} color="#c084fc" size={130} strokeWidth={16} />
                    <div style={{ marginTop: 10, textAlign: 'center' }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#1e1b4b' }}>Stock Uso</div>
                        <div style={{ fontSize: 11, color: '#9ca3af' }}>Del inventario</div>
                    </div>
                </div>

                {/* [4] Stats verticales */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="card-title" style={{ marginBottom: 6 }}>Estadísticas</div>
                    {[
                        { label: 'Ventas hoy', val: stats.ventasHoy, color: '#c026d3' },
                        { label: 'Productos', val: stats.totalProductos, color: '#14b8a6' },
                        { label: 'Clientes', val: stats.totalClientes, color: '#f59e0b' },
                        { label: 'Stock bajo', val: dashData?.stockCritico?.length || 0, color: '#ec4899' },
                    ].map((s, i) => (
                        <div key={i} style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '7px 10px', borderRadius: 8,
                            background: `${s.color}10`, borderLeft: `3px solid ${s.color}`,
                        }}>
                            <span style={{ fontSize: 11.5, color: '#6b7280', fontWeight: 500 }}>{s.label}</span>
                            <span style={{ fontSize: 15, fontWeight: 800, color: s.color }}>{s.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ============= FILA 2 ============= */}
            <div className="dash-grid-3">

                {/* [1] Gráfico de área (línea amarilla) */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 8 }}>Tendencia de Ventas</div>
                    <div style={{ height: 160 }}>
                        <Line data={lineData} options={lineOpts} />
                    </div>
                </div>

                {/* [2] Progress bars + burbuja stats */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 10 }}>Stock Crítico</div>
                    {progItems.map((p, i) => (
                        <div key={i} style={{ marginBottom: 12 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 11.5, color: '#6b7280', fontWeight: 500 }}>{p.name}</span>
                                <span style={{ fontSize: 11, fontWeight: 700, color: '#1e1b4b' }}>{p.label}</span>
                            </div>
                            <div className="dash-progress-bar" style={{ height: 9 }}>
                                <div className={`dash-progress-fill ${p.color}`} style={{ width: `${p.pct}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* [3] Valores numéricos (bubble stats) */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 10 }}>Últimas Ventas</div>
                    {ultVentasList.length === 0 && (
                        <div className="empty-state" style={{ padding: '20px 0', fontSize: 12 }}>Sin registro de ventas</div>
                    )}
                    {ultVentasList.map((v, i) => {
                        const colors = ['#c084fc', '#ec4899', '#14b8a6', '#f59e0b', '#3b82f6'];
                        return (
                            <div key={v.id} style={{
                                display: 'flex', alignItems: 'center', gap: 10,
                                padding: '8px 0', borderBottom: i < ultVentasList.length - 1 ? '1px solid #f3f4f6' : 'none'
                            }}>
                                <div style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    background: `${colors[i]}20`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <div style={{ width: 16, height: 16, borderRadius: '50%', background: colors[i] }} />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 11.5, color: '#6b7280', lineHeight: 1.3 }}>
                                        {v.cliente?.nombre || 'Cliente general'}
                                        <div style={{ fontSize: 9, opacity: 0.6 }}>{new Date(v.created_at).toLocaleString('es-PE')}</div>
                                    </div>
                                </div>
                                <span style={{ fontSize: 16, fontWeight: 800, color: '#1e1b4b', flexShrink: 0 }}>
                                    S/ {parseFloat(v.total).toFixed(1)}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ============= FILA 3 ============= */}
            <div className="dash-grid-4-eq">

                {/* [1] Barras verdes verticales */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 6 }}>Ventas S/</div>
                    <div style={{ height: 140 }}>
                        <Bar data={barGreenData} options={miniBarOpts} />
                    </div>
                </div>

                {/* [2] Barras amarillas verticales */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 6 }}>Compras S/</div>
                    <div style={{ height: 140 }}>
                        <Bar data={barYellowData} options={miniBarOpts} />
                    </div>
                </div>

                {/* [3] Donut multicolor + leyenda */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 8 }}>Distribución</div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <div style={{ height: 90, width: 90, flexShrink: 0 }}>
                            <Doughnut data={donutMultiData} options={donutOpts} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {[
                                { label: 'Ventas', color: '#7c3aed', pct: distribucionPct.ventas + '%' },
                                { label: 'Compras', color: '#14b8a6', pct: distribucionPct.compras + '%' },
                                { label: 'Margen L.', color: '#c084fc', pct: distribucionPct.margen + '%' },
                            ].map((l, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 10, height: 10, borderRadius: 2, background: l.color, flexShrink: 0 }} />
                                    <span style={{ fontSize: 10.5, color: '#6b7280' }}>{l.label}</span>
                                    <span style={{ fontSize: 10.5, fontWeight: 700, color: '#1e1b4b', marginLeft: 'auto' }}>{l.pct}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* [4] Circle dots stats */}
                <div className="card">
                    <div className="card-title" style={{ marginBottom: 12 }}>Progreso</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#1e1b4b' }}>
                                    Caja: {stats.cajaAbierta ? '78%' : '10%'}
                                </span>
                            </div>
                            <CircleDots
                                total={6}
                                active={stats.cajaAbierta ? 5 : 1}
                                color="#14b8a6"
                            />
                        </div>
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                <span style={{ fontSize: 11.5, fontWeight: 600, color: '#1e1b4b' }}>
                                    Stock Real Sano: {Math.max(0, Math.round((1 - (dashData?.stockCritico?.length || 0) / Math.max(stats.totalProductos, 1)) * 100))}%
                                </span>
                            </div>
                            <CircleDots
                                total={6}
                                active={Math.max(1, 6 - Math.min((dashData?.stockCritico?.length || 0), 5))}
                                color="#ec4899"
                            />
                        </div>
                        <div style={{ paddingTop: 8, borderTop: '1px solid #f3f4f6' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#7c3aed' }}>
                                        S/{Math.round(stats.totalVentas).toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Ventas hoy</div>
                                </div>
                                <div style={{ textAlign: 'center' }}>
                                    <div style={{ fontSize: 18, fontWeight: 800, color: '#14b8a6' }}>
                                        {stats.totalProductos}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#9ca3af' }}>Productos</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
