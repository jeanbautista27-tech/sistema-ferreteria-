-- =====================================================
--  DATOS DE PRUEBA - Sistema Ferretería El Maestro
--  30 registros por módulo (aprox.)
-- =====================================================
SET FOREIGN_KEY_CHECKS = 0;
SET NAMES utf8mb4;

-- =====================================================
--  CATEGORÍAS (30)
-- =====================================================
INSERT INTO categorias (nombre, descripcion, activo, created_at, updated_at) VALUES
('Herramientas Manuales','Martillos, destornilladores, llaves, alicates',1,NOW(),NOW()),
('Herramientas Eléctricas','Taladros, amoladoras, sierras eléctricas',1,NOW(),NOW()),
('Pinturas y Acabados','Pintura látex, esmalte, selladores, rodillos',1,NOW(),NOW()),
('Construcción','Cemento, arena, ladrillos, fierro corrugado',1,NOW(),NOW()),
('Plomería','Tubos PVC, llaves de agua, codos, válvulas',1,NOW(),NOW()),
('Electricidad','Cables, interruptores, enchufes, focos LED',1,NOW(),NOW()),
('Fijaciones','Clavos, tornillos, pernos, tacos Fisher',1,NOW(),NOW()),
('Maderas','Tablones, triplay, MDF, molduras',1,NOW(),NOW()),
('Adhesivos','Pegamentos, silicona, masilla, teipe',1,NOW(),NOW()),
('Seguridad','Cascos, guantes, lentes, zapatos de seguridad',1,NOW(),NOW()),
('Jardín','Mangueras, aspersores, macetas, tierra fértil',1,NOW(),NOW()),
('Techado','Calaminas, tejas, impermeabilizantes, canales',1,NOW(),NOW()),
('Puertas y Ventanas','Bisagras, cerraduras, jalaores, rieles',1,NOW(),NOW()),
('Soldadura','Electrodos, máscaras de soldar, alambre MIG',1,NOW(),NOW()),
('Iluminación','Reflectores, luminarias LED, spots empotrados',1,NOW(),NOW()),
('Abrasivos','Lijas, discos de corte, discos de desbaste',1,NOW(),NOW()),
('Medición','Metros, niveles, escuadras, vernier',1,NOW(),NOW()),
('Compresor y Neumática','Compresoras, pistolas de pintura, mangueras',1,NOW(),NOW()),
('Pisos y Cerámicos','Porcelanato, cerámico, fragua, pegamento gris',1,NOW(),NOW()),
('Impermeabilizantes','Sika, Chematex, Kömex, membrana asfáltica',1,NOW(),NOW()),
('Accesorios de Baño','Inodoros, lavatorios, duchas, griferías',1,NOW(),NOW()),
('Cable y Ductos','Conduit, cable THW, cable vulcanizado',1,NOW(),NOW()),
('Válvulas Industriales','Válvulas de bola, check, compuerta',1,NOW(),NOW()),
('Equipos de Elevación','Polipastos, carretillas, montacargas manuales',1,NOW(),NOW()),
('Limpieza Industrial','Escobas, trapeadores, desengrasantes',1,NOW(),NOW()),
('Señalización','Cintas de peligro, señales de seguridad, conos',1,NOW(),NOW()),
('Ferretería General','Varillas, ganchos, alcayatas, escuadras',1,NOW(),NOW()),
('Bombas de Agua','Bombas centrífugas, sumergibles, accesorios',1,NOW(),NOW()),
('Andamios','Andamios tubulares, crucetas, tablones de andamio',1,NOW(),NOW()),
('Generadores','Grupos electrógenos, extensiones industriales',1,NOW(),NOW());

