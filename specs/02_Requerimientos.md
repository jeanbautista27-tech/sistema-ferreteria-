# 02 — Requerimientos del Sistema

**Versión:** 1.0 | **Estado:** Verificado en producción

---

## Requerimientos Funcionales

### RF-01 Autenticación
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-01.1 | El sistema permite login con email y contraseña | HTTP 200 + token JWT |
| RF-01.2 | Las contraseñas se almacenan con hash bcrypt | `password_hash` inicia con `$2a$10$` |
| RF-01.3 | El token JWT expira según `JWT_EXPIRES_IN` | Token inválido retorna HTTP 401 |
| RF-01.4 | Rutas protegidas rechazan peticiones sin token | HTTP 401 `Token no proporcionado` |
| RF-01.5 | Rutas administrativas verifican rol Administrador | HTTP 403 si rol ≠ Administrador |
| RF-01.6 | Máximo 10 intentos de login por IP en 15 minutos | El intento 11 recibe HTTP 429 |
| RF-01.7 | El sistema registra audit log en cada login exitoso | Registro en tabla `audit_logs` |

### RF-02 Usuarios
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-02.1 | CRUD completo de usuarios | Crear, listar, editar, desactivar |
| RF-02.2 | Email único por usuario | HTTP 400 si email ya existe |
| RF-02.3 | Nueva contraseña se hashea con bcrypt | `password_hash` actualizado |
| RF-02.4 | Eliminación lógica (`activo = 0`) | Registro permanece en BD |

### RF-03 Productos
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-03.1 | Registro con: código, nombre, precios, stock, categoría, proveedor, imagen | Producto creado y consultable |
| RF-03.2 | Búsqueda por nombre o código | Filtro `LIKE` activo |
| RF-03.3 | Filtro por categoría | Selector en UI funcional |
| RF-03.4 | Alerta visual de stock bajo | `stock ≤ stock_minimo` resaltado |
| RF-03.5 | Eliminación lógica | `activo = 0` |

### RF-04 Ventas / POS
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-04.1 | Registro de venta con múltiples productos | Venta creada con detalles |
| RF-04.2 | Verificación de stock antes de vender | HTTP 500 + rollback si stock insuficiente |
| RF-04.3 | Número de comprobante autogenerado (serie+correlativo) | Formato `B001-00000001` |
| RF-04.4 | Cálculo automático de IGV (configurable) | `total = subtotal * (1 + igv/100)` |
| RF-04.5 | Cinco tipos de pago: Efectivo, Tarjeta, Yape, Plin, Crédito | Enum en BD y UI |
| RF-04.6 | Venta al crédito requiere cliente | HTTP 400 sin `cliente_id` |
| RF-04.7 | Venta al crédito genera CxC automáticamente | Registro en `cuentas_cobrar` |
| RF-04.8 | Anulación revierte el stock | Stock restaurado + estado `Anulada` |
| RF-04.9 | No se puede anular una venta ya anulada | HTTP 400 |
| RF-04.10 | Descuento del stock por cada ítem vendido | `inventario_movimientos` tipo `Venta` |

### RF-05 Compras
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-05.1 | Solo Administrador registra nuevas órdenes | HTTP 403 para Almacenero/Cajero |
| RF-05.2 | Compra al contado requiere caja abierta | HTTP 500 + rollback sin caja |
| RF-05.3 | Compra al crédito genera CxP automáticamente | Registro en `cuentas_pagar` |
| RF-05.4 | Recepción incrementa stock + registra movimiento | Stock actualizado |
| RF-05.5 | Una compra recibida no puede marcarse de nuevo | HTTP 400 |

### RF-06 Inventario
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-06.1 | Ajuste manual de stock con motivo | `inventario_movimientos` tipo `Ajuste` |
| RF-06.2 | Historial filtrable por producto | Endpoint con `?producto_id=X` |
| RF-06.3 | Filtro de stock bajo en UI | `stock_bajo=true` activo |

### RF-07 Caja
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-07.1 | Solo una caja abierta simultáneamente | HTTP 400 al intentar abrir segunda |
| RF-07.2 | Cierre calcula `monto_final = inicial + ventas - egresos` | Fórmula verificada |
| RF-07.3 | Registro de egresos durante el turno | `caja_egresos` creado |

