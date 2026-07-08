-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         8.4.3 - MySQL Community Server - GPL
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.8.0.6908
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para ferreteria_db
CREATE DATABASE IF NOT EXISTS `ferreteria_db` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ferreteria_db`;

-- Volcando estructura para tabla ferreteria_db.audit_logs
CREATE TABLE IF NOT EXISTS `audit_logs` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int DEFAULT NULL,
  `accion` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tabla_afectada` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `registro_id` int DEFAULT NULL,
  `datos_anteriores` json DEFAULT NULL,
  `datos_nuevos` json DEFAULT NULL,
  `ip` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.audit_logs: ~0 rows (aproximadamente)
DELETE FROM `audit_logs`;
INSERT INTO `audit_logs` (`id`, `usuario_id`, `accion`, `tabla_afectada`, `registro_id`, `datos_anteriores`, `datos_nuevos`, `ip`, `created_at`) VALUES
	(1, 1, 'LOGIN', 'usuarios', 1, NULL, NULL, '::1', '2026-03-06 08:09:29'),
	(2, 1, 'LOGIN', 'usuarios', 1, NULL, NULL, '::1', '2026-03-06 17:01:43'),
	(3, 1, 'LOGIN', 'usuarios', 1, NULL, NULL, '::1', '2026-03-06 18:41:32');