-- =====================================================
--  PROVEEDORES (30)
-- =====================================================
INSERT INTO proveedores (empresa, ruc, telefono, email, direccion, contacto, activo, created_at, updated_at) VALUES
('Distribuidora Lima S.A.C.','20123456789','01-4567890','ventas@distlima.pe','Av. Argentina 1200, Lima','Carlos Ruiz',1,NOW(),NOW()),
('Maestro Home Center','20234567891','01-6123400','compras@maestro.pe','Av. Javier Prado 4200, San Borja','Ana Torres',1,NOW(),NOW()),
('Sodimac Perú S.A.','20345678902','01-6124500','proveedores@sodimac.pe','Av. La Marina 2300, San Miguel','Jorge Vega',1,NOW(),NOW()),
('Promart Homecenter','20456789013','01-5121300','ventas@promart.pe','Av. Aviación 2400, San Borja','María López',1,NOW(),NOW()),
('Ferrocementos S.A.C.','20567890124','01-3321100','info@ferroc.pe','Jr. Cusco 450, Lima',NULL,1,NOW(),NOW()),
('Pinturas Sur S.A.','20678901235','054-221100','ventas@pinturas-sur.pe','Av. Ejercito 310, Arequipa','Roberto Díaz',1,NOW(),NOW()),
('Electro Bolivia S.R.L.','20789012346','01-4423100','electrobolivia@gmail.com','Jr. Bolivia 540, Lima',NULL,1,NOW(),NOW()),
('Ferreterías Unidas E.I.R.L.','20890123457','044-231100','ferrunidastrujillo@gmail.com','Jr. Gamarra 120, Trujillo','Sandra Quiroz',1,NOW(),NOW()),
('Cementos Pacasmayo S.A.A.','20901234568','044-482800','ventas@cementospacasmayo.pe','Av. España 550, Trujillo',NULL,1,NOW(),NOW()),
('FACO Importaciones S.A.C.','21012345679','01-3312200','faco@faco.pe','Los Ficus 230, San Isidro','Luis Herrera',1,NOW(),NOW()),
('Tecnología Eléctrica S.A.','21123456780','01-5671200','tecelectrica@hotmail.com','Av. Colonial 1800, Lima',NULL,1,NOW(),NOW()),
('Global Tools Perú S.A.C.','21234567891','01-4451100','globaltools@gmail.com','Jr. Ucayali 340, Lima','Patricia Salas',1,NOW(),NOW()),
('Pinturas CPP S.A.','21345678902','01-6132200','cpp@cpp.com.pe','Av. Venezuela 1450, Lima',NULL,1,NOW(),NOW()),
('Aceros Arequipa S.A.','21456789013','054-381100','ventaslima@acerosarequipa.pe','Av. Republica 200, Lima','César Ccori',1,NOW(),NOW()),
('Corporación Misti S.A.C.','21567890124','054-222100','misti@misti.pe','Av. Ejército 220, Arequipa',NULL,1,NOW(),NOW()),
('Tubos y Conexiones E.I.R.L.','21678901235','01-3312300','tubos@tubosconn.pe','Jr. Puno 678, Lima','Liliana Cruz',1,NOW(),NOW()),
('Ferrexperto S.A.C.','21789012346','01-4451200','ferrexperto@ferrexperto.pe','Av. Próceres 670, SJL',NULL,1,NOW(),NOW()),
('Distribuidora MIRO S.R.L.','21890123457','01-5561100','miro@miro.pe','Jr. Angaraes 120, Lima','Miguel Ríos',1,NOW(),NOW()),
('BLAK Hardware Perú E.I.R.L.','21901234568','01-6131100','blak@blakhardware.pe','Av. Brasil 2100, Pueblo Libre',NULL,1,NOW(),NOW()),
('Import-Ferretería S.A.C.','22012345679','064-231600','if@importferreteria.pe','Jr. Loreto 230, Huancayo','Erika Cárdenas',1,NOW(),NOW()),
('Pavco Wavin Perú S.A.','22123456780','01-6170000','pavco@pavco.pe','Av. Alfredo Mendiola 4300, Los Olivos',NULL,1,NOW(),NOW()),
('Schneider Electric Perú S.A.','22234567891','01-3110600','schneider@se.com.pe','Av. Republica Panamá 3074, SBC','Raúl Flores',1,NOW(),NOW()),
('3M Perú S.A.','22345678902','01-5176700','3mperu@mmm.com','Av. Comandante Espinar 551, Miraflores',NULL,1,NOW(),NOW()),
('Sika Perú S.A.','22456789013','01-3170511','sika@sika.com','Av. Argentina 3699, Callao','Teresa Núñez',1,NOW(),NOW()),
('Tigre Perú S.A.C.','22567890124','01-7620800','tigre@tigre.com.pe','Av. Naciones Unidas 475, Los Olivos',NULL,1,NOW(),NOW()),
('Indeco S.A.','22678901235','01-7197100','indeco@indeco.pe','Carr. Central km 6.5, Ate',NULL,1,NOW(),NOW()),
('Hilti (Perú) S.A.','22789012346','0800-15230','hilti@hilti.pe','Av. Javier Prado Este 505, La Molina','Frank Müller',1,NOW(),NOW()),
('Stanley Black & Decker S.A.','22890123457','01-6193400','stanley@sbdinc.com','Av. Camino Real 1234, SIC',NULL,1,NOW(),NOW()),
('Bosch Herramientas Perú S.A.','22901234568','01-4422200','bosch@bosch.pe','Calle Los Tulipanes 147, Lima','Hans Werner',1,NOW(),NOW()),
('DeWalt Perú E.I.R.L.','23012345679','01-7123400','dewalt@dewalt.pe','Jr. Miro Quesada 123, Lima','Andrea Pizarro',1,NOW(),NOW());

