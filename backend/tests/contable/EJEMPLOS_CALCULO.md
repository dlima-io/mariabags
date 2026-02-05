# Ejemplos de Cálculo de Saldo - Sistema María Bags

## Propósito
Este documento proporciona ejemplos paso a paso de cómo se calculan los saldos en el sistema, validando la fórmula implementada.

## Fórmula de Saldo

```
Saldo = DEBITOS - CREDITOS + AJUSTES
```

### Interpretación
- **Saldo > 0:** Cliente debe dinero al negocio
- **Saldo = 0:** Cliente está al día
- **Saldo < 0:** Cliente tiene crédito a favor

---

## Ejemplo Completo: Historia de un Cliente

### Cliente: María González
**Periodo:** Enero - Febrero 2024

---

### Movimiento 1: Primera Compra
**Fecha:** 15/01/2024
**Tipo:** DEBITO
**Monto:** $5,000.00
**Descripción:** Cartera Premium - Modelo 2024

**Cálculo del Saldo:**
```
Saldo Anterior:    $0
+ DEBITO:          $5,000
- CREDITO:         $0
+ AJUSTE:          $0
──────────────────────────
Saldo Nuevo:       $5,000
```

**Estado:** Cliente debe $5,000

---

### Movimiento 2: Pago Parcial
**Fecha:** 18/01/2024
**Tipo:** CREDITO
**Monto:** $3,000.00
**Descripción:** Pago parcial - Transferencia

**Cálculo del Saldo:**
```
Saldo Anterior:    $5,000
+ DEBITO:          $0
- CREDITO:         $3,000
+ AJUSTE:          $0
──────────────────────────
Saldo Nuevo:       $2,000
```

**Estado:** Cliente debe $2,000

---

### Movimiento 3: Segunda Compra
**Fecha:** 20/01/2024
**Tipo:** DEBITO
**Monto:** $2,000.00
**Descripción:** Mochila Ejecutiva

**Cálculo del Saldo:**
```
Saldo Anterior:    $2,000
+ DEBITO:          $2,000
- CREDITO:         $0
+ AJUSTE:          $0
──────────────────────────
Saldo Nuevo:       $4,000
```

**Estado:** Cliente debe $4,000

---

### Movimiento 4: Aplicar Interés por Mora
**Fecha:** 05/02/2024
**Tipo:** AJUSTE
**Monto:** $400.00 (10% de $4,000)
**Descripción:** Interés 10% por mora - 45 días

**Cálculo del Saldo:**
```
Saldo Anterior:    $4,000
+ DEBITO:          $0
- CREDITO:         $0
+ AJUSTE:          $400 (positivo = recargo)
──────────────────────────
Saldo Nuevo:       $4,400
```

**Estado:** Cliente debe $4,400

---

### Movimiento 5: Aplicar Descuento
**Fecha:** 06/02/2024
**Tipo:** AJUSTE
**Monto:** -$400.00
**Descripción:** Descuento por lealtad

**Cálculo del Saldo:**
```
Saldo Anterior:    $4,400
+ DEBITO:          $0
- CREDITO:         $0
+ AJUSTE:          -$400 (negativo = descuento)
──────────────────────────
Saldo Nuevo:       $4,000
```

**Estado:** Cliente debe $4,000

---

### Movimiento 6: Pago Total
**Fecha:** 10/02/2024
**Tipo:** CREDITO
**Monto:** $4,000.00
**Descripción:** Pago total - Efectivo

**Cálculo del Saldo:**
```
Saldo Anterior:    $4,000
+ DEBITO:          $0
- CREDITO:         $4,000
+ AJUSTE:          $0
──────────────────────────
Saldo Nuevo:       $0
```

**Estado:** Cliente está al día

---

## Validación Final con Totales

### Totales Acumulados:
```
Total DEBITOS:     $5,000 + $2,000 = $7,000
Total CREDITOS:    $3,000 + $4,000 = $7,000
Total AJUSTES:     $400 + (-$400) = $0
```

