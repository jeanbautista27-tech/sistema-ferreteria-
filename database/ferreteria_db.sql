-- =============================================
-- SISTEMA FERRETERÍA — Base de Datos MySQL
-- ferreteria_db
-- =============================================

CREATE DATABASE IF NOT EXISTS ferreteria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ferreteria_db;

-- =============================================
-- ROLES
-- =============================================
CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  descripcion VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- USUARIOS
-- =============================================
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL,
  activo TINYINT(1) DEFAULT 1,
  ultimo_login DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

-- =============================================
-- CATEGORÍAS
-- =============================================
CREATE TABLE IF NOT EXISTS categorias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  descripcion VARCHAR(255),
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- PROVEEDORES
-- =============================================
CREATE TABLE IF NOT EXISTS proveedores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa VARCHAR(200) NOT NULL,
  ruc VARCHAR(20),
  contacto VARCHAR(100),
  telefono VARCHAR(20),
  email VARCHAR(150),
  direccion VARCHAR(255),
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- PRODUCTOS
-- =============================================
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  categoria_id INT,
  proveedor_id INT,
  precio_compra DECIMAL(10,2) DEFAULT 0,
  precio_venta DECIMAL(10,2) NOT NULL DEFAULT 0,
  stock INT DEFAULT 0,
  stock_minimo INT DEFAULT 5,
  unidad VARCHAR(30) DEFAULT 'und',
  imagen VARCHAR(255),
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE SET NULL,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id) ON DELETE SET NULL
);

-- =============================================
-- CLIENTES
-- =============================================
CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  tipo_documento ENUM('DNI','RUC','CE') DEFAULT 'DNI',
  numero_documento VARCHAR(20),
  telefono VARCHAR(20),
  email VARCHAR(150),
  direccion VARCHAR(255),
  tipo_cliente ENUM('Regular','Mayorista','VIP') DEFAULT 'Regular',
  activo TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- VENTAS
-- =============================================
CREATE TABLE IF NOT EXISTS ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_comprobante VARCHAR(30) UNIQUE,
  tipo_comprobante ENUM('Boleta','Factura','Ticket') DEFAULT 'Boleta',
  cliente_id INT,
  usuario_id INT NOT NULL,
  subtotal DECIMAL(10,2) DEFAULT 0,
  igv DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  descuento DECIMAL(10,2) DEFAULT 0,
  tipo_pago ENUM('Efectivo','Tarjeta','Yape','Plin','Credito') DEFAULT 'Efectivo',
  monto_recibido DECIMAL(10,2),
  vuelto DECIMAL(10,2),
  estado ENUM('Completada','Anulada','Pendiente') DEFAULT 'Completada',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =============================================