-- =====================================================
--  CLIENTES (30)
-- =====================================================
INSERT INTO clientes (nombre, tipo_documento, numero_documento, telefono, email, direccion, tipo_cliente, activo, created_at, updated_at) VALUES
('Juan Carlos Mendoza','DNI','45123678','987654321','jcmendoza@gmail.com','Jr. Las Flores 234, Lima','Regular',1,NOW(),NOW()),
('María García','DNI','48239456','998877665','maria.garcia@hotmail.com','Av. Los Pinos 120, Lima','Regular',1,NOW(),NOW()),
('Constructora ABC S.A.C.','RUC','20123789456','01-4321100','compras@constructoraabc.pe','Av. Industrial 450, Lurín','Mayorista',1,NOW(),NOW()),
('Taller El Maestro E.I.R.L.','RUC','20234890567','944332211','tallerm@gmail.com','Jr. Artesanos 67, Lima','Mayorista',1,NOW(),NOW()),
('Pedro Ramírez','DNI','41345678','951234567','pedro.ramirez@gmail.com','Av. Grau 890, Callao','Regular',1,NOW(),NOW()),
('Ana Lucía Flores','DNI','42456789','962345678','analucia.flores@yahoo.com','Jr. Progreso 340, Lima','Regular',1,NOW(),NOW()),
('INNOVA Construcciones S.A.','RUC','20345901678','01-4567200','innova@innovaconstruc.pe','Av. La Marina 1200, Lima','Mayorista',1,NOW(),NOW()),
('Empresa Multiservicios López E.I.R.L.','RUC','20456012789','076-331200','lopez@multiservicios.pe','Jr. Grau 233, Cajamarca','Mayorista',1,NOW(),NOW()),
('Carlos Quispe','DNI','43567890','973456789','carlos.quispe@gmail.com','Av. Tupac Amaru 1200, Comas','Regular',1,NOW(),NOW()),
('Rosa Mendivil','DNI','44678901','984567890','rosita.mendivil@gmail.com','Jr. Puno 567, Lima','Regular',1,NOW(),NOW()),
('Almacenes Torres S.R.L.','RUC','20567123890','01-3321200','torres@almacenestorre.pe','Jr. Callao 890, Lima','Mayorista',1,NOW(),NOW()),
('Rodrigo Villanueva','DNI','45789012','995678901','r.villanueva@gmail.com','Av. Peru 234, SMP','Regular',1,NOW(),NOW()),
('Nelly Paredes','DNI','46890123','906789012','nelly.paredes@outlook.com','Jr. Tacna 120, Lima','Regular',1,NOW(),NOW()),
('Ferrería Guzmán S.A.C.','RUC','20678234901','01-4331200','guzman@ferreriaguzman.pe','Av. Benavides 4500, Miraflores','VIP',1,NOW(),NOW()),
('Luis Alonzo Peña','DNI','47901234','917890123','luispeña@gmail.com','Av. Colonial 670, Lima','Regular',1,NOW(),NOW()),
('Teresa Salaverry','DNI','48012345','928901234','tere.salaverry@gmail.com','Jr. Moquegua 89, Lima','Regular',1,NOW(),NOW()),
('Inmobiliaria Rivera E.I.R.L.','RUC','20789345012','054-231500','rivera@inmobiliariarvr.pe','Av. Ejército 1100, Arequipa','VIP',1,NOW(),NOW()),
('Edgar Mamani','DNI','49123456','939012345','edgar.mamani@gmail.com','Av. Independencia 340, Puno','Regular',1,NOW(),NOW()),
('Patricia Cori','DNI','40234567','940123456','patricia.cori@gmail.com','Jr. Lima 456, Puno','Regular',1,NOW(),NOW()),
('INKAS Proyectos S.A.C.','RUC','20890456123','01-5671200','inkas@inkasproyectos.pe','Av. La Encalada 1560, Lima','Mayorista',1,NOW(),NOW()),
('Mario Sánchez','DNI','41345678','951234567','mario.sanchez@gmail.com','Jr. Huancavelica 670, Lima','Regular',1,NOW(),NOW()),
('Lucia Tapia','DNI','42456789','962345678','lucia.tapia@hotmail.com','Av. Arequipa 2340, Lima','Regular',1,NOW(),NOW()),
('NORTEC Ingeniería S.A.C.','RUC','20901567234','044-561300','nortec@nortecsr.pe','Av. España 340, Trujillo','Mayorista',1,NOW(),NOW()),
('Alberto Castillo','DNI','43567890','973456789','acastillo@gmail.com','Jr. Huallaga 890, Lima','Regular',1,NOW(),NOW()),
('Silvia Condori','DNI','44678901','984567890','silvia.condori@gmail.com','Av. Tacna 120, Lima','Regular',1,NOW(),NOW()),
('VIMA Construcciones S.A.','RUC','21012678345','01-6121200','vima@vimaconstruc.pe','Av. Vía Expresa 890, Lima','Mayorista',1,NOW(),NOW()),
('Raúl Espinoza','DNI','45789012','995678901','raul.espinoza@gmail.com','Jr. Carabaya 234, Lima','Regular',1,NOW(),NOW()),
('Carmen Huanca','DNI','46890123','906789012','chuanca@gmail.com','Av. Canto Grande 340, SJL','Regular',1,NOW(),NOW()),
('Erika Delgado','DNI','47901234','917890123','erika.delgado@yahoo.com','Jr. Ayacucho 670, Lima','Regular',1,NOW(),NOW()),
('TECNO Obras E.I.R.L.','RUC','21123789456','01-7121100','tecno@tecnoobras.pe','Av. Alfredo Mendiola 2340, Lima','VIP',1,NOW(),NOW());