### Cálculo Final:
```
Saldo = DEBITOS - CREDITOS + AJUSTES
Saldo = $7,000 - $7,000 + $0
Saldo = $0 ✓
```

**Conclusión:** El saldo final es correcto. El cliente pagó todo.

---

## Historial Completo en Tabla

| # | Fecha | Tipo | Monto | Saldo Acumulado | Descripción |
|---|-------|------|-------|-----------------|-------------|
| 1 | 15/01 | DEBITO | +$5,000 | $5,000 | Cartera Premium |
| 2 | 18/01 | CREDITO | -$3,000 | $2,000 | Pago parcial |
| 3 | 20/01 | DEBITO | +$2,000 | $4,000 | Mochila Ejecutiva |
| 4 | 05/02 | AJUSTE | +$400 | $4,400 | Interés 10% |
| 5 | 06/02 | AJUSTE | -$400 | $4,000 | Descuento |
| 6 | 10/02 | CREDITO | -$4,000 | $0 | Pago total |

---

## Ejemplo 2: Cliente con Saldo Negativo

### Cliente: Pedro Martínez

### Movimiento 1: Compra
**Fecha:** 01/02/2024
**Tipo:** DEBITO
**Monto:** $1,000.00

**Cálculo:**
```
Saldo = $0 + $1,000 - $0 + $0 = $1,000
```
**Estado:** Cliente debe $1,000

---

### Movimiento 2: Pago Anticipado
**Fecha:** 05/02/2024
**Tipo:** CREDITO
**Monto:** $1,500.00 (paga de más)

**Cálculo:**
```
Saldo = $1,000 - $1,500 + $0 = -$500
```
**Estado:** Cliente tiene $500 a favor

---

### Movimiento 3: Siguiente Compra
**Fecha:** 10/02/2024
**Tipo:** DEBITO
**Monto:** $800.00

**Cálculo:**
```
Saldo = ($1,000 + $800) - $1,500 + $0 = $300
```
**Estado:** Cliente debe $300

**Interpretación:** El crédito de $500 se aplicó automáticamente a la nueva compra de $800.

---

## Ejemplo 3: Múltiples Ajustes

### Cliente: Ana López

| # | Fecha | Tipo | Monto | Cálculo | Saldo |
|---|-------|------|-------|---------|-------|
| 1 | 01/01 | DEBITO | +$10,000 | 10,000 - 0 + 0 | $10,000 |
| 2 | 15/01 | CREDITO | -$5,000 | 10,000 - 5,000 + 0 | $5,000 |
| 3 | 01/02 | AJUSTE | +$500 | 10,000 - 5,000 + 500 | $5,500 |
| 4 | 05/02 | AJUSTE | -$250 | 10,000 - 5,000 + 250 | $5,250 |
| 5 | 10/02 | CREDITO | -$2,000 | 10,000 - 7,000 + 250 | $3,250 |
| 6 | 15/02 | DEBITO | +$1,750 | 11,750 - 7,000 + 250 | $5,000 |
| 7 | 20/02 | CREDITO | -$5,000 | 11,750 - 12,000 + 250 | $0 |

**Totales Finales:**
```
DEBITOS:   $10,000 + $1,750 = $11,750
CREDITOS:  $5,000 + $2,000 + $5,000 = $12,000
AJUSTES:   $500 - $250 = $250

Saldo = $11,750 - $12,000 + $250 = $0 ✓
```

---

## Ejemplo 4: Ajuste Porcentual

### Cliente: Carlos Ruiz

**Saldo Inicial:** $8,750

### Aplicar Descuento del 12%

**Cálculo del Ajuste:**
```
Porcentaje: -12% (negativo porque es descuento)
Saldo Base: $8,750
Monto Ajuste = (8,750 × -12) / 100 = -$1,050
```

**Movimiento Generado:**
- **Tipo:** AJUSTE
- **Monto:** -$1,050
- **Descripción:** "Ajuste descuento del 12% sobre saldo de $8750"

