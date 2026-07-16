# 01 — Glosario del Proyecto

**Sistema:** Sistema de Gestión para Ferretería
**Versión:** 1.0

---

## Términos del dominio de negocio

| Término | Definición |
| --- | --- |
| **Ferretería** | Establecimiento comercial que vende herramientas, materiales de construcción y productos afines. |
| **POS** | Point of Sale (Punto de Venta). Interfaz desde la que el cajero registra ventas en tiempo real. |
| **Orden de compra** | Documento emitido al proveedor solicitando mercancía a un precio y cantidad acordados. |
| **Recepción de mercancía** | Acto de marcar una orden de compra como recibida, actualizando el stock de productos. |
| **Stock** | Cantidad de unidades disponibles de un producto en el almacén. |
| **Stock mínimo** | Umbral configurado por producto. Si `stock ≤ stock_minimo`, el sistema emite alerta. |
| **Soft delete** | Eliminación lógica mediante `activo = 0`. El registro persiste para preservar historial. |
| **Cotización / Proforma** | Documento previo a la venta que lista productos, precios e IGV sin comprometer el stock. |
| **Nota de crédito** | Documento generado en una devolución. Número formato `NC001-XXXXXX`. |
| **Cuenta por cobrar (CxC)** | Deuda de un cliente originada por una venta al crédito. |
| **Cuenta por pagar (CxP)** | Deuda de la empresa con un proveedor originada por una compra al crédito. |
| **Abono** | Pago parcial o total aplicado a una CxC o CxP. |
| **IGV** | Impuesto General a las Ventas. 18% por defecto, configurable en el sistema. |
| **Correlativo** | Número secuencial autogenerado. Ej: `B001-00000001` para boletas. |
| **Caja** | Turno operativo de un cajero. Se abre con monto inicial y se cierra calculando el saldo. |
| **Egreso de caja** | Salida de dinero de la caja durante el turno (gastos, pagos, reembolsos). |
| **Movimiento de inventario** | Registro de toda entrada o salida de stock (venta, compra, ajuste, devolución). |
| **Rollback** | Reversión de todas las escrituras de una transacción ante un error. |
| **Audit log** | Registro automático de acciones del usuario (login, creación, modificación). |

---

## Términos técnicos

| Término | Definición |
| --- | --- |
| **SDD** | Specification Driven Development. Metodología donde las especificaciones guían el desarrollo. |
| **JWT** | JSON Web Token. Mecanismo de autenticación stateless. |
| **ORM** | Object-Relational Mapping. Sequelize abstrae las consultas SQL en JavaScript. |
| **Sequelize** | ORM para Node.js con soporte para MySQL, PostgreSQL, SQLite. |
| **underscored: true** | Opción de Sequelize que usa `snake_case` en BD y `camelCase` en JSON. |
| **SPA** | Single Page Application. React carga una sola página y navega sin recargar. |
| **Middleware** | Función interceptora en Express ejecutada antes del controller. |
| **verifyToken** | Middleware que valida el JWT en el header `Authorization: Bearer`. |
| **requireRole** | Middleware que verifica que el rol del usuario esté en la lista de roles permitidos. |
| **requireAdmin** | Alias de `requireRole('Administrador')` para rutas administrativas. |
| **CORS** | Cross-Origin Resource Sharing. Política que controla qué orígenes pueden llamar a la API. |
| **Rate limiting** | Límite de peticiones por IP en un intervalo de tiempo. Protege contra fuerza bruta. |
| **Helmet** | Middleware Express que establece cabeceras HTTP de seguridad. |
| **Supertest** | Librería para probar endpoints HTTP en pruebas de integración sin levantar servidor. |
| **jest.mock()** | Función de Jest que reemplaza módulos reales por implementaciones controladas. |
| **Transaction** | Operación Sequelize que agrupa varias escrituras en BD; se revierte si falla alguna. |
| **Railway** | Plataforma cloud PaaS donde está desplegado el sistema (frontend + backend + MySQL). |
| **VITE_API_URL** | Variable de entorno del frontend que apunta al backend en producción. |
| **DB_PORT / MYSQLPORT** | Variable de Railway con el puerto dinámico del servicio MySQL. |

---

## Acrónimos

| Acrónimo | Significado |
| --- | --- |
| ERP | Enterprise Resource Planning |
| API | Application Programming Interface |
| REST | Representational State Transfer |
| JWT | JSON Web Token |
| ORM | Object Relational Mapping |
| SPA | Single Page Application |
| POS | Point of Sale |
| CxC | Cuentas por Cobrar |
| CxP | Cuentas por Pagar |
| IGV | Impuesto General a las Ventas |
| SDD | Specification Driven Development |
| ADR | Architecture Decision Record |
| BD | Base de Datos |
| RFC | Request for Comments |
| CRUD | Create, Read, Update, Delete |