-- =====================================================
--  PRODUCTOS (30)
-- =====================================================
INSERT INTO productos (codigo, nombre, descripcion, categoria_id, proveedor_id, precio_compra, precio_venta, stock, stock_minimo, unidad, activo, created_at, updated_at) VALUES
('HRMT-001','Martillo de Carpintero 16oz','Mango fibra de vidrio, cabeza acero',1,28,18.50,32.00,45,5,'und',1,NOW(),NOW()),
('HRMT-002','Destornillador Estrella 6"','Acero cromo-vanadio, mango TPR',1,28,8.00,15.00,60,10,'und',1,NOW(),NOW()),
('HRMT-003','Alicates Combinados 8"','Acero cold-stamp, mango aislado',1,28,22.00,40.00,35,5,'und',1,NOW(),NOW()),
('ELEC-001','Taladro Percutor 500W','Con empuñadura lateral, estuche incluido',2,29,180.00,320.00,15,3,'und',1,NOW(),NOW()),
('ELEC-002','Amoladora Angular 4½" 710W','Disco de desbaste incluido',2,29,150.00,260.00,12,3,'und',1,NOW(),NOW()),
('PINT-001','Pintura Látex Blanco 4L','Rendimiento 25-30 m²/galón, lavable',3,6,35.00,65.00,80,10,'bal',1,NOW(),NOW()),
('PINT-002','Pintura Esmalte Gris 1/4','Secado rápido, alta cobertura',3,6,22.00,42.00,50,8,'bal',1,NOW(),NOW()),
('CONS-001','Cemento Sol 42.5kg','Tipo I, resistencia alta',4,9,28.00,33.00,200,20,'bol',1,NOW(),NOW()),
('CONS-002','Fierro Corrugado ½" x 9m','Acero ASTM A615 Grado 60',4,14,28.50,42.00,150,15,'var',1,NOW(),NOW()),
('CONS-003','Ladrillo Royal King','Ladrillo de arcilla 18 huecos',4,15,1.20,1.80,2000,200,'und',1,NOW(),NOW()),
('PLOM-001','Tubo PVC 4" x 3m Desagüe','Presión NTP ISO 4435',5,21,32.00,52.00,60,8,'und',1,NOW(),NOW()),
('PLOM-002','Codo PVC 4" x 90°','Para tubo desagüe',5,21,3.50,6.50,120,20,'und',1,NOW(),NOW()),
('PLOM-003','Llave de Paso Bronce ½"','Cuerpo de bronce fundido',5,22,18.00,35.00,40,5,'und',1,NOW(),NOW()),
('ELCT-001','Cable THW 2.5mm² x 100m','Conductor cobre, aislante PVC 75°C',6,26,145.00,220.00,25,3,'rol',1,NOW(),NOW()),
('ELCT-002','Interruptor Simple Bticino','Línea Living Light, 10A 220V',6,22,18.00,32.00,80,10,'und',1,NOW(),NOW()),
('ELCT-003','Foco LED 9W E27 Blanco Frío','6500K, vida útil 25000h',6,22,7.50,14.00,200,20,'und',1,NOW(),NOW()),
('FIJC-001','Tornillo Drywall 6x1" (caja x100)','Cabeza trompeta, fosfatado',7,18,4.50,9.00,150,15,'cja',1,NOW(),NOW()),
('FIJC-002','Taco Fisher 6mm (bolsa x25)','Nylon blanco para pared',7,18,2.00,5.50,200,20,'bol',1,NOW(),NOW()),
('FIJC-003','Clavo de Acero 2" (kg)','Para madera y bloques de concreto',7,18,5.50,9.50,80,10,'kg',1,NOW(),NOW()),
('MADE-001','Triplay Lupuna 4x8x4mm','Acabado laminado, uso interior',8,10,42.00,68.00,30,5,'pla',1,NOW(),NOW()),
('ADHV-001','Silicona Transparente Sika 280ml','Para sellado de juntas, resistente al agua',9,24,9.00,18.00,90,10,'tbo',1,NOW(),NOW()),
('ADHV-002','Pegamento PVC Oatey 240ml','Para tuberías PVC presión',9,24,12.00,22.00,60,8,'tbo',1,NOW(),NOW()),
('SEGR-001','Casco de Seguridad Blanco ANSI','Clase E, dieléctrico',10,20,23.00,42.00,40,5,'und',1,NOW(),NOW()),
('SEGR-002','Guantes de Cuero Industrial','Talla L, reforzado en palma',10,20,8.00,16.00,80,10,'par',1,NOW(),NOW()),
('ABRS-001','Disco de Corte 4½" x 1mm Metal','Máx 13000 RPM',16,14,3.50,7.00,150,20,'und',1,NOW(),NOW()),
('ABRS-002','Lija al Agua 220 (pliego)','Para madera y metales',16,14,0.80,1.80,300,30,'pli',1,NOW(),NOW()),
('MEDI-001','Wincha Stanley 5m','Cinta métalica, cierre automático',17,28,14.00,26.00,55,8,'und',1,NOW(),NOW()),
('IMPR-001','Sika Impermeabilizante 4kg','Para losas y paredes húmedas',20,24,38.00,65.00,35,5,'bal',1,NOW(),NOW()),
('JARDN-001','Manguera Flexible 15m','Diámetro ¾", con aspersor',11,7,20.00,38.00,25,4,'und',1,NOW(),NOW()),
('ILUM-001','Reflector LED 50W IP65','Luz blanca 4000K, exterior',15,22,55.00,95.00,20,3,'und',1,NOW(),NOW());

