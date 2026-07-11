-- ============================================
-- Tablas faltantes en Railway
-- Ejecutar: curl ... | mysql -u root -p$MYSQL_ROOT_PASSWORD railway
-- ============================================

CREATE TABLE IF NOT EXISTS cotizaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  numero_comprobante VARCHAR(30) UNIQUE,
  cliente_id INT,
  usuario_id INT NOT NULL,
  subtotal DECIMAL(10,2) DEFAULT 0,
  igv DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  descuento DECIMAL(10,2) DEFAULT 0,
  validez_dias INT DEFAULT 15,
  estado ENUM('Pendiente','Aceptada','Anulada','Vencida') DEFAULT 'Pendiente',
  observaciones TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS detalle_cotizaciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cotizacion_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  descuento DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cotizacion_id) REFERENCES cotizaciones(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS devoluciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT NOT NULL,
  usuario_id INT NOT NULL,
  numero_comprobante VARCHAR(30) UNIQUE,
  motivo VARCHAR(255) NOT NULL,
  total_reembolso DECIMAL(10,2) DEFAULT 0,
  tipo_reembolso ENUM('Efectivo','Nota Credito') DEFAULT 'Nota Credito',
  estado ENUM('Procesada','Anulada') DEFAULT 'Procesada',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venta_id) REFERENCES ventas(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS detalle_devoluciones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  devolucion_id INT NOT NULL,
  producto_id INT NOT NULL,
  cantidad INT NOT NULL,
  precio_unitario DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (devolucion_id) REFERENCES devoluciones(id) ON DELETE CASCADE,
  FOREIGN KEY (producto_id) REFERENCES productos(id)
);

CREATE TABLE IF NOT EXISTS cuentas_cobrar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  venta_id INT UNIQUE,
  cliente_id INT NOT NULL,
  monto_total DECIMAL(10,2) NOT NULL,
  saldo_pagado DECIMAL(10,2) DEFAULT 0,
  saldo_pendiente DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE,
  estado ENUM('Pendiente','Pagado','Anulado') DEFAULT 'Pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE SET NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS abonos_cuenta (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cuenta_cobrar_id INT NOT NULL,
  usuario_id INT NOT NULL,
  caja_id INT,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50) DEFAULT 'Efectivo',
  referencia VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cuenta_cobrar_id) REFERENCES cuentas_cobrar(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (caja_id) REFERENCES caja(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS cuentas_pagar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  compra_id INT UNIQUE,
  proveedor_id INT NOT NULL,
  monto_total DECIMAL(10,2) NOT NULL,
  saldo_pagado DECIMAL(10,2) DEFAULT 0,
  saldo_pendiente DECIMAL(10,2) NOT NULL,
  fecha_vencimiento DATE,
  estado ENUM('Pendiente','Pagado','Anulado') DEFAULT 'Pendiente',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (compra_id) REFERENCES compras(id) ON DELETE SET NULL,
  FOREIGN KEY (proveedor_id) REFERENCES proveedores(id)
);

CREATE TABLE IF NOT EXISTS abonos_pagar (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cuenta_pagar_id INT NOT NULL,
  usuario_id INT NOT NULL,
  caja_id INT,
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50) DEFAULT 'Efectivo',
  referencia VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cuenta_pagar_id) REFERENCES cuentas_pagar(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
  FOREIGN KEY (caja_id) REFERENCES caja(id) ON DELETE SET NULL
);