### RF-08 Cotizaciones
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-08.1 | Número correlativo `PROF-XXXXXX` | Generado automáticamente |
| RF-08.2 | Validez en días configurable (default 15) | Campo `validez_dias` |
| RF-08.3 | Anulación de cotizaciones | Estado → `Anulada` |

### RF-09 Devoluciones
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-09.1 | Solo de ventas `Completada` | HTTP 400 para otros estados |
| RF-09.2 | Cantidad devuelta ≤ cantidad vendida | HTTP 500 + rollback si excede |
| RF-09.3 | Reembolso en efectivo requiere caja abierta | HTTP 500 + rollback sin caja |
| RF-09.4 | Stock reintegrado automáticamente | `inventario_movimientos` tipo `Entrada` |
| RF-09.5 | Número de nota de crédito `NC001-XXXXXX` | Generado automáticamente |

### RF-10 Cuentas por Cobrar
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-10.1 | Abono no supera saldo pendiente | HTTP 400 si excede |
| RF-10.2 | Al saldar, estado → `Pagado` | `saldo_pendiente = 0` |
| RF-10.3 | Abono requiere caja abierta | HTTP 400 sin caja activa |
| RF-10.4 | Cuenta pagada no acepta más abonos | HTTP 400 |

### RF-11 Cuentas por Pagar
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-11.1 | Mismas reglas que CxC (RF-10) | — |
| RF-11.2 | Pago registra egreso en caja activa | `caja_egresos` creado |

### RF-12 Reportes
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-12.1 | Exportar reporte consolidado Excel (4 hojas) | Archivo `.xlsx` descargable |
| RF-12.2 | Exportar ventas en PDF | Archivo `.pdf` descargable |
| RF-12.3 | Exportar inventario valorizado Excel y PDF | Archivos descargables |
| RF-12.4 | Filtro por rango de fechas | Params `desde` y `hasta` |

### RF-13 Dashboard
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-13.1 | KPIs: productos, clientes, ventas del día, estado caja | Datos en tiempo real |
| RF-13.2 | Stock crítico (top 5 productos con stock bajo) | Lista visible |
| RF-13.3 | Tendencia de ventas últimos 7 días | Gráfico de línea |
| RF-13.4 | Comparativa ventas vs compras últimos 6 días | Gráfico de barras |

### RF-14 Configuración
| ID | Descripción | Criterio de verificación |
| --- | --- | --- |
| RF-14.1 | Configurar datos de empresa, IGV, series de comprobantes | Persistido con `upsert` |
| RF-14.2 | Solo Administrador puede modificar configuración | HTTP 403 para otros roles |

---

## Requerimientos No Funcionales

| ID | Categoría | Descripción | Verificación |
| --- | --- | --- | --- |
| RNF-01 | Seguridad | Contraseñas en hash bcrypt (cost 10) | `$2a$10$` en BD |
| RNF-02 | Seguridad | Cabeceras HTTP seguras (helmet) | Headers en respuesta |
| RNF-03 | Seguridad | CORS restringido a `FRONTEND_URL` en prod | Error en origen no autorizado |
| RNF-04 | Seguridad | Stack trace oculto en producción | `NODE_ENV=production` |
| RNF-05 | Seguridad | `.env` excluido del repositorio | `.gitignore` configurado |
| RNF-06 | Rendimiento | Respuestas comprimidas con gzip | Header `Content-Encoding: gzip` |
| RNF-07 | Rendimiento | Pool MySQL max 10 conexiones | `db.js` configurado |
| RNF-08 | Rendimiento | Operaciones multitabla en transacciones | Rollback en errores |
| RNF-09 | Disponibilidad | Despliegue en Railway, accesible 24/7 | URL pública funcional |
| RNF-10 | Disponibilidad | Health endpoint `/api/health` | HTTP 200 `ok: true` |
| RNF-11 | Disponibilidad | Puerto dinámico via `PORT` env var | Railway asigna puerto |
| RNF-12 | Mantenibilidad | Patrón MVC estricto | Sin lógica en rutas |
| RNF-13 | Calidad | Cobertura pruebas ≥ 90% controllers | Reporte Jest |
| RNF-14 | Calidad | 290 pruebas automatizadas pasando | `npm test` → 0 fallos |
| RNF-15 | Usabilidad | Notificaciones visuales en operaciones | Toast success/error |
| RNF-16 | Usabilidad | POS con soporte lector de código de barras | Hook `useBarcodeScanner` |
| RNF-17 | Portabilidad | `VITE_API_URL` configurable sin cambiar código | Build de producción |