-- =====================================================
--  CAJAS (10 cerradas + 1 abierta actual)
-- =====================================================
INSERT INTO caja (usuario_id, monto_inicial, monto_final, total_ventas, total_egresos, estado, observaciones, fecha_apertura, fecha_cierre, created_at, updated_at) VALUES
(1,500.00,3240.50,2850.50,110.00,'Cerrada','Día normal de ventas','2026-02-05 08:00:00','2026-02-05 18:30:00',NOW(),NOW()),
(1,500.00,4120.00,3750.00,130.00,'Cerrada','Sábado. Alta demanda.','2026-02-06 08:00:00','2026-02-06 18:00:00',NOW(),NOW()),
(1,500.00,2980.00,2550.00,70.00,'Cerrada',NULL,'2026-02-07 08:00:00','2026-02-07 18:00:00',NOW(),NOW()),
(1,500.00,3560.00,3190.00,130.00,'Cerrada',NULL,'2026-02-10 08:00:00','2026-02-10 18:00:00',NOW(),NOW()),
(1,500.00,4890.00,4510.00,120.00,'Cerrada','Venta mayorista grande','2026-02-17 08:00:00','2026-02-17 18:00:00',NOW(),NOW()),
(1,500.00,3120.00,2740.00,120.00,'Cerrada',NULL,'2026-02-18 08:00:00','2026-02-18 18:00:00',NOW(),NOW()),
(1,500.00,2780.00,2390.00,110.00,'Cerrada',NULL,'2026-02-20 08:00:00','2026-02-20 18:00:00',NOW(),NOW()),
(1,500.00,5230.00,4850.00,120.00,'Cerrada','Proyecto constructora','2026-02-25 08:00:00','2026-02-25 18:00:00',NOW(),NOW()),
(1,500.00,3450.00,3070.00,120.00,'Cerrada',NULL,'2026-02-26 08:00:00','2026-02-26 18:00:00',NOW(),NOW()),
(1,500.00,3890.00,3500.00,110.00,'Cerrada',NULL,'2026-02-28 08:00:00','2026-02-28 18:00:00',NOW(),NOW()),
(1,500.00,NULL,0.00,0.00,'Abierta','Día de hoy','2026-03-06 08:00:00',NULL,NOW(),NOW());

-- =====================================================
--  COMPRAS (30)
-- =====================================================
INSERT INTO compras (numero_orden, proveedor_id, usuario_id, subtotal, igv, total, estado, fecha_esperada, created_at, updated_at) VALUES
('OC-2026-001',1,1,423.73,76.27,500.00,'Recibida','Efectivo','2026-02-06','2026-02-05 09:00:00',NOW()),
('OC-2026-002',9,1,847.46,152.54,1000.00,'Recibida','Transferencia','2026-02-07','2026-02-06 10:00:00',NOW()),
('OC-2026-003',29,1,635.59,114.41,750.00,'Recibida','Efectivo','2026-02-08','2026-02-07 09:30:00',NOW()),
('OC-2026-004',6,1,508.47,91.53,600.00,'Recibida','Transferencia','2026-02-09','2026-02-08 11:00:00',NOW()),
('OC-2026-005',21,1,381.36,68.64,450.00,'Recibida','Efectivo','2026-02-10','2026-02-09 09:00:00',NOW()),
('OC-2026-006',26,1,1271.19,228.81,1500.00,'Recibida','Transferencia','2026-02-11','2026-02-10 10:00:00',NOW()),
('OC-2026-007',14,1,720.34,129.66,850.00,'Recibida','Efectivo','2026-02-12','2026-02-11 09:00:00',NOW()),
('OC-2026-008',28,1,423.73,76.27,500.00,'Recibida','Transferencia','2026-02-13','2026-02-12 10:30:00',NOW()),
('OC-2026-009',22,1,635.59,114.41,750.00,'Recibida','Efectivo','2026-02-14','2026-02-13 09:00:00',NOW()),
('OC-2026-010',10,1,508.47,91.53,600.00,'Recibida','Transferencia','2026-02-15','2026-02-14 10:00:00',NOW()),
('OC-2026-011',1,1,847.46,152.54,1000.00,'Recibida','Efectivo','2026-02-16','2026-02-15 09:30:00',NOW()),
('OC-2026-012',9,1,381.36,68.64,450.00,'Recibida','Transferencia','2026-02-17','2026-02-16 10:00:00',NOW()),
('OC-2026-013',6,1,1059.32,190.68,1250.00,'Recibida','Efectivo','2026-02-18','2026-02-17 09:00:00',NOW()),
('OC-2026-014',29,1,720.34,129.66,850.00,'Recibida','Transferencia','2026-02-19','2026-02-18 10:00:00',NOW()),
('OC-2026-015',14,1,508.47,91.53,600.00,'Recibida','Efectivo','2026-02-20','2026-02-19 09:00:00',NOW()),
('OC-2026-016',21,1,635.59,114.41,750.00,'Recibida','Transferencia','2026-02-21','2026-02-20 10:00:00',NOW()),
('OC-2026-017',26,1,1271.19,228.81,1500.00,'Recibida','Efectivo','2026-02-22','2026-02-21 09:00:00',NOW()),
('OC-2026-018',28,1,423.73,76.27,500.00,'Recibida','Transferencia','2026-02-23','2026-02-22 10:00:00',NOW()),
('OC-2026-019',22,1,847.46,152.54,1000.00,'Recibida','Efectivo','2026-02-24','2026-02-23 09:00:00',NOW()),
('OC-2026-020',10,1,381.36,68.64,450.00,'Recibida','Transferencia','2026-02-25','2026-02-24 10:00:00',NOW()),
('OC-2026-021',1,1,1186.44,213.56,1400.00,'Recibida','Efectivo','2026-02-26','2026-02-25 09:00:00',NOW()),
('OC-2026-022',9,1,508.47,91.53,600.00,'Recibida','Transferencia','2026-02-27','2026-02-26 10:00:00',NOW()),
('OC-2026-023',6,1,635.59,114.41,750.00,'Recibida','Efectivo','2026-02-28','2026-02-27 09:00:00',NOW()),
('OC-2026-024',29,1,423.73,76.27,500.00,'Recibida','Transferencia','2026-02-29','2026-02-28 10:00:00',NOW()),
('OC-2026-025',14,1,1059.32,190.68,1250.00,'Recibida','Efectivo','2026-03-01','2026-03-01 09:00:00',NOW()),
('OC-2026-026',21,1,720.34,129.66,850.00,'Recibida','Transferencia','2026-03-02','2026-03-02 10:00:00',NOW()),
('OC-2026-027',26,1,508.47,91.53,600.00,'Recibida','Efectivo','2026-03-03','2026-03-03 09:00:00',NOW()),
('OC-2026-028',28,1,847.46,152.54,1000.00,'Recibida','Transferencia','2026-03-04','2026-03-04 10:00:00',NOW()),
('OC-2026-029',22,1,381.36,68.64,450.00,'Recibida','Efectivo','2026-03-05','2026-03-05 09:00:00',NOW()),
('OC-2026-030',10,1,635.59,114.41,750.00,'Recibida','Transferencia','2026-03-06','2026-03-05 10:00:00',NOW());