-- DETALLE DE VENTAS
-- =============================================
CREATE TABLE IF NOT EXISTS detalle_ventas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- =============================================
-- COMPRAS
-- =============================================
CREATE TABLE IF NOT EXISTS compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_orden VARCHAR(30) UNIQUE,
  proveedor_id INT NOT NULL,
  usuario_id INT NOT NULL,
  subtotal DECIMAL(10,2) DEFAULT 0,
  igv DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  estado ENUM('Pendiente','Recibida','Parcial','Anulada') DEFAULT 'Pendiente',
  fecha_esperada DATE,
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =============================================
-- DETALLE DE COMPRAS
-- =============================================
CREATE TABLE IF NOT EXISTS detalle_compras (
  id INT AUTO_INCREMENT PRIMARY KEY,
  compra_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

-- =============================================
-- CAJA
-- =============================================
CREATE TABLE IF NOT EXISTS caja (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT NOT NULL,
  monto_inicial DECIMAL(10,2) DEFAULT 0,
  monto_final DECIMAL(10,2),
  total_ventas DECIMAL(10,2) DEFAULT 0,
  total_egresos DECIMAL(10,2) DEFAULT 0,
  estado ENUM('Abierta','Cerrada') DEFAULT 'Abierta',
  observaciones TEXT,
  fecha_apertura DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_cierre DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =============================================
-- CAJA EGRESOS
-- =============================================
CREATE TABLE IF NOT EXISTS caja_egresos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  caja_id INT NOT NULL,
  usuario_id INT NOT NULL,
  concepto VARCHAR(255) NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  tipo ENUM('Egreso','Ingreso') DEFAULT 'Egreso',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (caja_id) REFERENCES caja(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =============================================
-- INVENTARIO MOVIMIENTOS
-- =============================================
CREATE TABLE IF NOT EXISTS inventario_movimientos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  producto_id INT NOT NULL,
  usuario_id INT NOT NULL,
  tipo ENUM('Entrada','Salida','Ajuste','Venta','Compra') NOT NULL,
  cantidad INT NOT NULL,
  stock_antes INT,
  stock_despues INT,
  motivo VARCHAR(255),
  referencia_id INT,
  referencia_tipo VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (producto_id) REFERENCES productos(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- =============================================
-- CONFIGURACIÓN
-- =============================================
CREATE TABLE IF NOT EXISTS configuracion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  clave VARCHAR(100) NOT NULL UNIQUE,
  valor TEXT,
  descripcion VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================
-- AUDIT LOGS
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  usuario_id INT,
  accion VARCHAR(100) NOT NULL,
  tabla_afectada VARCHAR(100),
  registro_id INT,
  datos_anteriores JSON,
  datos_nuevos JSON,
  ip VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- =============================================
-- SEEDERS — Datos iniciales
-- =============================================

INSERT IGNORE INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso completo al sistema'),
('Cajero', 'Acceso al POS y ventas'),
('Almacenero', 'Acceso a inventario y compras');

-- Usuario admin: admin@ferreteria.com / admin123
INSERT IGNORE INTO usuarios (nombre, email, password_hash, rol_id) VALUES
('Administrador', 'admin@ferreteria.com', '$2a$10$zDWeFGt3Fd0oZ7e0yE71dOlGH8Y07KO4TFYAGN/OQq1D2fUnvM3Nm', 1);

INSERT IGNORE INTO categorias (nombre, descripcion) VALUES
('Herramientas Manuales', 'Martillos, destornilladores, llaves, etc.'),
('Herramientas Eléctricas', 'Taladros, sierras, lijadoras, etc.'),
('Plomería', 'Tuberías, llaves de paso, válvulas, etc.'),
('Electricidad', 'Cables, interruptores, enchufes, etc.'),
('Pintura', 'Pinturas, brochas, rodillos, solventes, etc.'),
('Ferretería General', 'Tornillos, clavos, pernos, tuercas, etc.'),
('Seguridad', 'Candados, cerraduras, cadenas, etc.'),
('Construcción', 'Cemento, arena, ladrillos, etc.');

INSERT IGNORE INTO configuracion (clave, valor, descripcion) VALUES
('empresa_nombre', 'Ferretería El Maestro', 'Nombre de la empresa'),
('empresa_ruc', '20123456789', 'RUC de la empresa'),
('empresa_direccion', 'Av. Principal 123, Lima', 'Dirección de la empresa'),
('empresa_telefono', '01-234-5678', 'Teléfono de la empresa'),
('empresa_email', 'ventas@ferreteria.com', 'Email de la empresa'),
('empresa_logo', '', 'Logo de la empresa (ruta)'),
('igv_porcentaje', '18', 'Porcentaje de IGV'),
('moneda_simbolo', 'S/', 'Símbolo de moneda'),
('moneda_nombre', 'Soles', 'Nombre de la moneda'),
('serie_boleta', 'B001', 'Serie para boletas'),
('serie_factura', 'F001', 'Serie para facturas'),
('numero_correlativo', '1', 'Número correlativo de comprobantes');

INSERT IGNORE INTO proveedores (empresa, ruc, contacto, telefono, email, direccion) VALUES
('Distribuidora Ferretera SAC', '20456789012', 'Juan Pérez', '999-111-222', 'jperez@distrib.com', 'Av. Industrial 456'),
('Herramientas Pro EIRL', '20567890123', 'María López', '999-333-444', 'mlopez@herrpro.com', 'Jr. Comercio 789');

INSERT IGNORE INTO clientes (nombre, tipo_documento, numero_documento, telefono, tipo_cliente) VALUES
('Cliente General', 'DNI', '00000000', '', 'Regular');
