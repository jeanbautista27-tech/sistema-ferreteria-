import { forwardRef } from 'react';

const TicketVenta = forwardRef(({ venta, empresa }, ref) => {
    if (!venta) return null;

    // Helper: formato moneda
    const fMoneda = (val) => Number(val || 0).toFixed(2);
    // Formato fecha simple DD/MM/YYYY HH:mm
    const fecha = venta.created_at ? new Date(venta.created_at).toLocaleString('es-PE') : new Date().toLocaleString('es-PE');

    return (
        <div ref={ref} className="print-ticket" style={{
            fontFamily: 'monospace, sans-serif',
            fontSize: '12px',
            color: '#000',
            width: '100%',
            maxWidth: '300px', // Apropiado para térmicas 80mm
            margin: '0 auto',
            padding: '10px',
            lineHeight: '1.2'
        }}>
            {/* Cabecera */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <h2 style={{ margin: '0 0 5px 0', fontSize: '18px', textTransform: 'uppercase' }}>{empresa?.nombre || 'MI EMPRESA'}</h2>
                {empresa?.ruc && <div style={{ fontSize: '12px' }}>RUC: {empresa.ruc}</div>}
                {empresa?.direccion && <div style={{ fontSize: '12px' }}>{empresa.direccion}</div>}
                {empresa?.telefono && <div style={{ fontSize: '12px' }}>Tel: {empresa.telefono}</div>}
            </div>

            <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }} />

            {/* Datos Venta */}
            <div style={{ marginBottom: '10px' }}>
                <div><strong>TICKET: </strong> {venta.numero_comprobante}</div>
                <div><strong>FECHA: </strong> {fecha}</div>
                <div><strong>CAJERO: </strong> {venta.usuario?.nombre || 'Admin'}</div>
                <div><strong>CLIENTE: </strong> {venta.cliente?.nombre || 'Público General'}</div>
                {venta.cliente?.numero_documento && <div><strong>DOC: </strong> {venta.cliente.numero_documento}</div>}
            </div>

            <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }} />

            {/* Detalles */}
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', marginBottom: '10px' }}>
                <thead>
                    <tr style={{ borderBottom: '1px solid #000', textAlign: 'left' }}>
                        <th style={{ padding: '2px 0' }}>CANT</th>
                        <th style={{ padding: '2px 0' }}>DESCRIPCIÓN</th>
                        <th style={{ padding: '2px 0', textAlign: 'right' }}>IMP.</th>
                    </tr>
                </thead>
                <tbody>
                    {(venta.detalle || venta.items || []).map((item, index) => {
                        const nombreP = item.producto?.nombre || item.nombre || 'Producto';
                        const cant = item.cantidad || 1;
                        const precioU = item.precio_unitario || item.precio || 0;
                        const sub = item.subtotal || (cant * precioU);

                        return (
                            <tr key={index}>
                                <td style={{ verticalAlign: 'top', paddingTop: '4px' }}>{cant}</td>
                                <td style={{ verticalAlign: 'top', paddingTop: '4px', paddingRight: '5px' }}>{nombreP}</td>
                                <td style={{ verticalAlign: 'top', paddingTop: '4px', textAlign: 'right' }}>{fMoneda(sub)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }} />

            {/* Totales */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '13px' }}>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <span>OP. GRAVADA:</span>
                    <span>S/ {fMoneda(venta.subtotal)}</span>
                </div>
                {venta.descuento > 0 && (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                        <span>DESCUENTO:</span>
                        <span>- S/ {fMoneda(venta.descuento)}</span>
                    </div>
                )}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <span>IGV (18%):</span>
                    <span>S/ {fMoneda(venta.igv)}</span>
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', marginTop: '5px' }}>
                    <span>TOTAL:</span>
                    <span>S/ {fMoneda(venta.total)}</span>
                </div>
            </div>

            <div style={{ borderBottom: '1px solid #000', margin: '10px 0' }} />

            {/* Info Pago */}
            <div style={{ fontSize: '12px', marginBottom: '10px' }}>
                <div><strong>TIPO PAGO:</strong> {venta.tipo_pago || 'Efectivo'}</div>
                {(venta.monto_recibido > 0) && (
                    <>
                        <div><strong>RECIBIDO:</strong> S/ {fMoneda(venta.monto_recibido)}</div>
                        <div><strong>VUELTO:</strong> S/ {fMoneda(venta.vuelto)}</div>
                    </>
                )}
            </div>

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px' }}>
                <p>GRACIAS POR SU COMPRA</p>
                <p>Conserve este ticket para devoluciones o reclamos.</p>
            </div>
        </div>
    );
});

TicketVenta.displayName = 'TicketVenta';
export default TicketVenta;