-- =====================================================
--  DETALLE COMPRAS (2 items por compra = 60 registros)
-- =====================================================
INSERT INTO detalle_compras (compra_id, producto_id, cantidad, precio_unitario, subtotal, created_at) VALUES
(1,8,10,28.00,280.00,NOW()),(1,3,5,22.00,110.00,NOW()),
(2,8,20,28.00,560.00,NOW()),(2,9,5,28.50,142.50,NOW()),
(3,4,2,180.00,360.00,NOW()),(3,2,7,8.00,56.00,NOW()),
(4,6,10,35.00,350.00,NOW()),(4,7,5,22.00,110.00,NOW()),
(5,11,8,32.00,256.00,NOW()),(5,12,16,3.50,56.00,NOW()),
(6,14,5,145.00,725.00,NOW()),(6,15,10,18.00,180.00,NOW()),
(7,9,15,28.50,427.50,NOW()),(7,25,10,3.50,35.00,NOW()),
(8,1,15,18.50,277.50,NOW()),(8,17,10,14.00,140.00,NOW()),
(9,4,2,180.00,360.00,NOW()),(9,16,15,22.00,330.00,NOW()),
(10,8,15,28.00,420.00,NOW()),(10,6,2,35.00,70.00,NOW()),
(11,9,15,28.50,427.50,NOW()),(11,10,400,1.20,480.00,NOW()),
(12,11,5,32.00,160.00,NOW()),(12,12,20,3.50,70.00,NOW()),
(13,14,5,145.00,725.00,NOW()),(13,5,2,150.00,300.00,NOW()),
(14,4,2,180.00,360.00,NOW()),(14,1,20,18.50,370.00,NOW()),
(15,8,10,28.00,280.00,NOW()),(15,6,5,35.00,175.00,NOW()),
(16,11,8,32.00,256.00,NOW()),(16,17,15,14.00,210.00,NOW()),
(17,14,5,145.00,725.00,NOW()),(17,15,15,18.00,270.00,NOW()),
(18,1,15,18.50,277.50,NOW()),(18,2,10,8.00,80.00,NOW()),
(19,9,15,28.50,427.50,NOW()),(19,10,300,1.20,360.00,NOW()),
(20,11,5,32.00,160.00,NOW()),(20,12,18,3.50,63.00,NOW()),
(21,14,5,145.00,725.00,NOW()),(21,5,2,150.00,300.00,NOW()),
(22,8,10,28.00,280.00,NOW()),(22,6,5,35.00,175.00,NOW()),
(23,9,10,28.50,285.00,NOW()),(23,25,10,3.50,35.00,NOW()),
(24,1,15,18.50,277.50,NOW()),(24,2,8,8.00,64.00,NOW()),
(25,14,5,145.00,725.00,NOW()),(25,16,10,22.00,220.00,NOW()),
(26,6,10,35.00,350.00,NOW()),(26,7,5,22.00,110.00,NOW()),
(27,8,10,28.00,280.00,NOW()),(27,17,12,14.00,168.00,NOW()),
(28,9,15,28.50,427.50,NOW()),(28,25,15,3.50,52.50,NOW()),
(29,11,4,32.00,128.00,NOW()),(29,12,12,3.50,42.00,NOW()),
(30,14,3,145.00,435.00,NOW()),(30,1,10,18.50,185.00,NOW());

