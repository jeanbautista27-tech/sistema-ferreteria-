# Especificación — Módulo: Inventario

**Versión:** 1.0 | **Sprint:** 2 | **Estado:** Implementado y verificado en producción

---

## Objetivo

Proveer visibilidad en tiempo real del stock de todos los productos y permitir ajustes manuales con trazabilidad completa. Registra todo movimiento de mercancía del sistema.

---

## Descripción funcional

Muestra el stock actual de los productos activos con filtros. Permite ajustes manuales que se registran como movimientos de inventario. Expone el historial de movimientos filtrable por producto.

---

## Requerimientos funcionales

| ID | Descripción | Implementado en |
| --- | --- | --- |
| RF-INV-01 | Consultar stock con filtros (nombre, categoría, stock bajo) | `inventarioController.getStock` |
| RF-INV-02 | `stock_bajo=true` filtra `stock <= stock_minimo` en memoria | `productos.filter(p => p.stock <= p.stock_minimo)` |
| RF-INV-03 | Ajustar stock con motivo (default: 'Ajuste manual') | `inventarioController.ajustarStock` |
| RF-INV-04 | Ajuste registra movimiento con diferencia (+/-) | `InventarioMovimiento.create({ tipo: 'Ajuste', cantidad: nuevo - antes })` |
| RF-INV-05 | Historial de movimientos, últimos 200, filtrable por producto | `limit: 200, where: { producto_id }` |

---

## Criterios de aceptación

```
CA-INV-01
DADO que el almacenero solicita stock
CUANDO hace GET /api/inventario/stock
ENTONCES HTTP 200 + lista de productos activos con stock actual y categoría

CA-INV-02
DADO stock_bajo=true
CUANDO hace GET /api/inventario/stock?stock_bajo=true
ENTONCES solo retorna productos donde stock <= stock_minimo

CA-INV-03
DADO que el producto existe
CUANDO hace POST /api/inventario/ajustar con { producto_id, cantidad: 25, motivo: 'Conteo' }
ENTONCES producto.stock = 25, movimiento creado con cantidad = 25 - stock_anterior

CA-INV-04
DADO que el producto no existe
CUANDO hace POST /api/inventario/ajustar
ENTONCES HTTP 404 + { ok: false, msg: 'Producto no encontrado' }
```

---

## Reglas de negocio

1. El ajuste **establece** el stock en el valor indicado (no suma/resta).
2. La diferencia `cantidad = nuevo_stock - stock_anterior` puede ser negativa (reducción).
3. El historial muestra los últimos 200 movimientos ordenados por fecha descendente.
4. Los movimientos son de solo lectura — no se pueden modificar ni eliminar.
5. Tipos de movimiento posibles: `Entrada`, `Salida`, `Ajuste`, `Venta`, `Compra`.

---

## Endpoints | Modelos | Controller | Tests

- **Endpoints:** GET `/api/inventario/stock`, POST `/api/inventario/ajustar`, GET `/api/inventario/movimientos`
- **Roles:** Admin + Almacenero
- **Modelos:** `Producto`, `InventarioMovimiento`, `Categoria`, `Usuario`
- **Controller:** `inventarioController.js` — `getStock`, `ajustarStock`, `getMovimientos`
- **Test unitario:** `inventarioController.test.js` (14 pruebas)
- **Componente React:** `client/src/pages/Inventario.jsx`

---

## Impacto sobre otros módulos

- **Ventas:** Crea movimiento tipo `Venta` al vender.
- **Compras:** Crea movimiento tipo `Compra` al recibir mercancía.
- **Devoluciones:** Crea movimiento tipo `Entrada` al devolver.
- **Dashboard:** `Producto.findAll({ where: { stock: { Op.lte: col('stock_minimo') } } })`.