**Cálculo del Saldo:**
```
Saldo Anterior:    $8,750
+ AJUSTE:          -$1,050
──────────────────────────
Saldo Nuevo:       $7,700
```

---

## Ejemplo 5: Secuencia Compleja

### Cliente: Laura Fernández

#### Resumen de Operaciones:

```
ENERO:
  - Compra #1: +$3,000      → Saldo: $3,000
  - Pago #1:   -$1,000      → Saldo: $2,000
  - Compra #2: +$2,500      → Saldo: $4,500

FEBRERO:
  - Interés:   +$450 (10%)  → Saldo: $4,950
  - Pago #2:   -$2,000      → Saldo: $2,950

MARZO:
  - Compra #3: +$1,500      → Saldo: $4,450
  - Descuento: -$450        → Saldo: $4,000
  - Pago #3:   -$4,000      → Saldo: $0
```

#### Validación con Totales:

```
Total DEBITOS:   $3,000 + $2,500 + $1,500 = $7,000
Total CREDITOS:  $1,000 + $2,000 + $4,000 = $7,000
Total AJUSTES:   $450 + (-$450) = $0

Saldo Final = $7,000 - $7,000 + $0 = $0 ✓
```

---

## Query SQL para Validación Manual

Puedes ejecutar esta query en PostgreSQL para validar el saldo de cualquier cliente:

```sql
-- Reemplazar 'CLIENTE_UUID' con el ID real del cliente
SELECT
  c.nombre,
  c.apellido,
  COALESCE(SUM(CASE WHEN m.tipo = 'DEBITO' THEN m.monto ELSE 0 END), 0) as total_debitos,
  COALESCE(SUM(CASE WHEN m.tipo = 'CREDITO' THEN m.monto ELSE 0 END), 0) as total_creditos,
  COALESCE(SUM(CASE WHEN m.tipo = 'AJUSTE' THEN m.monto ELSE 0 END), 0) as total_ajustes,
  (
    COALESCE(SUM(CASE WHEN m.tipo = 'DEBITO' THEN m.monto ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN m.tipo = 'CREDITO' THEN m.monto ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN m.tipo = 'AJUSTE' THEN m.monto ELSE 0 END), 0)
  ) as saldo_calculado,
  sc.saldo as saldo_vista_materializada,
  (
    (
      COALESCE(SUM(CASE WHEN m.tipo = 'DEBITO' THEN m.monto ELSE 0 END), 0) -
      COALESCE(SUM(CASE WHEN m.tipo = 'CREDITO' THEN m.monto ELSE 0 END), 0) +
      COALESCE(SUM(CASE WHEN m.tipo = 'AJUSTE' THEN m.monto ELSE 0 END), 0)
    ) - sc.saldo
  ) as diferencia
FROM clientes c
LEFT JOIN movimientos m ON c.id = m.cliente_id
LEFT JOIN saldos_clientes sc ON c.id = sc.cliente_id
WHERE c.id = 'CLIENTE_UUID'
GROUP BY c.id, c.nombre, c.apellido, sc.saldo;
```

**Resultado Esperado:**
- `saldo_calculado` debe ser igual a `saldo_vista_materializada`
- `diferencia` debe ser 0 (o muy cercano a 0, considerando decimales)

---

## Conclusión

Todos los ejemplos demuestran que la fórmula implementada:

```
Saldo = DEBITOS - CREDITOS + AJUSTES
```

Es **matemáticamente correcta** y **semánticamente apropiada** para un sistema de cuentas corrientes desde la perspectiva del negocio.

### Validaciones Clave:
✓ DEBITO aumenta el saldo (cliente debe más)
✓ CREDITO reduce el saldo (cliente paga)
✓ AJUSTE positivo aumenta saldo (recargo)
✓ AJUSTE negativo reduce saldo (descuento)
✓ Saldo negativo representa crédito a favor del cliente
✓ Los totales siempre cuadran matemáticamente

---

**Versión:** 1.0
**Fecha:** 2024-02-04
**Sistema:** María Bags - Gestión de Cuentas Corrientes