-- =====================================================
--  VENTAS (30)
-- =====================================================
INSERT INTO ventas (numero_comprobante, tipo_comprobante, cliente_id, usuario_id, subtotal, igv, total, descuento, tipo_pago, monto_recibido, vuelto, estado, created_at, updated_at) VALUES
('B001-00001','Boleta',1,1,21.19,3.81,25.00,0.00,'Efectivo',30.00,5.00,'Completada','2026-02-05 09:30:00',NOW()),
('B001-00002','Boleta',2,1,254.24,45.76,300.00,0.00,'Yape',300.00,0.00,'Completada','2026-02-05 10:15:00',NOW()),
('F001-00001','Factura',3,1,635.59,114.41,750.00,0.00,'Transferencia',750.00,0.00,'Completada','2026-02-05 11:00:00',NOW()),
('B001-00003','Boleta',4,1,169.49,30.51,200.00,0.00,'Efectivo',200.00,0.00,'Completada','2026-02-05 14:00:00',NOW()),
('B001-00004','Boleta',5,1,55.08,9.92,65.00,0.00,'Efectivo',70.00,5.00,'Completada','2026-02-06 09:00:00',NOW()),
('F001-00002','Factura',7,1,1059.32,190.68,1250.00,0.00,'Transferencia',1250.00,0.00,'Completada','2026-02-06 11:30:00',NOW()),
('B001-00005','Boleta',6,1,59.32,10.68,70.00,0.00,'Tarjeta',70.00,0.00,'Completada','2026-02-07 10:00:00',NOW()),
('B001-00006','Boleta',9,1,338.98,61.02,400.00,0.00,'Yape',400.00,0.00,'Completada','2026-02-07 15:00:00',NOW()),
('F001-00003','Factura',11,1,847.46,152.54,1000.00,0.00,'Transferencia',1000.00,0.00,'Completada','2026-02-10 10:00:00',NOW()),
('B001-00007','Boleta',12,1,127.12,22.88,150.00,0.00,'Efectivo',150.00,0.00,'Completada','2026-02-10 14:00:00',NOW()),
('B001-00008','Boleta',13,1,84.75,15.25,100.00,0.00,'Plin',100.00,0.00,'Completada','2026-02-10 16:00:00',NOW()),
('F001-00004','Factura',14,1,1652.54,297.46,1950.00,0.00,'Transferencia',1950.00,0.00,'Completada','2026-02-17 10:00:00',NOW()),
('B001-00009','Boleta',15,1,42.37,7.63,50.00,0.00,'Efectivo',50.00,0.00,'Completada','2026-02-17 11:00:00',NOW()),
('B001-00010','Boleta',16,1,211.86,38.14,250.00,0.00,'Yape',250.00,0.00,'Completada','2026-02-18 09:30:00',NOW()),
('F001-00005','Factura',7,1,1186.44,213.56,1400.00,0.00,'Transferencia',1400.00,0.00,'Completada','2026-02-18 11:00:00',NOW()),
('B001-00011','Boleta',1,1,169.49,30.51,200.00,0.00,'Efectivo',200.00,0.00,'Completada','2026-02-20 10:00:00',NOW()),
('B001-00012','Boleta',2,1,84.75,15.25,100.00,0.00,'Tarjeta',100.00,0.00,'Completada','2026-02-20 14:00:00',NOW()),
('F001-00006','Factura',3,1,2118.64,381.36,2500.00,0.00,'Transferencia',2500.00,0.00,'Completada','2026-02-25 09:00:00',NOW()),
('B001-00013','Boleta',9,1,127.12,22.88,150.00,0.00,'Efectivo',150.00,0.00,'Completada','2026-02-25 11:00:00',NOW()),
('B001-00014','Boleta',10,1,338.98,61.02,400.00,0.00,'Yape',400.00,0.00,'Completada','2026-02-25 15:00:00',NOW()),
('B001-00015','Boleta',12,1,55.08,9.92,65.00,0.00,'Efectivo',65.00,0.00,'Completada','2026-02-26 10:00:00',NOW()),
('F001-00007','Factura',26,1,847.46,152.54,1000.00,0.00,'Transferencia',1000.00,0.00,'Completada','2026-02-26 14:00:00',NOW()),
('B001-00016','Boleta',13,1,42.37,7.63,50.00,0.00,'Plin',50.00,0.00,'Completada','2026-02-28 09:00:00',NOW()),
('B001-00017','Boleta',5,1,254.24,45.76,300.00,0.00,'Efectivo',300.00,0.00,'Completada','2026-02-28 11:00:00',NOW()),
('B001-00018','Boleta',15,1,169.49,30.51,200.00,0.00,'Yape',200.00,0.00,'Completada','2026-03-03 09:30:00',NOW()),
('F001-00008','Factura',30,1,635.59,114.41,750.00,0.00,'Transferencia',750.00,0.00,'Completada','2026-03-03 11:00:00',NOW()),
('B001-00019','Boleta',24,1,84.75,15.25,100.00,0.00,'Efectivo',100.00,0.00,'Completada','2026-03-04 10:00:00',NOW()),
('F001-00009','Factura',11,1,1271.19,228.81,1500.00,0.00,'Transferencia',1500.00,0.00,'Completada','2026-03-04 14:00:00',NOW()),
('B001-00020','Boleta',6,1,59.32,10.68,70.00,0.00,'Yape',70.00,0.00,'Completada','2026-03-05 09:00:00',NOW()),
('B001-00021','Boleta',9,1,127.12,22.88,150.00,0.00,'Efectivo',160.00,10.00,'Completada','2026-03-06 09:30:00',NOW());

