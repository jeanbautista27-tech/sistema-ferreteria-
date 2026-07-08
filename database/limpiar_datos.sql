-- =====================================================
--  LIMPIEZA DE DATOS TRANSACCIONALES
--  Sistema Ferretería El Maestro
--  Conserva: configuracion + usuario Administrador
--  ¡ADVERTENCIA: Esta operación es IRREVERSIBLE!
-- =====================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ---- Logs y Auditoría ----
TRUNCATE TABLE audit_logs;

-- ---- Cuentas por Pagar ----
TRUNCATE TABLE abono_pagars;
TRUNCATE TABLE cuenta_pagars;

-- ---- Cuentas por Cobrar ----
TRUNCATE TABLE abono_cuentas;
TRUNCATE TABLE cuenta_cobras;

-- ---- Cotizaciones ----
TRUNCATE TABLE detalle_cotizacions;
TRUNCATE TABLE cotizacions;

-- ---- Devoluciones ----
TRUNCATE TABLE detalle_devolucions;
TRUNCATE TABLE devolucions;

-- ---- Ventas ----
TRUNCATE TABLE detalle_ventas;
TRUNCATE TABLE ventas;

-- ---- Compras ----
TRUNCATE TABLE detalle_compras;
TRUNCATE TABLE compras;

-- ---- Caja ----
TRUNCATE TABLE caja_egresos;
TRUNCATE TABLE cajas;

-- ---- Movimientos de Inventario ----
TRUNCATE TABLE inventario_movimientos;

-- ---- Datos de Negocio ----
TRUNCATE TABLE productos;
TRUNCATE TABLE clientes;
TRUNCATE TABLE proveedores;
TRUNCATE TABLE categorias;

-- ---- Usuarios: Conservar solo el Administrador ----
-- Primero borrar usuarios que NO son Administrador
DELETE FROM usuarios WHERE rol_id != 1;
-- Resetear el autoincrement del administrador (opcional)
-- ALTER TABLE usuarios AUTO_INCREMENT = 2;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
--  VERIFICACIÓN FINAL
-- =====================================================
SELECT 'ventas'           AS tabla, COUNT(*) AS registros FROM ventas
UNION ALL SELECT 'compras',         COUNT(*) FROM compras
UNION ALL SELECT 'productos',       COUNT(*) FROM productos
UNION ALL SELECT 'clientes',        COUNT(*) FROM clientes
UNION ALL SELECT 'categorias',      COUNT(*) FROM categorias
UNION ALL SELECT 'usuarios',        COUNT(*) FROM usuarios
UNION ALL SELECT 'configuracion',   COUNT(*) FROM configuracions;
