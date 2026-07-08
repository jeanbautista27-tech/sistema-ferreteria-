import { forwardRef } from 'react';

const TicketCotizacion = forwardRef(({ cotizacion, empresa }, ref) => {
    if (!cotizacion) return null;

    const fMoneda = (val) => Number(val || 0).toFixed(2);
    const fecha = cotizacion.created_at ? new Date(cotizacion.created_at).toLocaleString('es-PE') : new Date().toLocaleString('es-PE');

    return (
        <div ref={ref} className="print-ticket" style={{
            fontFamily: 'monospace, sans-serif',
            fontSize: '12px',
            color: '#000',
            width: '100%',
            maxWidth: '300px',
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

            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>
                PROFORMA / COTIZACIÓN
            </div>

            <div style={{ borderBottom: '1px dashed #000', margin: '10px 0' }} />

            {/* Datos Cotizacion */}
            <div style={{ marginBottom: '10px' }}>
                <div><strong>Nº DOC: </strong> {cotizacion.numero_comprobante}</div>
                <div><strong>FECHA: </strong> {fecha}</div>
                <div><strong>EMISOR: </strong> {cotizacion.usuario?.nombre || 'Admin'}</div>
                <div><strong>CLIENTE: </strong> {cotizacion.cliente?.nombre || 'Público General'}</div>
                {cotizacion.cliente?.numero_documento && <div><strong>DOC. CLI: </strong> {cotizacion.cliente.numero_documento}</div>}
                <div><strong>VALIDEZ: </strong> {cotizacion.validez_dias} Días</div>
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
                    {(cotizacion.detalles || cotizacion.items || []).map((item, index) => {
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
                    <span>SUBTOTAL:</span>
                    <span>S/ {fMoneda(cotizacion.subtotal)}</span>
                </div>
                {cotizacion.descuento > 0 && (
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                        <span>DESCUENTO:</span>
                        <span>- S/ {fMoneda(cotizacion.descuento)}</span>
                    </div>
                )}
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between' }}>
                    <span>IGV (18%):</span>
                    <span>S/ {fMoneda(cotizacion.igv)}</span>
                </div>
                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '15px', marginTop: '5px' }}>
                    <span>TOTAL:</span>
                    <span>S/ {fMoneda(cotizacion.total)}</span>
                </div>
            </div>

            <div style={{ borderBottom: '1px solid #000', margin: '10px 0' }} />

            <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px', fontWeight: 'bold' }}>
                <p>DOCUMENTO NO VÁLIDO COMO FACTURA O BOLETA DE VENTA</p>
                <p>Precios sujetos a variación sin previo aviso una vez expirada la fecha de validez.</p>
            </div>
        </div>
    );
});

TicketCotizacion.displayName = 'TicketCotizacion';
export default TicketCotizacion;