-- =====================================================
--  DETALLE VENTAS (2 items por venta = 60 registros)
-- =====================================================
INSERT INTO detalle_ventas (venta_id, producto_id, cantidad, precio_unitario, descuento, subtotal, created_at) VALUES
(1,17,1,26.00,0,26.00,NOW()),
(2,6,3,65.00,0,195.00,NOW()),(2,22,5,18.00,0,90.00,NOW()),
(3,14,3,220.00,0,660.00,NOW()),(3,8,3,33.00,0,99.00,NOW()),
(4,1,4,32.00,0,128.00,NOW()),(4,2,3,15.00,0,45.00,NOW()),
(5,17,2,26.00,0,52.00,NOW()),(5,26,3,5.50,0,16.50,NOW()),
(6,14,3,220.00,0,660.00,NOW()),(6,8,15,33.00,0,495.00,NOW()),
(7,3,1,40.00,0,40.00,NOW()),(7,26,6,5.50,0,33.00,NOW()),
(8,6,4,65.00,0,260.00,NOW()),(8,7,2,42.00,0,84.00,NOW()),
(9,4,3,320.00,0,960.00,NOW()),(9,2,4,15.00,0,60.00,NOW()),
(10,1,3,32.00,0,96.00,NOW()),(10,17,2,26.00,0,52.00,NOW()),
(11,16,2,14.00,0,28.00,NOW()),(11,25,4,7.00,0,28.00,NOW()),
(12,9,15,42.00,0,630.00,NOW()),(12,10,200,1.80,0,360.00,NOW()),
(13,18,5,9.50,0,47.50,NOW()),(13,17,1,26.00,0,26.00,NOW()),
(14,6,2,65.00,0,130.00,NOW()),(14,7,2,42.00,0,84.00,NOW()),
(15,14,5,220.00,0,1100.00,NOW()),(15,16,15,22.00,0,330.00,NOW()),
(16,1,5,32.00,0,160.00,NOW()),(16,2,5,15.00,0,75.00,NOW()),
(17,16,4,14.00,0,56.00,NOW()),(17,18,10,9.50,0,95.00,NOW()),
(18,9,25,42.00,0,1050.00,NOW()),(18,10,600,1.80,0,1080.00,NOW()),
(19,17,3,26.00,0,78.00,NOW()),(19,3,2,40.00,0,80.00,NOW()),
(20,6,4,65.00,0,260.00,NOW()),(20,7,2,42.00,0,84.00,NOW()),
(21,18,5,9.50,0,47.50,NOW()),(21,17,1,26.00,0,26.00,NOW()),
(22,4,3,320.00,0,960.00,NOW()),(22,25,15,7.00,0,105.00,NOW()),
(23,16,3,14.00,0,42.00,NOW()),(23,17,1,26.00,0,26.00,NOW()),
(24,1,5,32.00,0,160.00,NOW()),(24,2,5,15.00,0,75.00,NOW()),
(25,6,2,65.00,0,130.00,NOW()),(25,7,2,42.00,0,84.00,NOW()),
(26,14,3,220.00,0,660.00,NOW()),(26,8,3,33.00,0,99.00,NOW()),
(27,16,4,14.00,0,56.00,NOW()),(27,18,6,9.50,0,57.00,NOW()),
(28,9,20,42.00,0,840.00,NOW()),(28,10,300,1.80,0,540.00,NOW()),
(29,3,1,40.00,0,40.00,NOW()),(29,22,2,35.00,0,70.00,NOW()),
(30,1,3,32.00,0,96.00,NOW()),(30,18,5,9.50,0,47.50,NOW());

-- =====================================================
--  MOVIMIENTOS DE INVENTARIO (vinculados a compras)
-- =====================================================
INSERT INTO inventario_movimientos (producto_id, tipo, cantidad, stock_anterior, stock_nuevo, referencia, usuario_id, created_at) VALUES
(8,  'Entrada',10,0,10, 'Compra OC-2026-001',1,NOW()),
(3,  'Entrada',5, 0,5,  'Compra OC-2026-001',1,NOW()),
(8,  'Entrada',20,10,30,'Compra OC-2026-002',1,NOW()),
(9,  'Entrada',5, 0,5,  'Compra OC-2026-002',1,NOW()),
(4,  'Entrada',2, 0,2,  'Compra OC-2026-003',1,NOW()),
(6,  'Entrada',10,0,10, 'Compra OC-2026-004',1,NOW()),
(11, 'Entrada',8, 0,8,  'Compra OC-2026-005',1,NOW()),
(12, 'Entrada',16,0,16, 'Compra OC-2026-005',1,NOW()),
(14, 'Entrada',5, 0,5,  'Compra OC-2026-006',1,NOW()),
(15, 'Entrada',10,0,10, 'Compra OC-2026-006',1,NOW()),
(9,  'Entrada',15,5,20, 'Compra OC-2026-007',1,NOW()),
(25, 'Entrada',10,0,10, 'Compra OC-2026-007',1,NOW()),
(1,  'Entrada',15,0,15, 'Compra OC-2026-008',1,NOW()),
(17, 'Entrada',10,0,10, 'Compra OC-2026-008',1,NOW()),
(4,  'Entrada',2, 2,4,  'Compra OC-2026-009',1,NOW()),
(16, 'Entrada',15,0,15, 'Compra OC-2026-009',1,NOW());

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================
--  VERIFICACIÓN FINAL
-- =====================================================
SELECT 'categorias' AS tabla,  COUNT(*) AS total FROM categorias
UNION ALL SELECT 'proveedores',  COUNT(*) FROM proveedores
UNION ALL SELECT 'clientes',     COUNT(*) FROM clientes
UNION ALL SELECT 'productos',    COUNT(*) FROM productos
UNION ALL SELECT 'compras',      COUNT(*) FROM compras
UNION ALL SELECT 'ventas',       COUNT(*) FROM ventas
UNION ALL SELECT 'caja',         COUNT(*) FROM caja;