-- Volcando estructura para tabla ferreteria_db.caja
CREATE TABLE IF NOT EXISTS `caja` (
  `id` int NOT NULL AUTO_INCREMENT,
  `usuario_id` int NOT NULL,
  `monto_inicial` decimal(10,2) DEFAULT '0.00',
  `monto_final` decimal(10,2) DEFAULT NULL,
  `total_ventas` decimal(10,2) DEFAULT '0.00',
  `total_egresos` decimal(10,2) DEFAULT '0.00',
  `estado` enum('Abierta','Cerrada') COLLATE utf8mb4_unicode_ci DEFAULT 'Abierta',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `fecha_apertura` datetime DEFAULT CURRENT_TIMESTAMP,
  `fecha_cierre` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `caja_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.caja: ~11 rows (aproximadamente)
DELETE FROM `caja`;
INSERT INTO `caja` (`id`, `usuario_id`, `monto_inicial`, `monto_final`, `total_ventas`, `total_egresos`, `estado`, `observaciones`, `fecha_apertura`, `fecha_cierre`, `created_at`, `updated_at`) VALUES
	(1, 1, 500.00, 3240.50, 2850.50, 110.00, 'Cerrada', 'Dia normal de ventas', '2026-02-05 08:00:00', '2026-02-05 18:30:00', '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(2, 1, 500.00, 4120.00, 3750.00, 130.00, 'Cerrada', 'Sabado. Alta demanda.', '2026-02-06 08:00:00', '2026-02-06 18:00:00', '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(3, 1, 500.00, 2980.00, 2550.00, 70.00, 'Cerrada', NULL, '2026-02-07 08:00:00', '2026-02-07 18:00:00', '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(4, 1, 500.00, 3560.00, 3190.00, 130.00, 'Cerrada', NULL, '2026-02-10 08:00:00', '2026-02-10 18:00:00', '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(5, 1, 500.00, 4890.00, 4510.00, 120.00, 'Cerrada', 'Venta mayorista grande', '2026-02-17 08:00:00', '2026-02-17 18:00:00', '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(6, 1, 500.00, 3120.00, 2740.00, 120.00, 'Cerrada', NULL, '2026-02-18 08:00:00', '2026-02-18 18:00:00', '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(7, 1, 500.00, 2780.00, 2390.00, 110.00, 'Cerrada', NULL, '2026-02-20 08:00:00', '2026-02-20 18:00:00', '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(8, 1, 500.00, 5230.00, 4850.00, 120.00, 'Cerrada', 'Proyecto constructora', '2026-02-25 08:00:00', '2026-02-25 18:00:00', '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(9, 1, 500.00, 3450.00, 3070.00, 120.00, 'Cerrada', NULL, '2026-02-26 08:00:00', '2026-02-26 18:00:00', '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(10, 1, 500.00, 3890.00, 3500.00, 110.00, 'Cerrada', NULL, '2026-02-28 08:00:00', '2026-02-28 18:00:00', '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(11, 1, 500.00, NULL, 0.00, 0.00, 'Abierta', 'Dia de hoy', '2026-03-06 08:00:00', NULL, '2026-03-06 08:16:07', '2026-03-06 08:16:07');

-- Volcando estructura para tabla ferreteria_db.caja_egresos
CREATE TABLE IF NOT EXISTS `caja_egresos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `caja_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `concepto` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `monto` decimal(10,2) NOT NULL,
  `tipo` enum('Egreso','Ingreso') COLLATE utf8mb4_unicode_ci DEFAULT 'Egreso',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `caja_id` (`caja_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `caja_egresos_ibfk_1` FOREIGN KEY (`caja_id`) REFERENCES `caja` (`id`),
  CONSTRAINT `caja_egresos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.caja_egresos: ~0 rows (aproximadamente)
DELETE FROM `caja_egresos`;

-- Volcando estructura para tabla ferreteria_db.categorias
CREATE TABLE IF NOT EXISTS `categorias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.categorias: ~30 rows (aproximadamente)
DELETE FROM `categorias`;
INSERT INTO `categorias` (`id`, `nombre`, `descripcion`, `activo`, `created_at`, `updated_at`) VALUES
	(1, 'Herramientas Manuales', 'Martillos, destornilladores, llaves', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(2, 'Herramientas Electricas', 'Taladros, amoladoras, sierras', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(3, 'Pinturas y Acabados', 'Pintura latex, esmalte, selladores', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(4, 'Construccion', 'Cemento, arena, ladrillos, fierro', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(5, 'Plomeria', 'Tubos PVC, llaves de agua, codos', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(6, 'Electricidad', 'Cables, interruptores, enchufes, LEDs', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(7, 'Fijaciones', 'Clavos, tornillos, pernos, tacos', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(8, 'Maderas', 'Tablones, triplay, MDF, molduras', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(9, 'Adhesivos', 'Pegamentos, silicona, masilla', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(10, 'Seguridad', 'Cascos, guantes, lentes, zapatos', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(11, 'Jardin', 'Mangueras, aspersores, macetas', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(12, 'Techado', 'Calaminas, tejas, impermeabilizantes', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(13, 'Puertas y Ventanas', 'Bisagras, cerraduras, jalaores', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(14, 'Soldadura', 'Electrodos, mascaras, alambre MIG', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(15, 'Iluminacion', 'Reflectores, luminarias LED', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(16, 'Abrasivos', 'Lijas, discos de corte, desbaste', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(17, 'Medicion', 'Metros, niveles, escuadras, vernier', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(18, 'Compresor y Neumatica', 'Compresoras, pistolas de pintura', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(19, 'Pisos y Ceramicos', 'Porcelanato, ceramico, fragua', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(20, 'Impermeabilizantes', 'Sika, Chematex, membrana asfaltica', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(21, 'Accesorios de Bano', 'Inodoros, lavatorios, duchas', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(22, 'Cable y Ductos', 'Conduit, cable THW, vulcanizado', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(23, 'Valvulas Industriales', 'Valvulas de bola, check, compuerta', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(24, 'Equipos de Elevacion', 'Polipastos, carretillas manuales', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(25, 'Limpieza Industrial', 'Escobas, trapeadores, desengrasantes', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(26, 'Senalizacion', 'Cintas de peligro, senales, conos', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(27, 'Ferreteria General', 'Varillas, ganchos, alcayatas', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(28, 'Bombas de Agua', 'Bombas centrifugas, sumergibles', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(29, 'Andamios', 'Tubulares, crucetas, tablones', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(30, 'Generadores', 'Grupos electrogenos, extensiones', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07');

-- Volcando estructura para tabla ferreteria_db.clientes
CREATE TABLE IF NOT EXISTS `clientes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_documento` enum('DNI','RUC','CE') COLLATE utf8mb4_unicode_ci DEFAULT 'DNI',
  `numero_documento` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_cliente` enum('Regular','Mayorista','VIP') COLLATE utf8mb4_unicode_ci DEFAULT 'Regular',
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.clientes: ~30 rows (aproximadamente)
DELETE FROM `clientes`;
INSERT INTO `clientes` (`id`, `nombre`, `tipo_documento`, `numero_documento`, `telefono`, `email`, `direccion`, `tipo_cliente`, `activo`, `created_at`, `updated_at`) VALUES
	(1, 'Juan Carlos Mendoza', 'DNI', '45123678', '987654321', 'jcmendoza@gmail.com', 'Jr. Las Flores 234, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(2, 'Maria Garcia', 'DNI', '48239456', '998877665', 'maria.garcia@hotmail.com', 'Av. Los Pinos 120, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(3, 'Constructora ABC S.A.C.', 'RUC', '20123789456', '01-4321100', 'compras@constructorabc.pe', 'Av. Industrial 450, Lurin', 'Mayorista', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(4, 'Taller El Maestro E.I.R.L.', 'RUC', '20234890567', '944332211', 'tallerm@gmail.com', 'Jr. Artesanos 67, Lima', 'Mayorista', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(5, 'Pedro Ramirez', 'DNI', '41345678', '951234567', 'pedro.ramirez@gmail.com', 'Av. Grau 890, Callao', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(6, 'Ana Lucia Flores', 'DNI', '42456789', '962345678', 'analucia.flores@yahoo.com', 'Jr. Progreso 340, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(7, 'INNOVA Construcciones S.A.', 'RUC', '20345901678', '01-4567200', 'innova@innovaconstruc.pe', 'Av. La Marina 1200, Lima', 'Mayorista', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(8, 'Empresa Multiservicios Lopez E.I.R.L.', 'RUC', '20456012789', '076-331200', 'lopez@multiservicios.pe', 'Jr. Grau 233, Cajamarca', 'Mayorista', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(9, 'Carlos Quispe', 'DNI', '43567890', '973456789', 'carlos.quispe@gmail.com', 'Av. Tupac Amaru 1200, Comas', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(10, 'Rosa Mendivil', 'DNI', '44678901', '984567890', 'rosita.mendivil@gmail.com', 'Jr. Puno 567, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(11, 'Almacenes Torres S.R.L.', 'RUC', '20567123890', '01-3321200', 'torres@almacenestorre.pe', 'Jr. Callao 890, Lima', 'Mayorista', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(12, 'Rodrigo Villanueva', 'DNI', '45789012', '995678901', 'r.villanueva@gmail.com', 'Av. Peru 234, SMP', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(13, 'Nelly Paredes', 'DNI', '46890123', '906789012', 'nelly.paredes@outlook.com', 'Jr. Tacna 120, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(14, 'Ferreria Guzman S.A.C.', 'RUC', '20678234901', '01-4331200', 'guzman@ferreriaguzman.pe', 'Av. Benavides 4500, Miraflores', 'VIP', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(15, 'Luis Alonzo Pena', 'DNI', '47901234', '917890123', 'luispena@gmail.com', 'Av. Colonial 670, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(16, 'Teresa Salaverry', 'DNI', '48012345', '928901234', 'tere.salaverry@gmail.com', 'Jr. Moquegua 89, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(17, 'Inmobiliaria Rivera E.I.R.L.', 'RUC', '20789345012', '054-231500', 'rivera@inmobiliariarvr.pe', 'Av. Ejercito 1100, Arequipa', 'VIP', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(18, 'Edgar Mamani', 'DNI', '49123456', '939012345', 'edgar.mamani@gmail.com', 'Av. Independencia 340, Puno', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(19, 'Patricia Cori', 'DNI', '40234567', '940123456', 'patricia.cori@gmail.com', 'Jr. Lima 456, Puno', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(20, 'INKAS Proyectos S.A.C.', 'RUC', '20890456123', '01-5671200', 'inkas@inkasproyectos.pe', 'Av. La Encalada 1560, Lima', 'Mayorista', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(21, 'Mario Sanchez', 'DNI', '41345679', '951234568', 'mario.sanchez@gmail.com', 'Jr. Huancavelica 670, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(22, 'Lucia Tapia', 'DNI', '42456790', '962345679', 'lucia.tapia@hotmail.com', 'Av. Arequipa 2340, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(23, 'NORTEC Ingenieria S.A.C.', 'RUC', '20901567234', '044-561300', 'nortec@nortecsr.pe', 'Av. Espana 340, Trujillo', 'Mayorista', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(24, 'Alberto Castillo', 'DNI', '43567891', '973456790', 'acastillo@gmail.com', 'Jr. Huallaga 890, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(25, 'Silvia Condori', 'DNI', '44678902', '984567891', 'silvia.condori@gmail.com', 'Av. Tacna 120, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(26, 'VIMA Construcciones S.A.', 'RUC', '21012678345', '01-6121200', 'vima@vimaconstruc.pe', 'Av. Via Expresa 890, Lima', 'Mayorista', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(27, 'Raul Espinoza', 'DNI', '45789013', '995678902', 'raul.espinoza@gmail.com', 'Jr. Carabaya 234, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(28, 'Carmen Huanca', 'DNI', '46890124', '906789013', 'chuanca@gmail.com', 'Av. Canto Grande 340, SJL', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(29, 'Erika Delgado', 'DNI', '47901235', '917890124', 'erika.delgado@yahoo.com', 'Jr. Ayacucho 670, Lima', 'Regular', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(30, 'TECNO Obras E.I.R.L.', 'RUC', '21123789456', '01-7121100', 'tecno@tecnoobras.pe', 'Av. Alfredo Mendiola 2340, Lima', 'VIP', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07');

-- Volcando estructura para tabla ferreteria_db.compras
CREATE TABLE IF NOT EXISTS `compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_orden` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `proveedor_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `subtotal` decimal(10,2) DEFAULT '0.00',
  `igv` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `estado` enum('Pendiente','Recibida','Parcial','Anulada') COLLATE utf8mb4_unicode_ci DEFAULT 'Pendiente',
  `tipo_pago` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'Efectivo',
  `fecha_esperada` date DEFAULT NULL,
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_orden` (`numero_orden`),
  KEY `proveedor_id` (`proveedor_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `compras_ibfk_1` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`),
  CONSTRAINT `compras_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.compras: ~30 rows (aproximadamente)
DELETE FROM `compras`;
INSERT INTO `compras` (`id`, `numero_orden`, `proveedor_id`, `usuario_id`, `subtotal`, `igv`, `total`, `estado`, `tipo_pago`, `fecha_esperada`, `observaciones`, `created_at`, `updated_at`) VALUES
	(1, 'OC-2026-001', 1, 1, 423.73, 76.27, 500.00, 'Recibida', 'Efectivo', '2026-02-06', NULL, '2026-02-05 14:00:00', '2026-03-06 08:16:25'),
	(2, 'OC-2026-002', 9, 1, 847.46, 152.54, 1000.00, 'Recibida', 'Efectivo', '2026-02-07', NULL, '2026-02-06 15:00:00', '2026-03-06 08:16:25'),
	(3, 'OC-2026-003', 29, 1, 635.59, 114.41, 750.00, 'Recibida', 'Efectivo', '2026-02-08', NULL, '2026-02-07 14:30:00', '2026-03-06 08:16:25'),
	(4, 'OC-2026-004', 6, 1, 508.47, 91.53, 600.00, 'Recibida', 'Efectivo', '2026-02-09', NULL, '2026-02-08 16:00:00', '2026-03-06 08:16:25'),
	(5, 'OC-2026-005', 21, 1, 381.36, 68.64, 450.00, 'Recibida', 'Efectivo', '2026-02-10', NULL, '2026-02-09 14:00:00', '2026-03-06 08:16:25'),
	(6, 'OC-2026-006', 26, 1, 1271.19, 228.81, 1500.00, 'Recibida', 'Efectivo', '2026-02-11', NULL, '2026-02-10 15:00:00', '2026-03-06 08:16:25'),
	(7, 'OC-2026-007', 14, 1, 720.34, 129.66, 850.00, 'Recibida', 'Efectivo', '2026-02-12', NULL, '2026-02-11 14:00:00', '2026-03-06 08:16:25'),
	(8, 'OC-2026-008', 28, 1, 423.73, 76.27, 500.00, 'Recibida', 'Efectivo', '2026-02-13', NULL, '2026-02-12 15:30:00', '2026-03-06 08:16:25'),
	(9, 'OC-2026-009', 22, 1, 635.59, 114.41, 750.00, 'Recibida', 'Efectivo', '2026-02-14', NULL, '2026-02-13 14:00:00', '2026-03-06 08:16:25'),
	(10, 'OC-2026-010', 10, 1, 508.47, 91.53, 600.00, 'Recibida', 'Efectivo', '2026-02-15', NULL, '2026-02-14 15:00:00', '2026-03-06 08:16:25'),
	(11, 'OC-2026-011', 1, 1, 847.46, 152.54, 1000.00, 'Recibida', 'Efectivo', '2026-02-16', NULL, '2026-02-15 14:30:00', '2026-03-06 08:16:25'),
	(12, 'OC-2026-012', 9, 1, 381.36, 68.64, 450.00, 'Recibida', 'Efectivo', '2026-02-17', NULL, '2026-02-16 15:00:00', '2026-03-06 08:16:25'),
	(13, 'OC-2026-013', 6, 1, 1059.32, 190.68, 1250.00, 'Recibida', 'Efectivo', '2026-02-18', NULL, '2026-02-17 14:00:00', '2026-03-06 08:16:25'),
	(14, 'OC-2026-014', 29, 1, 720.34, 129.66, 850.00, 'Recibida', 'Efectivo', '2026-02-19', NULL, '2026-02-18 15:00:00', '2026-03-06 08:16:25'),
	(15, 'OC-2026-015', 14, 1, 508.47, 91.53, 600.00, 'Recibida', 'Efectivo', '2026-02-20', NULL, '2026-02-19 14:00:00', '2026-03-06 08:16:25'),
	(16, 'OC-2026-016', 21, 1, 635.59, 114.41, 750.00, 'Recibida', 'Efectivo', '2026-02-21', NULL, '2026-02-20 15:00:00', '2026-03-06 08:16:25'),
	(17, 'OC-2026-017', 26, 1, 1271.19, 228.81, 1500.00, 'Recibida', 'Efectivo', '2026-02-22', NULL, '2026-02-21 14:00:00', '2026-03-06 08:16:25'),
	(18, 'OC-2026-018', 28, 1, 423.73, 76.27, 500.00, 'Recibida', 'Efectivo', '2026-02-23', NULL, '2026-02-22 15:00:00', '2026-03-06 08:16:25'),
	(19, 'OC-2026-019', 22, 1, 847.46, 152.54, 1000.00, 'Recibida', 'Efectivo', '2026-02-24', NULL, '2026-02-23 14:00:00', '2026-03-06 08:16:25'),
	(20, 'OC-2026-020', 10, 1, 381.36, 68.64, 450.00, 'Recibida', 'Efectivo', '2026-02-25', NULL, '2026-02-24 15:00:00', '2026-03-06 08:16:25'),
	(21, 'OC-2026-021', 1, 1, 1186.44, 213.56, 1400.00, 'Recibida', 'Efectivo', '2026-02-26', NULL, '2026-02-25 14:00:00', '2026-03-06 08:16:25'),
	(22, 'OC-2026-022', 9, 1, 508.47, 91.53, 600.00, 'Recibida', 'Efectivo', '2026-02-27', NULL, '2026-02-26 15:00:00', '2026-03-06 08:16:25'),
	(23, 'OC-2026-023', 6, 1, 635.59, 114.41, 750.00, 'Recibida', 'Efectivo', '2026-02-28', NULL, '2026-02-27 14:00:00', '2026-03-06 08:16:25'),
	(24, 'OC-2026-024', 29, 1, 423.73, 76.27, 500.00, 'Recibida', 'Efectivo', '2026-02-28', NULL, '2026-02-28 15:00:00', '2026-03-06 08:16:25'),
	(25, 'OC-2026-025', 14, 1, 1059.32, 190.68, 1250.00, 'Recibida', 'Efectivo', '2026-03-01', NULL, '2026-03-01 14:00:00', '2026-03-06 08:16:25'),
	(26, 'OC-2026-026', 21, 1, 720.34, 129.66, 850.00, 'Recibida', 'Efectivo', '2026-03-02', NULL, '2026-03-02 15:00:00', '2026-03-06 08:16:25'),
	(27, 'OC-2026-027', 26, 1, 508.47, 91.53, 600.00, 'Recibida', 'Efectivo', '2026-03-03', NULL, '2026-03-03 14:00:00', '2026-03-06 08:16:25'),
	(28, 'OC-2026-028', 28, 1, 847.46, 152.54, 1000.00, 'Recibida', 'Efectivo', '2026-03-04', NULL, '2026-03-04 15:00:00', '2026-03-06 08:16:25'),
	(29, 'OC-2026-029', 22, 1, 381.36, 68.64, 450.00, 'Recibida', 'Efectivo', '2026-03-05', NULL, '2026-03-05 14:00:00', '2026-03-06 08:16:25'),
	(30, 'OC-2026-030', 10, 1, 635.59, 114.41, 750.00, 'Recibida', 'Efectivo', '2026-03-06', NULL, '2026-03-05 15:00:00', '2026-03-06 08:16:25');

-- Volcando estructura para tabla ferreteria_db.configuracion
CREATE TABLE IF NOT EXISTS `configuracion` (
  `id` int NOT NULL AUTO_INCREMENT,
  `clave` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `valor` text COLLATE utf8mb4_unicode_ci,
  `descripcion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `clave` (`clave`)
) ENGINE=InnoDB AUTO_INCREMENT=63 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.configuracion: ~12 rows (aproximadamente)
DELETE FROM `configuracion`;
INSERT INTO `configuracion` (`id`, `clave`, `valor`, `descripcion`, `updated_at`) VALUES
	(1, 'empresa_nombre', 'Ferretería El Maestro', 'Nombre de la empresa', '2026-03-03 20:11:26'),
	(2, 'empresa_ruc', '20123456789', 'RUC de la empresa', '2026-03-03 18:53:13'),
	(3, 'empresa_direccion', 'Av. Principal 123, Lima', 'Direcci├│n de la empresa', '2026-03-03 18:53:13'),
	(4, 'empresa_telefono', '01-234-5678', 'Tel├®fono de la empresa', '2026-03-03 18:53:13'),
	(5, 'empresa_email', 'ventas@ferreteria.com', 'Email de la empresa', '2026-03-03 18:53:13'),
	(6, 'empresa_logo', 'logo_1772785724257.png', 'Logo de la empresa (ruta)', '2026-03-06 08:28:44'),
	(7, 'igv_porcentaje', '18', 'Porcentaje de IGV', '2026-03-03 18:53:13'),
	(8, 'moneda_simbolo', 'S/', 'S├¡mbolo de moneda', '2026-03-03 18:53:13'),
	(9, 'moneda_nombre', 'Soles', 'Nombre de la moneda', '2026-03-03 18:53:13'),
	(10, 'serie_boleta', 'B001', 'Serie para boletas', '2026-03-03 18:53:13'),
	(11, 'serie_factura', 'F001', 'Serie para facturas', '2026-03-03 18:53:13'),
	(12, 'numero_correlativo', '2', 'N├║mero correlativo de comprobantes', '2026-03-06 06:35:07');

-- Volcando estructura para tabla ferreteria_db.detalle_compras
CREATE TABLE IF NOT EXISTS `detalle_compras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `compra_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `compra_id` (`compra_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `detalle_compras_ibfk_1` FOREIGN KEY (`compra_id`) REFERENCES `compras` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_compras_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.detalle_compras: ~60 rows (aproximadamente)
DELETE FROM `detalle_compras`;
INSERT INTO `detalle_compras` (`id`, `compra_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`, `created_at`) VALUES
	(1, 1, 8, 10, 28.00, 280.00, '2026-03-06 08:16:25'),
	(2, 1, 3, 5, 22.00, 110.00, '2026-03-06 08:16:25'),
	(3, 2, 8, 20, 28.00, 560.00, '2026-03-06 08:16:25'),
	(4, 2, 9, 5, 28.50, 142.50, '2026-03-06 08:16:25'),
	(5, 3, 4, 2, 180.00, 360.00, '2026-03-06 08:16:25'),
	(6, 3, 2, 7, 8.00, 56.00, '2026-03-06 08:16:25'),
	(7, 4, 6, 10, 35.00, 350.00, '2026-03-06 08:16:25'),
	(8, 4, 7, 5, 22.00, 110.00, '2026-03-06 08:16:25'),
	(9, 5, 11, 8, 32.00, 256.00, '2026-03-06 08:16:25'),
	(10, 5, 12, 16, 3.50, 56.00, '2026-03-06 08:16:25'),
	(11, 6, 14, 5, 145.00, 725.00, '2026-03-06 08:16:25'),
	(12, 6, 15, 10, 18.00, 180.00, '2026-03-06 08:16:25'),
	(13, 7, 9, 15, 28.50, 427.50, '2026-03-06 08:16:25'),
	(14, 7, 25, 10, 3.50, 35.00, '2026-03-06 08:16:25'),
	(15, 8, 1, 15, 18.50, 277.50, '2026-03-06 08:16:25'),
	(16, 8, 17, 10, 14.00, 140.00, '2026-03-06 08:16:25'),
	(17, 9, 4, 2, 180.00, 360.00, '2026-03-06 08:16:25'),
	(18, 9, 16, 15, 22.00, 330.00, '2026-03-06 08:16:25'),
	(19, 10, 8, 15, 28.00, 420.00, '2026-03-06 08:16:25'),
	(20, 10, 6, 2, 35.00, 70.00, '2026-03-06 08:16:25'),
	(21, 11, 9, 15, 28.50, 427.50, '2026-03-06 08:16:25'),
	(22, 11, 10, 400, 1.20, 480.00, '2026-03-06 08:16:25'),
	(23, 12, 11, 5, 32.00, 160.00, '2026-03-06 08:16:25'),
	(24, 12, 12, 20, 3.50, 70.00, '2026-03-06 08:16:25'),
	(25, 13, 14, 5, 145.00, 725.00, '2026-03-06 08:16:25'),
	(26, 13, 5, 2, 150.00, 300.00, '2026-03-06 08:16:25'),
	(27, 14, 4, 2, 180.00, 360.00, '2026-03-06 08:16:25'),
	(28, 14, 1, 20, 18.50, 370.00, '2026-03-06 08:16:25'),
	(29, 15, 8, 10, 28.00, 280.00, '2026-03-06 08:16:25'),
	(30, 15, 6, 5, 35.00, 175.00, '2026-03-06 08:16:25'),
	(31, 16, 11, 8, 32.00, 256.00, '2026-03-06 08:16:25'),
	(32, 16, 17, 15, 14.00, 210.00, '2026-03-06 08:16:25'),
	(33, 17, 14, 5, 145.00, 725.00, '2026-03-06 08:16:25'),
	(34, 17, 15, 15, 18.00, 270.00, '2026-03-06 08:16:25'),
	(35, 18, 1, 15, 18.50, 277.50, '2026-03-06 08:16:25'),
	(36, 18, 2, 10, 8.00, 80.00, '2026-03-06 08:16:25'),
	(37, 19, 9, 15, 28.50, 427.50, '2026-03-06 08:16:25'),
	(38, 19, 10, 300, 1.20, 360.00, '2026-03-06 08:16:25'),
	(39, 20, 11, 5, 32.00, 160.00, '2026-03-06 08:16:25'),
	(40, 20, 12, 18, 3.50, 63.00, '2026-03-06 08:16:25'),
	(41, 21, 14, 5, 145.00, 725.00, '2026-03-06 08:16:25'),
	(42, 21, 5, 2, 150.00, 300.00, '2026-03-06 08:16:25'),
	(43, 22, 8, 10, 28.00, 280.00, '2026-03-06 08:16:25'),
	(44, 22, 6, 5, 35.00, 175.00, '2026-03-06 08:16:25'),
	(45, 23, 9, 10, 28.50, 285.00, '2026-03-06 08:16:25'),
	(46, 23, 25, 10, 3.50, 35.00, '2026-03-06 08:16:25'),
	(47, 24, 1, 15, 18.50, 277.50, '2026-03-06 08:16:25'),
	(48, 24, 2, 8, 8.00, 64.00, '2026-03-06 08:16:25'),
	(49, 25, 14, 5, 145.00, 725.00, '2026-03-06 08:16:25'),
	(50, 25, 16, 10, 22.00, 220.00, '2026-03-06 08:16:25'),
	(51, 26, 6, 10, 35.00, 350.00, '2026-03-06 08:16:25'),
	(52, 26, 7, 5, 22.00, 110.00, '2026-03-06 08:16:25'),
	(53, 27, 8, 10, 28.00, 280.00, '2026-03-06 08:16:25'),
	(54, 27, 17, 12, 14.00, 168.00, '2026-03-06 08:16:25'),
	(55, 28, 9, 15, 28.50, 427.50, '2026-03-06 08:16:25'),
	(56, 28, 25, 15, 3.50, 52.50, '2026-03-06 08:16:25'),
	(57, 29, 11, 4, 32.00, 128.00, '2026-03-06 08:16:25'),
	(58, 29, 12, 12, 3.50, 42.00, '2026-03-06 08:16:25'),
	(59, 30, 14, 3, 145.00, 435.00, '2026-03-06 08:16:25'),
	(60, 30, 1, 10, 18.50, 185.00, '2026-03-06 08:16:25');

-- Volcando estructura para tabla ferreteria_db.detalle_ventas
CREATE TABLE IF NOT EXISTS `detalle_ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `venta_id` int NOT NULL,
  `producto_id` int NOT NULL,
  `cantidad` int NOT NULL,
  `precio_unitario` decimal(10,2) NOT NULL,
  `descuento` decimal(10,2) DEFAULT '0.00',
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `venta_id` (`venta_id`),
  KEY `producto_id` (`producto_id`),
  CONSTRAINT `detalle_ventas_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`) ON DELETE CASCADE,
  CONSTRAINT `detalle_ventas_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.detalle_ventas: ~59 rows (aproximadamente)
DELETE FROM `detalle_ventas`;
INSERT INTO `detalle_ventas` (`id`, `venta_id`, `producto_id`, `cantidad`, `precio_unitario`, `descuento`, `subtotal`, `created_at`) VALUES
	(1, 1, 17, 1, 26.00, 0.00, 26.00, '2026-03-06 08:16:07'),
	(2, 2, 6, 3, 65.00, 0.00, 195.00, '2026-03-06 08:16:07'),
	(3, 2, 22, 5, 18.00, 0.00, 90.00, '2026-03-06 08:16:07'),
	(4, 3, 14, 3, 220.00, 0.00, 660.00, '2026-03-06 08:16:07'),
	(5, 3, 8, 3, 33.00, 0.00, 99.00, '2026-03-06 08:16:07'),
	(6, 4, 1, 4, 32.00, 0.00, 128.00, '2026-03-06 08:16:07'),
	(7, 4, 2, 3, 15.00, 0.00, 45.00, '2026-03-06 08:16:07'),
	(8, 5, 17, 2, 26.00, 0.00, 52.00, '2026-03-06 08:16:07'),
	(9, 5, 26, 3, 5.50, 0.00, 16.50, '2026-03-06 08:16:07'),
	(10, 6, 14, 3, 220.00, 0.00, 660.00, '2026-03-06 08:16:07'),
	(11, 6, 8, 15, 33.00, 0.00, 495.00, '2026-03-06 08:16:07'),
	(12, 7, 3, 1, 40.00, 0.00, 40.00, '2026-03-06 08:16:07'),
	(13, 7, 26, 6, 5.50, 0.00, 33.00, '2026-03-06 08:16:07'),
	(14, 8, 6, 4, 65.00, 0.00, 260.00, '2026-03-06 08:16:07'),
	(15, 8, 7, 2, 42.00, 0.00, 84.00, '2026-03-06 08:16:07'),
	(16, 9, 4, 3, 320.00, 0.00, 960.00, '2026-03-06 08:16:07'),
	(17, 9, 2, 4, 15.00, 0.00, 60.00, '2026-03-06 08:16:07'),
	(18, 10, 1, 3, 32.00, 0.00, 96.00, '2026-03-06 08:16:07'),
	(19, 10, 17, 2, 26.00, 0.00, 52.00, '2026-03-06 08:16:07'),
	(20, 11, 16, 2, 14.00, 0.00, 28.00, '2026-03-06 08:16:07'),
	(21, 11, 25, 4, 7.00, 0.00, 28.00, '2026-03-06 08:16:07'),
	(22, 12, 9, 15, 42.00, 0.00, 630.00, '2026-03-06 08:16:07'),
	(23, 12, 10, 200, 1.80, 0.00, 360.00, '2026-03-06 08:16:07'),
	(24, 13, 18, 5, 9.50, 0.00, 47.50, '2026-03-06 08:16:07'),
	(25, 13, 17, 1, 26.00, 0.00, 26.00, '2026-03-06 08:16:07'),
	(26, 14, 6, 2, 65.00, 0.00, 130.00, '2026-03-06 08:16:07'),
	(27, 14, 7, 2, 42.00, 0.00, 84.00, '2026-03-06 08:16:07'),
	(28, 15, 14, 5, 220.00, 0.00, 1100.00, '2026-03-06 08:16:07'),
	(29, 15, 16, 15, 22.00, 0.00, 330.00, '2026-03-06 08:16:07'),
	(30, 16, 1, 5, 32.00, 0.00, 160.00, '2026-03-06 08:16:07'),
	(31, 16, 2, 5, 15.00, 0.00, 75.00, '2026-03-06 08:16:07'),
	(32, 17, 16, 4, 14.00, 0.00, 56.00, '2026-03-06 08:16:07'),
	(33, 17, 18, 10, 9.50, 0.00, 95.00, '2026-03-06 08:16:07'),
	(34, 18, 9, 25, 42.00, 0.00, 1050.00, '2026-03-06 08:16:07'),
	(35, 18, 10, 600, 1.80, 0.00, 1080.00, '2026-03-06 08:16:07'),
	(36, 19, 17, 3, 26.00, 0.00, 78.00, '2026-03-06 08:16:07'),
	(37, 19, 3, 2, 40.00, 0.00, 80.00, '2026-03-06 08:16:07'),
	(38, 20, 6, 4, 65.00, 0.00, 260.00, '2026-03-06 08:16:07'),
	(39, 20, 7, 2, 42.00, 0.00, 84.00, '2026-03-06 08:16:07'),
	(40, 21, 18, 5, 9.50, 0.00, 47.50, '2026-03-06 08:16:07'),
	(41, 21, 17, 1, 26.00, 0.00, 26.00, '2026-03-06 08:16:07'),
	(42, 22, 4, 3, 320.00, 0.00, 960.00, '2026-03-06 08:16:07'),
	(43, 22, 25, 15, 7.00, 0.00, 105.00, '2026-03-06 08:16:07'),
	(44, 23, 16, 3, 14.00, 0.00, 42.00, '2026-03-06 08:16:07'),
	(45, 23, 17, 1, 26.00, 0.00, 26.00, '2026-03-06 08:16:07'),
	(46, 24, 1, 5, 32.00, 0.00, 160.00, '2026-03-06 08:16:07'),
	(47, 24, 2, 5, 15.00, 0.00, 75.00, '2026-03-06 08:16:07'),
	(48, 25, 6, 2, 65.00, 0.00, 130.00, '2026-03-06 08:16:07'),
	(49, 25, 7, 2, 42.00, 0.00, 84.00, '2026-03-06 08:16:07'),
	(50, 26, 14, 3, 220.00, 0.00, 660.00, '2026-03-06 08:16:07'),
	(51, 26, 8, 3, 33.00, 0.00, 99.00, '2026-03-06 08:16:07'),
	(52, 27, 16, 4, 14.00, 0.00, 56.00, '2026-03-06 08:16:07'),
	(53, 27, 18, 6, 9.50, 0.00, 57.00, '2026-03-06 08:16:07'),
	(54, 28, 9, 20, 42.00, 0.00, 840.00, '2026-03-06 08:16:07'),
	(55, 28, 10, 300, 1.80, 0.00, 540.00, '2026-03-06 08:16:07'),
	(56, 29, 3, 1, 40.00, 0.00, 40.00, '2026-03-06 08:16:07'),
	(57, 29, 22, 2, 35.00, 0.00, 70.00, '2026-03-06 08:16:07'),
	(58, 30, 1, 3, 32.00, 0.00, 96.00, '2026-03-06 08:16:07'),
	(59, 30, 18, 5, 9.50, 0.00, 47.50, '2026-03-06 08:16:07');

-- Volcando estructura para tabla ferreteria_db.inventario_movimientos
CREATE TABLE IF NOT EXISTS `inventario_movimientos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `producto_id` int NOT NULL,
  `usuario_id` int NOT NULL,
  `tipo` enum('Entrada','Salida','Ajuste','Venta','Compra') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cantidad` int NOT NULL,
  `stock_antes` int DEFAULT NULL,
  `stock_despues` int DEFAULT NULL,
  `motivo` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `referencia_id` int DEFAULT NULL,
  `referencia_tipo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `producto_id` (`producto_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `inventario_movimientos_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `inventario_movimientos_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.inventario_movimientos: ~16 rows (aproximadamente)
DELETE FROM `inventario_movimientos`;
INSERT INTO `inventario_movimientos` (`id`, `producto_id`, `usuario_id`, `tipo`, `cantidad`, `stock_antes`, `stock_despues`, `motivo`, `referencia_id`, `referencia_tipo`, `created_at`) VALUES
	(1, 8, 1, 'Entrada', 10, 0, 10, 'Compra OC-2026-001', NULL, NULL, '2026-03-06 08:16:07'),
	(2, 3, 1, 'Entrada', 5, 0, 5, 'Compra OC-2026-001', NULL, NULL, '2026-03-06 08:16:07'),
	(3, 8, 1, 'Entrada', 20, 10, 30, 'Compra OC-2026-002', NULL, NULL, '2026-03-06 08:16:07'),
	(4, 9, 1, 'Entrada', 5, 0, 5, 'Compra OC-2026-002', NULL, NULL, '2026-03-06 08:16:07'),
	(5, 4, 1, 'Entrada', 2, 0, 2, 'Compra OC-2026-003', NULL, NULL, '2026-03-06 08:16:07'),
	(6, 6, 1, 'Entrada', 10, 0, 10, 'Compra OC-2026-004', NULL, NULL, '2026-03-06 08:16:07'),
	(7, 11, 1, 'Entrada', 8, 0, 8, 'Compra OC-2026-005', NULL, NULL, '2026-03-06 08:16:07'),
	(8, 12, 1, 'Entrada', 16, 0, 16, 'Compra OC-2026-005', NULL, NULL, '2026-03-06 08:16:07'),
	(9, 14, 1, 'Entrada', 5, 0, 5, 'Compra OC-2026-006', NULL, NULL, '2026-03-06 08:16:07'),
	(10, 15, 1, 'Entrada', 10, 0, 10, 'Compra OC-2026-006', NULL, NULL, '2026-03-06 08:16:07'),
	(11, 9, 1, 'Entrada', 15, 5, 20, 'Compra OC-2026-007', NULL, NULL, '2026-03-06 08:16:07'),
	(12, 25, 1, 'Entrada', 10, 0, 10, 'Compra OC-2026-007', NULL, NULL, '2026-03-06 08:16:07'),
	(13, 1, 1, 'Entrada', 15, 0, 15, 'Compra OC-2026-008', NULL, NULL, '2026-03-06 08:16:07'),
	(14, 17, 1, 'Entrada', 10, 0, 10, 'Compra OC-2026-008', NULL, NULL, '2026-03-06 08:16:07'),
	(15, 4, 1, 'Entrada', 2, 2, 4, 'Compra OC-2026-009', NULL, NULL, '2026-03-06 08:16:07'),
	(16, 16, 1, 'Entrada', 15, 0, 15, 'Compra OC-2026-009', NULL, NULL, '2026-03-06 08:16:07');

-- Volcando estructura para tabla ferreteria_db.productos
CREATE TABLE IF NOT EXISTS `productos` (
  `id` int NOT NULL AUTO_INCREMENT,
  `codigo` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nombre` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` text COLLATE utf8mb4_unicode_ci,
  `categoria_id` int DEFAULT NULL,
  `proveedor_id` int DEFAULT NULL,
  `precio_compra` decimal(10,2) DEFAULT '0.00',
  `precio_venta` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock` int DEFAULT '0',
  `stock_minimo` int DEFAULT '5',
  `unidad` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT 'und',
  `imagen` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `codigo` (`codigo`),
  KEY `categoria_id` (`categoria_id`),
  KEY `proveedor_id` (`proveedor_id`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL,
  CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`proveedor_id`) REFERENCES `proveedores` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.productos: ~30 rows (aproximadamente)
DELETE FROM `productos`;
INSERT INTO `productos` (`id`, `codigo`, `nombre`, `descripcion`, `categoria_id`, `proveedor_id`, `precio_compra`, `precio_venta`, `stock`, `stock_minimo`, `unidad`, `imagen`, `activo`, `created_at`, `updated_at`) VALUES
	(1, 'HRMT-001', 'Martillo de Carpintero 16oz', 'Mango fibra de vidrio, cabeza acero', 1, 28, 18.50, 32.00, 45, 5, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(2, 'HRMT-002', 'Destornillador Estrella 6in', 'Acero cromo-vanadio, mango TPR', 1, 28, 8.00, 15.00, 60, 10, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(3, 'HRMT-003', 'Alicates Combinados 8in', 'Acero cold-stamp, mango aislado', 1, 28, 22.00, 40.00, 35, 5, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(4, 'ELEC-001', 'Taladro Percutor 500W', 'Con empunadura lateral, estuche', 2, 29, 180.00, 320.00, 2, 10, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:18:31'),
	(5, 'ELEC-002', 'Amoladora Angular 4.5in 710W', 'Disco de desbaste incluido', 2, 29, 150.00, 260.00, 1, 5, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:18:31'),
	(6, 'PINT-001', 'Pintura Latex Blanco 4L', 'Rendimiento 25-30 m2/galon, lavable', 3, 6, 35.00, 65.00, 5, 15, 'bal', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:18:31'),
	(7, 'PINT-002', 'Pintura Esmalte Gris 1/4', 'Secado rapido, alta cobertura', 3, 6, 22.00, 42.00, 50, 8, 'bal', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(8, 'CONS-001', 'Cemento Sol 42.5kg', 'Tipo I, resistencia alta', 4, 9, 28.00, 33.00, 200, 20, 'bol', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(9, 'CONS-002', 'Fierro Corrugado 1/2in x 9m', 'Acero ASTM A615 Grado 60', 4, 14, 28.50, 42.00, 150, 15, 'var', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(10, 'CONS-003', 'Ladrillo Royal King', 'Ladrillo arcilla 18 huecos', 4, 15, 1.20, 1.80, 2000, 200, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(11, 'PLOM-001', 'Tubo PVC 4in x 3m Desague', 'Presion NTP ISO 4435', 5, 21, 32.00, 52.00, 60, 8, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(12, 'PLOM-002', 'Codo PVC 4in x 90', 'Para tubo desague', 5, 21, 3.50, 6.50, 120, 20, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(13, 'PLOM-003', 'Llave de Paso Bronce 1/2in', 'Cuerpo bronce fundido', 5, 22, 18.00, 35.00, 3, 8, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:18:31'),
	(14, 'ELCT-001', 'Cable THW 2.5mm2 x 100m', 'Conductor cobre, aislante PVC 75C', 6, 26, 145.00, 220.00, 4, 20, 'rol', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:18:31'),
	(15, 'ELCT-002', 'Interruptor Simple Bticino', 'Linea Living Light, 10A 220V', 6, 22, 18.00, 32.00, 80, 10, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(16, 'ELCT-003', 'Foco LED 9W E27 Blanco Frio', '6500K, vida util 25000h', 6, 22, 7.50, 14.00, 200, 20, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(17, 'FIJC-001', 'Tornillo Drywall 6x1in caja 100', 'Cabeza trompeta, fosfatado', 7, 18, 4.50, 9.00, 150, 15, 'cja', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(18, 'FIJC-002', 'Taco Fisher 6mm bolsa 25', 'Nylon blanco para pared', 7, 18, 2.00, 5.50, 200, 20, 'bol', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(19, 'FIJC-003', 'Clavo de Acero 2in (kg)', 'Para madera y bloques de concreto', 7, 18, 5.50, 9.50, 80, 10, 'kg', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(20, 'MADE-001', 'Triplay Lupuna 4x8x4mm', 'Acabado laminado, uso interior', 8, 10, 42.00, 68.00, 2, 5, 'pla', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:18:31'),
	(21, 'ADHV-001', 'Silicona Transparente Sika 280ml', 'Para sellado de juntas, resistente al agua', 9, 24, 9.00, 18.00, 90, 10, 'tbo', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(22, 'ADHV-002', 'Pegamento PVC Oatey 240ml', 'Para tuberias PVC presion', 9, 24, 12.00, 22.00, 60, 8, 'tbo', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(23, 'SEGR-001', 'Casco de Seguridad Blanco ANSI', 'Clase E, dielectrico', 10, 20, 23.00, 42.00, 2, 10, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:18:31'),
	(24, 'SEGR-002', 'Guantes de Cuero Industrial', 'Talla L, reforzado en palma', 10, 20, 8.00, 16.00, 80, 10, 'par', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(25, 'ABRS-001', 'Disco de Corte 4.5in x 1mm Metal', 'Max 13000 RPM', 16, 14, 3.50, 7.00, 150, 20, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(26, 'ABRS-002', 'Lija al Agua 220 pliego', 'Para madera y metales', 16, 14, 0.80, 1.80, 300, 30, 'pli', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(27, 'MEDI-001', 'Wincha Stanley 5m', 'Cinta metalica, cierre automatico', 17, 28, 14.00, 26.00, 55, 8, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(28, 'IMPR-001', 'Sika Impermeabilizante 4kg', 'Para losas y paredes humedas', 20, 24, 38.00, 65.00, 35, 5, 'bal', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(29, 'JARDN-001', 'Manguera Flexible 15m', 'Diametro 3/4in, con aspersor', 11, 7, 20.00, 38.00, 25, 4, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(30, 'ILUM-001', 'Reflector LED 50W IP65', 'Luz blanca 4000K, exterior', 15, 22, 55.00, 95.00, 20, 3, 'und', NULL, 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07');

-- Volcando estructura para tabla ferreteria_db.proveedores
CREATE TABLE IF NOT EXISTS `proveedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `empresa` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `ruc` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `contacto` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `telefono` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `direccion` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.proveedores: ~30 rows (aproximadamente)
DELETE FROM `proveedores`;
INSERT INTO `proveedores` (`id`, `empresa`, `ruc`, `contacto`, `telefono`, `email`, `direccion`, `activo`, `created_at`, `updated_at`) VALUES
	(1, 'Distribuidora Lima S.A.C.', '20123456789', 'Carlos Ruiz', '01-4567890', 'ventas@distlima.pe', 'Av. Argentina 1200, Lima', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(2, 'Maestro Home Center', '20234567891', 'Ana Torres', '01-6123400', 'compras@maestro.pe', 'Av. Javier Prado 4200, San Borja', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(3, 'Sodimac Peru S.A.', '20345678902', 'Jorge Vega', '01-6124500', 'proveedores@sodimac.pe', 'Av. La Marina 2300, San Miguel', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(4, 'Promart Homecenter', '20456789013', 'Maria Lopez', '01-5121300', 'ventas@promart.pe', 'Av. Aviacion 2400, San Borja', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(5, 'Ferrocementos S.A.C.', '20567890124', NULL, '01-3321100', 'info@ferroc.pe', 'Jr. Cusco 450, Lima', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(6, 'Pinturas Sur S.A.', '20678901235', 'Roberto Diaz', '054-221100', 'ventas@pinturas-sur.pe', 'Av. Ejercito 310, Arequipa', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(7, 'Electro Bolivia S.R.L.', '20789012346', NULL, '01-4423100', 'electrobolivia@gmail.com', 'Jr. Bolivia 540, Lima', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(8, 'Ferreterias Unidas E.I.R.L.', '20890123457', 'Sandra Quiroz', '044-231100', 'ferrunidastrujillo@gmail.com', 'Jr. Gamarra 120, Trujillo', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(9, 'Cementos Pacasmayo S.A.A.', '20901234568', NULL, '044-482800', 'ventas@cementospacasmayo.pe', 'Av. Espana 550, Trujillo', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(10, 'FACO Importaciones S.A.C.', '21012345679', 'Luis Herrera', '01-3312200', 'faco@faco.pe', 'Los Ficus 230, San Isidro', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(11, 'Tecnologia Electrica S.A.', '21123456780', NULL, '01-5671200', 'tecelectrica@hotmail.com', 'Av. Colonial 1800, Lima', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(12, 'Global Tools Peru S.A.C.', '21234567891', 'Patricia Salas', '01-4451100', 'globaltools@gmail.com', 'Jr. Ucayali 340, Lima', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(13, 'Pinturas CPP S.A.', '21345678902', NULL, '01-6132200', 'cpp@cpp.com.pe', 'Av. Venezuela 1450, Lima', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(14, 'Aceros Arequipa S.A.', '21456789013', 'Cesar Ccori', '054-381100', 'ventaslima@acerosarequipa.pe', 'Av. Republica 200, Lima', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(15, 'Corporacion Misti S.A.C.', '21567890124', NULL, '054-222100', 'misti@misti.pe', 'Av. Ejercito 220, Arequipa', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(16, 'Tubos y Conexiones E.I.R.L.', '21678901235', 'Liliana Cruz', '01-3312300', 'tubos@tubosconn.pe', 'Jr. Puno 678, Lima', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(17, 'Ferrexperto S.A.C.', '21789012346', NULL, '01-4451200', 'ferrexperto@ferrexperto.pe', 'Av. Proceres 670, SJL', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(18, 'Distribuidora MIRO S.R.L.', '21890123457', 'Miguel Rios', '01-5561100', 'miro@miro.pe', 'Jr. Angaraes 120, Lima', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(19, 'BLAK Hardware Peru E.I.R.L.', '21901234568', NULL, '01-6131100', 'blak@blakhardware.pe', 'Av. Brasil 2100, Pueblo Libre', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(20, 'Import-Ferreteria S.A.C.', '22012345679', 'Erika Cardenas', '064-231600', 'if@importferreteria.pe', 'Jr. Loreto 230, Huancayo', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(21, 'Pavco Wavin Peru S.A.', '22123456780', NULL, '01-6170000', 'pavco@pavco.pe', 'Av. Alfredo Mendiola 4300, Los Olivos', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(22, 'Schneider Electric Peru S.A.', '22234567891', 'Raul Flores', '01-3110600', 'schneider@se.com.pe', 'Av. Republica Panama 3074, SBC', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(23, '3M Peru S.A.', '22345678902', NULL, '01-5176700', '3mperu@mmm.com', 'Av. Comandante Espinar 551, Miraflores', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(24, 'Sika Peru S.A.', '22456789013', 'Teresa Nunez', '01-3170511', 'sika@sika.com', 'Av. Argentina 3699, Callao', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(25, 'Tigre Peru S.A.C.', '22567890124', NULL, '01-7620800', 'tigre@tigre.com.pe', 'Av. Naciones Unidas 475, Los Olivos', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(26, 'Indeco S.A.', '22678901235', NULL, '01-7197100', 'indeco@indeco.pe', 'Carr. Central km 6.5, Ate', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(27, 'Hilti Peru S.A.', '22789012346', 'Frank Muller', '0800-15230', 'hilti@hilti.pe', 'Av. Javier Prado Este 505, La Molina', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(28, 'Stanley Black y Decker S.A.', '22890123457', NULL, '01-6193400', 'stanley@sbdinc.com', 'Av. Camino Real 1234, SIC', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(29, 'Bosch Herramientas Peru S.A.', '22901234568', 'Hans Werner', '01-4422200', 'bosch@bosch.pe', 'Calle Los Tulipanes 147, Lima', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07'),
	(30, 'DeWalt Peru E.I.R.L.', '23012345679', 'Andrea Pizarro', '01-7123400', 'dewalt@dewalt.pe', 'Jr. Miro Quesada 123, Lima', 1, '2026-03-06 08:16:07', '2026-03-06 08:16:07');

-- Volcando estructura para tabla ferreteria_db.roles
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descripcion` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.roles: ~3 rows (aproximadamente)
DELETE FROM `roles`;
INSERT INTO `roles` (`id`, `nombre`, `descripcion`, `created_at`, `updated_at`) VALUES
	(1, 'Administrador', 'Acceso completo al sistema', '2026-03-03 18:53:13', '2026-03-03 18:53:13'),
	(2, 'Cajero', 'Acceso al POS y ventas', '2026-03-03 18:53:13', '2026-03-03 18:53:13'),
	(3, 'Almacenero', 'Acceso a inventario y compras', '2026-03-03 18:53:13', '2026-03-03 18:53:13');

-- Volcando estructura para tabla ferreteria_db.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password_hash` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `rol_id` int NOT NULL,
  `activo` tinyint(1) DEFAULT '1',
  `ultimo_login` datetime DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `rol_id` (`rol_id`),
  CONSTRAINT `usuarios_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.usuarios: ~1 rows (aproximadamente)
DELETE FROM `usuarios`;
INSERT INTO `usuarios` (`id`, `nombre`, `email`, `password_hash`, `rol_id`, `activo`, `ultimo_login`, `created_at`, `updated_at`) VALUES
	(1, 'Administrador', 'admin@ferreteria.com', '$2a$10$zDWeFGt3Fd0oZ7e0yE71dOlGH8Y07KO4TFYAGN/OQq1D2fUnvM3Nm', 1, 1, '2026-03-06 13:41:32', '2026-03-03 18:53:13', '2026-03-06 18:41:32');

-- Volcando estructura para tabla ferreteria_db.ventas
CREATE TABLE IF NOT EXISTS `ventas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_comprobante` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tipo_comprobante` enum('Boleta','Factura','Ticket') COLLATE utf8mb4_unicode_ci DEFAULT 'Boleta',
  `cliente_id` int DEFAULT NULL,
  `usuario_id` int NOT NULL,
  `subtotal` decimal(10,2) DEFAULT '0.00',
  `igv` decimal(10,2) DEFAULT '0.00',
  `total` decimal(10,2) DEFAULT '0.00',
  `descuento` decimal(10,2) DEFAULT '0.00',
  `tipo_pago` enum('Efectivo','Tarjeta','Yape','Plin','Credito') COLLATE utf8mb4_unicode_ci DEFAULT 'Efectivo',
  `monto_recibido` decimal(10,2) DEFAULT NULL,
  `vuelto` decimal(10,2) DEFAULT NULL,
  `estado` enum('Completada','Anulada','Pendiente') COLLATE utf8mb4_unicode_ci DEFAULT 'Completada',
  `observaciones` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `numero_comprobante` (`numero_comprobante`),
  KEY `cliente_id` (`cliente_id`),
  KEY `usuario_id` (`usuario_id`),
  CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL,
  CONSTRAINT `ventas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=31 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Volcando datos para la tabla ferreteria_db.ventas: ~30 rows (aproximadamente)
DELETE FROM `ventas`;
INSERT INTO `ventas` (`id`, `numero_comprobante`, `tipo_comprobante`, `cliente_id`, `usuario_id`, `subtotal`, `igv`, `total`, `descuento`, `tipo_pago`, `monto_recibido`, `vuelto`, `estado`, `observaciones`, `created_at`, `updated_at`) VALUES
	(1, 'B001-00001', 'Boleta', 1, 1, 21.19, 3.81, 25.00, 0.00, 'Efectivo', 30.00, 5.00, 'Completada', NULL, '2026-02-05 14:30:00', '2026-03-06 08:16:07'),
	(2, 'B001-00002', 'Boleta', 2, 1, 254.24, 45.76, 300.00, 0.00, 'Yape', 300.00, 0.00, 'Completada', NULL, '2026-02-05 15:15:00', '2026-03-06 08:16:07'),
	(3, 'F001-00001', 'Factura', 3, 1, 635.59, 114.41, 750.00, 0.00, 'Credito', 750.00, 0.00, 'Completada', NULL, '2026-02-05 16:00:00', '2026-03-06 08:16:07'),
	(4, 'B001-00003', 'Boleta', 4, 1, 169.49, 30.51, 200.00, 0.00, 'Efectivo', 200.00, 0.00, 'Completada', NULL, '2026-02-05 19:00:00', '2026-03-06 08:16:07'),
	(5, 'B001-00004', 'Boleta', 5, 1, 55.08, 9.92, 65.00, 0.00, 'Efectivo', 70.00, 5.00, 'Completada', NULL, '2026-02-06 14:00:00', '2026-03-06 08:16:07'),
	(6, 'F001-00002', 'Factura', 7, 1, 1059.32, 190.68, 1250.00, 0.00, 'Credito', 1250.00, 0.00, 'Completada', NULL, '2026-02-06 16:30:00', '2026-03-06 08:16:07'),
	(7, 'B001-00005', 'Boleta', 6, 1, 59.32, 10.68, 70.00, 0.00, 'Tarjeta', 70.00, 0.00, 'Completada', NULL, '2026-02-07 15:00:00', '2026-03-06 08:16:07'),
	(8, 'B001-00006', 'Boleta', 9, 1, 338.98, 61.02, 400.00, 0.00, 'Yape', 400.00, 0.00, 'Completada', NULL, '2026-02-07 20:00:00', '2026-03-06 08:16:07'),
	(9, 'F001-00003', 'Factura', 11, 1, 847.46, 152.54, 1000.00, 0.00, 'Credito', 1000.00, 0.00, 'Completada', NULL, '2026-02-10 15:00:00', '2026-03-06 08:16:07'),
	(10, 'B001-00007', 'Boleta', 12, 1, 127.12, 22.88, 150.00, 0.00, 'Efectivo', 150.00, 0.00, 'Completada', NULL, '2026-02-10 19:00:00', '2026-03-06 08:16:07'),
	(11, 'B001-00008', 'Boleta', 13, 1, 84.75, 15.25, 100.00, 0.00, 'Plin', 100.00, 0.00, 'Completada', NULL, '2026-02-10 21:00:00', '2026-03-06 08:16:07'),
	(12, 'F001-00004', 'Factura', 14, 1, 1652.54, 297.46, 1950.00, 0.00, 'Credito', 1950.00, 0.00, 'Completada', NULL, '2026-02-17 15:00:00', '2026-03-06 08:16:07'),
	(13, 'B001-00009', 'Boleta', 15, 1, 42.37, 7.63, 50.00, 0.00, 'Efectivo', 50.00, 0.00, 'Completada', NULL, '2026-02-17 16:00:00', '2026-03-06 08:16:07'),
	(14, 'B001-00010', 'Boleta', 16, 1, 211.86, 38.14, 250.00, 0.00, 'Yape', 250.00, 0.00, 'Completada', NULL, '2026-02-18 14:30:00', '2026-03-06 08:16:07'),
	(15, 'F001-00005', 'Factura', 7, 1, 1186.44, 213.56, 1400.00, 0.00, 'Credito', 1400.00, 0.00, 'Completada', NULL, '2026-02-18 16:00:00', '2026-03-06 08:16:07'),
	(16, 'B001-00011', 'Boleta', 1, 1, 169.49, 30.51, 200.00, 0.00, 'Efectivo', 200.00, 0.00, 'Completada', NULL, '2026-02-20 15:00:00', '2026-03-06 08:16:07'),
	(17, 'B001-00012', 'Boleta', 2, 1, 84.75, 15.25, 100.00, 0.00, 'Tarjeta', 100.00, 0.00, 'Completada', NULL, '2026-02-20 19:00:00', '2026-03-06 08:16:07'),
	(18, 'F001-00006', 'Factura', 3, 1, 2118.64, 381.36, 2500.00, 0.00, 'Credito', 2500.00, 0.00, 'Completada', NULL, '2026-02-25 14:00:00', '2026-03-06 08:16:07'),
	(19, 'B001-00013', 'Boleta', 9, 1, 127.12, 22.88, 150.00, 0.00, 'Efectivo', 150.00, 0.00, 'Completada', NULL, '2026-02-25 16:00:00', '2026-03-06 08:16:07'),
	(20, 'B001-00014', 'Boleta', 10, 1, 338.98, 61.02, 400.00, 0.00, 'Yape', 400.00, 0.00, 'Completada', NULL, '2026-02-25 20:00:00', '2026-03-06 08:16:07'),
	(21, 'B001-00015', 'Boleta', 12, 1, 55.08, 9.92, 65.00, 0.00, 'Efectivo', 65.00, 0.00, 'Completada', NULL, '2026-02-26 15:00:00', '2026-03-06 08:16:07'),
	(22, 'F001-00007', 'Factura', 26, 1, 847.46, 152.54, 1000.00, 0.00, 'Credito', 1000.00, 0.00, 'Completada', NULL, '2026-02-26 19:00:00', '2026-03-06 08:16:07'),
	(23, 'B001-00016', 'Boleta', 13, 1, 42.37, 7.63, 50.00, 0.00, 'Plin', 50.00, 0.00, 'Completada', NULL, '2026-02-28 14:00:00', '2026-03-06 08:16:07'),
	(24, 'B001-00017', 'Boleta', 5, 1, 254.24, 45.76, 300.00, 0.00, 'Efectivo', 300.00, 0.00, 'Completada', NULL, '2026-02-28 16:00:00', '2026-03-06 08:16:07'),
	(25, 'B001-00018', 'Boleta', 15, 1, 169.49, 30.51, 200.00, 0.00, 'Yape', 200.00, 0.00, 'Completada', NULL, '2026-03-03 14:30:00', '2026-03-06 08:16:07'),
	(26, 'F001-00008', 'Factura', 30, 1, 635.59, 114.41, 750.00, 0.00, 'Credito', 750.00, 0.00, 'Completada', NULL, '2026-03-03 16:00:00', '2026-03-06 08:16:07'),
	(27, 'B001-00019', 'Boleta', 24, 1, 84.75, 15.25, 100.00, 0.00, 'Efectivo', 100.00, 0.00, 'Completada', NULL, '2026-03-04 15:00:00', '2026-03-06 08:16:07'),
	(28, 'F001-00009', 'Factura', 11, 1, 1271.19, 228.81, 1500.00, 0.00, 'Credito', 1500.00, 0.00, 'Completada', NULL, '2026-03-04 19:00:00', '2026-03-06 08:16:07'),
	(29, 'B001-00020', 'Boleta', 6, 1, 59.32, 10.68, 70.00, 0.00, 'Yape', 70.00, 0.00, 'Completada', NULL, '2026-03-05 14:00:00', '2026-03-06 08:16:07'),
	(30, 'B001-00021', 'Boleta', 9, 1, 127.12, 22.88, 150.00, 0.00, 'Efectivo', 160.00, 10.00, 'Completada', NULL, '2026-03-06 14:30:00', '2026-03-06 08:16:07');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
