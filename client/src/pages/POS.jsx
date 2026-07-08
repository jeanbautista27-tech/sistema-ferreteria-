import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Search, Trash2, ShoppingCart, Plus, Minus, Package, Printer, CheckCircle, Barcode, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import TicketVenta from '../components/ventas/TicketVenta';
import TicketCotizacion from '../components/ventas/TicketCotizacion';
import useAuthStore from '../store/authStore';
import useBarcodeScanner from '../hooks/useBarcodeScanner';

export default function POS() {
    const { usuario } = useAuthStore();
    const [productos, setProductos] = useState([]);
    const [filtrados, setFiltrados] = useState([]);
    const [search, setSearch] = useState('');
    const [cart, setCart] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState({ cliente_id: '', tipo_comprobante: 'Boleta', tipo_pago: 'Efectivo', monto_recibido: '', descuento: 0, observaciones: '' });
    const [loading, setLoading] = useState(false);

    // React Router
    const location = useLocation();
    const navigate = useNavigate();

    // Impresión
    const [ventaRealizada, setVentaRealizada] = useState(null);
    const [cotizacionRealizada, setCotizacionRealizada] = useState(null);
    const [empresa, setEmpresa] = useState({});
    const ticketRef = useRef();
    const ticketCotizacionRef = useRef();

    useEffect(() => {
        api.get('/productos').then(r => {
            setProductos(r.data.productos);
            setFiltrados(r.data.productos);

            // Si viene cotizacion_id en la URL, cargarla
            const params = new URLSearchParams(location.search);
            const cotId = params.get('cotizacion_id');
            if (cotId) {
                api.get(`/cotizaciones/${cotId}`).then(res => {
                    const cot = res.data.cotizacion;
                    if (cot) {
                        toast('Cargando Proforma...', { icon: '📝' });
                        const loadCart = cot.detalles.map(d => ({
                            ...d.producto,
                            id: d.producto_id,
                            cantidad: parseInt(d.cantidad),
                            precio: parseFloat(d.precio_unitario)
                        }));
                        setCart(loadCart);
                        setForm(f => ({ ...f, cliente_id: cot.cliente_id || '', descuento: cot.descuento, observaciones: `Conversión de la Proforma ${cot.numero_comprobante}` }));
                        // Limpiar url params para que no se recargue
                        navigate('/pos', { replace: true });
                    }
                }).catch(e => console.error('Error cargando cotización', e));
            }
        });
        api.get('/clientes').then(r => setClientes(r.data.clientes));
        api.get('/configuracion').then(r => setEmpresa(r.data.configuracion || {})).catch(() => { });
    }, [location.search]);

    // Hook para escaner de código de barras
    useBarcodeScanner((codigoEscaner) => {
        // Ignorar si hay un modal de venta/cotizacion abierta
        if (ventaRealizada || cotizacionRealizada) return;

        const productoEncontrado = productos.find(p => p.codigo === codigoEscaner);

        if (productoEncontrado) {
            addToCart(productoEncontrado);
            toast.success(`Producto agregado: ${productoEncontrado.nombre}`, { icon: '🛒' });
        } else {
            toast.error(`Código no encontrado: ${codigoEscaner}`);
        }
    }, { preventDefault: true });

    useEffect(() => {
        if (!search) { setFiltrados(productos); return; }
        setFiltrados(productos.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()) || p.codigo?.includes(search)));
    }, [search, productos]);

    const addToCart = (product) => {
        if (product.stock <= 0) return toast.error('Producto sin stock');
        setCart(prev => {
            const exists = prev.find(i => i.id === product.id);
            if (exists) {
                if (exists.cantidad >= product.stock) return toast.error('Stock insuficiente'), prev;
                return prev.map(i => i.id === product.id ? { ...i, cantidad: i.cantidad + 1 } : i);
            }
            return [...prev, { ...product, cantidad: 1, precio: parseFloat(product.precio_venta) }];
        });
    };

    const updateQty = (id, delta) => {
        setCart(prev => prev.map(i => i.id === id ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i).filter(i => i.cantidad > 0));
    };
    const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

    const subtotal = cart.reduce((a, i) => a + i.precio * i.cantidad, 0);
    const descuento = parseFloat(form.descuento || 0);
    const igv = parseFloat(((subtotal - descuento) * 0.18 / 1.18).toFixed(2));
    const total = subtotal - descuento;
    const vuelto = form.monto_recibido ? parseFloat(form.monto_recibido) - total : 0;

    const procesarVenta = async () => {
        if (cart.length === 0) return toast.error('Agrega productos al carrito');
        if (form.tipo_pago === 'Crédito' && (!form.cliente_id || form.cliente_id === '')) {
            return toast.error('Para ventas al CRÉDITO debe seleccionar un Cliente registrado.');
        }
        setLoading(true);
        try {
            const items = cart.map(i => ({ producto_id: i.id, cantidad: i.cantidad, precio_unitario: i.precio, descuento: 0 }));
            const { data } = await api.post('/ventas', { ...form, items, descuento });
            toast.success(`✅ Venta ${data.venta.numero_comprobante} registrada — Total: S/ ${total.toFixed(2)}`);

            // Construir venta a imprimir
            const clienteSelect = clientes.find(c => String(c.id) === String(form.cliente_id));
            const ventaParaTicket = {
                ...data.venta,
                usuario: usuario,
                cliente: clienteSelect || { nombre: 'Público General' },
                detalle: cart.map(i => ({
                    producto: { nombre: i.nombre },
                    cantidad: i.cantidad,
                    precio_unitario: i.precio,
                    subtotal: i.precio * i.cantidad
                }))
            };
            setVentaRealizada(ventaParaTicket);

            setCart([]);
            setForm({ cliente_id: '', tipo_comprobante: 'Boleta', tipo_pago: 'Efectivo', monto_recibido: '', descuento: 0, observaciones: '' });
            api.get('/productos').then(r => { setProductos(r.data.productos); setFiltrados(r.data.productos); });
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Error al procesar venta');
        } finally { setLoading(false); }
    };

    const guardarProforma = async () => {
        if (cart.length === 0) return toast.error('Agrega productos al carrito');
        setLoading(true);
        try {
            const items = cart.map(i => ({ producto_id: i.id, cantidad: i.cantidad, precio_unitario: i.precio, descuento: 0 }));
            const { data } = await api.post('/cotizaciones', {
                cliente_id: form.cliente_id,
                descuento,
                validez_dias: 15,
                observaciones: form.observaciones,
                items
            });
            toast.success(`📝 Proforma ${data.cotizacion.numero_comprobante} guardada`);

            // Construir cotización para imprimir
            const clienteSelect = clientes.find(c => String(c.id) === String(form.cliente_id));
            const cotizacionParaTicket = {
                ...data.cotizacion,
                usuario: usuario,
                cliente: clienteSelect || { nombre: 'Público General' },
                detalles: cart.map(i => ({
                    producto: { nombre: i.nombre },
                    cantidad: i.cantidad,
                    precio_unitario: i.precio,
                    subtotal: i.precio * i.cantidad
                }))
            };
            setCotizacionRealizada(cotizacionParaTicket);
            setCart([]);
            setForm({ cliente_id: '', tipo_comprobante: 'Boleta', tipo_pago: 'Efectivo', monto_recibido: '', descuento: 0, observaciones: '' });
        } catch (err) {
            toast.error(err.response?.data?.msg || 'Error al guardar proforma');
        } finally { setLoading(false); }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleNuevaVenta = () => {
        setVentaRealizada(null);
        setCotizacionRealizada(null);
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 16, height: 'calc(100vh - 62px - 48px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, overflow: 'hidden' }}>
                <div className="card" style={{ padding: '12px 16px', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div className="search-box" style={{ flex: 1 }}>
                        <Search size={15} />
                        <input className="form-control" placeholder="Buscar por nombre o código..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
                        <Barcode size={18} />
                        <span>Lector Activo</span>
                    </div>
                </div>
                <div style={{ flex: 1, overflow: 'auto' }}>
                    {filtrados.length === 0 ? (
                        <div className="empty-state"><Package size={40} /><p>No se encontraron productos</p></div>
                    ) : (
                        <div className="product-grid">
                            {filtrados.map(p => (
                                <div key={p.id} className="product-card" onClick={() => addToCart(p)}>
                                    <div className="product-card-img-placeholder">
                                        {p.imagen ? <img src={`/uploads/${p.imagen}`} alt={p.nombre} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 6 }} />
                                            : <Package size={32} style={{ color: 'var(--accent-light)' }} />}
                                    </div>
                                    <div className="product-card-name">{p.nombre}</div>
                                    <div className="product-card-price">S/ {parseFloat(p.precio_venta).toFixed(2)}</div>
                                    <div className={`product-card-stock ${p.stock <= p.stock_minimo ? 'low' : ''}`}>Stock: {p.stock} {p.unidad}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="pos-cart">
                <div className="pos-cart-header" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <ShoppingCart size={16} style={{ color: 'var(--accent-light)' }} />
                    Carrito ({cart.length})
                </div>
                <div className="pos-cart-items">
                    {cart.length === 0 ? (
                        <div className="empty-state" style={{ padding: '30px 10px' }}><ShoppingCart size={36} /><p>Selecciona productos del catálogo</p></div>
                    ) : cart.map(item => (
                        <div key={item.id} className="cart-item">
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div className="cart-item-name" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nombre}</div>
                                <div className="cart-item-price">S/ {item.precio.toFixed(2)} × {item.cantidad} = <strong style={{ color: 'var(--accent-light)' }}>S/ {(item.precio * item.cantidad).toFixed(2)}</strong></div>
                            </div>
                            <div className="quantity-ctrl">
                                <button onClick={() => updateQty(item.id, -1)}><Minus size={12} /></button>
                                <span>{item.cantidad}</span>
                                <button onClick={() => updateQty(item.id, 1)}><Plus size={12} /></button>
                            </div>
                            <button className="btn-icon del" onClick={() => removeItem(item.id)}><Trash2 size={13} /></button>
                        </div>
                    ))}
                </div>
                <div className="pos-cart-footer">
                    <div className="form-group" style={{ marginBottom: 8 }}>
                        <select className="form-control" value={form.cliente_id} onChange={e => setForm({ ...form, cliente_id: e.target.value })}>
                            <option value="">Cliente General</option>
                            {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                        </select>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                        <select className="form-control" value={form.tipo_comprobante} onChange={e => setForm({ ...form, tipo_comprobante: e.target.value })}>
                            <option value="Boleta">Boleta</option>
                            <option value="Factura">Factura</option>
                            <option value="Ticket">Ticket</option>
                        </select>
                        <select className="form-control" value={form.tipo_pago} onChange={e => setForm({ ...form, tipo_pago: e.target.value })}>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Tarjeta">Tarjeta</option>
                            <option value="Yape">Yape</option>
                            <option value="Plin">Plin</option>
                            <option value="Crédito">Al Crédito (Fiado)</option>
                        </select>
                    </div>
                    <input className="form-control" type="number" placeholder="Descuento (S/)" value={form.descuento} onChange={e => setForm({ ...form, descuento: e.target.value })} style={{ marginBottom: 6 }} />
                    <input className="form-control" type="number" placeholder="Monto recibido (S/)" value={form.monto_recibido} onChange={e => setForm({ ...form, monto_recibido: e.target.value })} style={{ marginBottom: 10 }} disabled={form.tipo_pago === 'Crédito'} />

                    <div className="pos-totals" style={{ marginBottom: 12 }}>
                        <div className="pos-totals-row"><span>Subtotal:</span><span>S/ {subtotal.toFixed(2)}</span></div>
                        {descuento > 0 && <div className="pos-totals-row"><span>Descuento:</span><span className="text-danger">- S/ {descuento.toFixed(2)}</span></div>}
                        {form.tipo_pago === 'Crédito' && <div className="pos-totals-row"><span className="badge badge-warning">PAGO AL CRÉDITO</span></div>}
                        <div className="pos-totals-row"><span>IGV (18%):</span><span>S/ {igv.toFixed(2)}</span></div>
                        <div className="pos-totals-row total"><span>TOTAL:</span><span style={{ color: 'var(--accent-light)' }}>S/ {total.toFixed(2)}</span></div>
                        {form.monto_recibido && form.tipo_pago !== 'Crédito' && <div className="pos-totals-row"><span>Vuelto:</span><span className="text-success">S/ {Math.max(vuelto, 0).toFixed(2)}</span></div>}
                    </div>

                    <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary w-full" onClick={guardarProforma} disabled={loading || cart.length === 0} style={{ padding: '12px 0', fontSize: 13 }} title="Guardar Proforma (No resta stock)">
                            <FileText size={16} style={{ marginRight: 6 }} /> Proforma
                        </button>
                        <button className="btn btn-primary btn-lg w-full" onClick={procesarVenta} disabled={loading || cart.length === 0} style={{ flex: 2 }}>
                            {loading ? <><div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Procesando...</> : '✅ Venta'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Éxito Venta */}
            {ventaRealizada && (
                <div className="modal-backdrop">
                    <div className="modal card" style={{ maxWidth: 400, textAlign: 'center' }}>
                        <div style={{ color: 'var(--green)', marginBottom: 16 }}>
                            <CheckCircle size={64} style={{ margin: '0 auto' }} />
                        </div>
                        <h2 style={{ fontSize: 20, marginBottom: 8 }}>¡Venta Completada!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                            El comprobante <strong>{ventaRealizada.numero_comprobante}</strong> se ha registrado correctamente por un total de <strong>S/ {Number(ventaRealizada.total).toFixed(2)}</strong>.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <button className="btn btn-secondary w-full" onClick={handlePrint} style={{ justifyContent: 'center' }}>
                                <Printer size={18} /> Imprimir Ticket
                            </button>
                            <button className="btn btn-primary w-full" onClick={handleNuevaVenta} style={{ justifyContent: 'center' }}>
                                <Plus size={18} /> Nueva Venta
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Éxito Cotización / Proforma */}
            {cotizacionRealizada && (
                <div className="modal-backdrop">
                    <div className="modal card" style={{ maxWidth: 400, textAlign: 'center' }}>
                        <div style={{ color: 'var(--accent-light)', marginBottom: 16 }}>
                            <FileText size={64} style={{ margin: '0 auto' }} />
                        </div>
                        <h2 style={{ fontSize: 20, marginBottom: 8 }}>¡Proforma Guardada!</h2>
                        <p style={{ color: 'var(--text-secondary)', marginBottom: 24 }}>
                            La Proforma <strong>{cotizacionRealizada.numero_comprobante}</strong> se guardó correctamente. El inventario físico no ha sido alterado.
                        </p>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <button className="btn btn-secondary w-full" onClick={handlePrint} style={{ justifyContent: 'center' }}>
                                <Printer size={18} /> Imprimir Ticket
                            </button>
                            <button className="btn btn-primary w-full" onClick={handleNuevaVenta} style={{ justifyContent: 'center' }}>
                                <Plus size={18} /> Continuar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Componente Oculto para Impresión */}
            {ventaRealizada && createPortal(
                <div className="print-only">
                    <TicketVenta ref={ticketRef} venta={ventaRealizada} empresa={empresa} />
                </div>,
                document.body
            )}
            {cotizacionRealizada && createPortal(
                <div className="print-only">
                    <TicketCotizacion ref={ticketCotizacionRef} cotizacion={cotizacionRealizada} empresa={empresa} />
                </div>,
                document.body
            )}
        </div>
    );
}
