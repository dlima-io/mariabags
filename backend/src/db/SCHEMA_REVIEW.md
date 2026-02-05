# Revisión y Optimización del Esquema PostgreSQL - María Bags

**Fecha**: 2026-02-03
**Versión del Schema**: 1.1.0
**Revisado por**: Senior Database Administrator

---

## Resumen Ejecutivo

Se ha realizado una revisión exhaustiva del esquema de base de datos PostgreSQL para el proyecto "María Bags". Se identificaron y corrigieron **problemas críticos** de diseño que afectaban la integridad de datos y precisión contable.

### Problemas Críticos Corregidos

1. **ERROR CRÍTICO - Lógica de Saldo Invertida**
   - **Problema**: La vista materializada calculaba `CREDITOS - DEBITOS`, lo cual es incorrecto
   - **Impacto**: Saldos invertidos (clientes que deben aparecían con saldo a favor)
   - **Solución**: Corregido a `DEBITOS - CREDITOS + AJUSTES`
   - **Explicación**:
     - DEBITO = Compra del cliente → Aumenta la deuda
     - CREDITO = Pago del cliente → Reduce la deuda
     - Saldo positivo = Cliente debe dinero
     - Saldo negativo = Cliente tiene saldo a favor

2. **Tipos de Datos Incorrectos**
   - **TIMESTAMP → TIMESTAMPTZ**: Migrados todos los campos de fecha/hora
   - **DECIMAL(10,2) → DECIMAL(19,4)**: Aumentada precisión para montos financieros
   - **Justificación**:
     - TIMESTAMPTZ maneja correctamente zonas horarias internacionales
     - DECIMAL(19,4) es estándar financiero (previene errores de redondeo)

3. **Constraints sin Nombres Explícitos**
   - **Problema**: PostgreSQL generaba nombres automáticos difíciles de mantener
   - **Solución**: Todos los constraints tienen nombres explícitos siguiendo convención
   - **Patrón**: `{tabla}_{columna(s)}_{tipo}`
   - **Ejemplos**:
     - `clientes_telefono_unique`
     - `movimientos_cliente_id_fkey`
     - `movimientos_tipo_check`

4. **Validación de AJUSTES**
   - **Problema**: CHECK constraint no permitía ajustes negativos (descuentos)
   - **Solución**: Constraint diferenciado por tipo:
     - DEBITO/CREDITO: `monto > 0`
     - AJUSTE: `monto != 0` (permite positivos y negativos)

---

## Mejoras de Performance

### Índices Optimizados

#### Eliminados (Redundantes)
- `idx_clientes_telefono` → Redundante con UNIQUE constraint

#### Agregados/Mejorados
```sql
-- Índice parcial para consultas de clientes activos
CREATE INDEX idx_clientes_activo ON clientes(activo) WHERE activo = TRUE;

-- Índice compuesto para historial del cliente
CREATE INDEX idx_movimientos_cliente_fecha ON movimientos(cliente_id, fecha DESC);

-- Índice parcial en vista materializada para deudores activos
CREATE INDEX idx_saldos_clientes_activo_saldo
ON saldos_clientes(activo, saldo DESC)
WHERE activo = TRUE;
```

**Justificación**:
- Índices parciales reducen tamaño y mejoran velocidad en consultas filtradas
- El índice compuesto `(cliente_id, fecha DESC)` optimiza consultas de historial
- La vista materializada ya incluye saldo pre-calculado (elimina SUM en tiempo real)

### Estrategia de Foreign Keys

Todas las foreign keys usan `ON DELETE RESTRICT` para prevenir pérdida de datos:

```sql
CONSTRAINT movimientos_cliente_id_fkey
    FOREIGN KEY (cliente_id)
    REFERENCES clientes(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
```

**Razón**:
- **RESTRICT**: Protege integridad contable (no se puede eliminar un cliente con deuda)
- **Soft Delete**: Se usa el campo `activo=FALSE` en lugar de DELETE físico
- **Auditoría**: Preserva el registro de "quién registró qué" (usuario_id)

**Escenarios de Uso**:
1. **Intentar eliminar cliente con movimientos** → ERROR (por diseño)
2. **Desactivar cliente** → `UPDATE clientes SET activo = FALSE WHERE id = ?`
3. **Eliminar usuario que registró movimientos** → ERROR (preserva auditoría)

---

## Validación de Requisitos (CLAUDE.md)

| Requisito | Implementado | Verificación |
|-----------|--------------|--------------|
| UUID para todos los IDs | ✅ | `id UUID PRIMARY KEY DEFAULT uuid_generate_v4()` |
| TIMESTAMPTZ para fechas | ✅ | Todas las columnas de fecha/hora usan TIMESTAMPTZ |
| `telefono UNIQUE` | ✅ | `CONSTRAINT clientes_telefono_unique UNIQUE (telefono)` |
| `usuario_id` obligatorio en movimientos | ✅ | `usuario_id UUID NOT NULL` + FK constraint |
| Soft delete con `activo: boolean` | ✅ | `activo BOOLEAN DEFAULT TRUE NOT NULL` |
| Tipos de movimiento: DEBITO/CREDITO/AJUSTE | ✅ | `CHECK (tipo IN ('DEBITO', 'CREDITO', 'AJUSTE'))` |
| Lógica de saldo correcta | ✅ | `DEBITOS - CREDITOS + AJUSTES` |
| Contraseñas con bcrypt (10 rounds) | ✅ | Validado en seeds |
| Vista materializada de saldos | ✅ | `saldos_clientes` con auto-refresh |

---

## Datos de Prueba (Seeds)

### Usuarios Creados

| Username | Password | Rol | Uso |
|----------|----------|-----|-----|
| admin | admin123 | ADMIN | Testing de administración |
| maria.lopez | staff123 | STAFF | Testing de permisos limitados |

⚠️ **ADVERTENCIA**: Estos son datos de prueba. **NUNCA usar en producción**.

### Clientes de Prueba

1. **María González** (+541134567890)
   - Saldo: **$4,000.00** (deuda activa)
   - Movimientos: 3
   - Escenario: Cliente con deuda moderada

2. **Juan Pérez** (+541145678901)
   - Saldo: **$0.00** (al día)
   - Movimientos: 4
   - Escenario: Cliente cumplidor

3. **Laura Martínez** (+541156789012)
   - Saldo: **$7,150.00** (deuda con mora)
   - Movimientos: 5 (incluye ajuste por mora)
   - Escenario: Cliente moroso > 30 días

4. **Carlos Rodríguez** (+541167890123)
   - Saldo: **$2,500.00** (inactivo)
   - Movimientos: 2
   - Escenario: Soft delete (activo=FALSE)

5. **Ana Silva** (+541178901234)
   - Saldo: **$0.00**
   - Movimientos: 0
   - Escenario: Cliente nuevo sin historial

---

## Consultas de Ejemplo

### 1. Listar clientes con deuda actual

```sql
SELECT
    nombre,
    apellido,
    telefono,
    saldo,
    ultima_operacion,
    EXTRACT(DAY FROM NOW() - ultima_operacion) AS dias_sin_movimiento
FROM saldos_clientes
WHERE activo = TRUE AND saldo > 0
ORDER BY saldo DESC;
```

### 2. Clientes en mora (> 30 días con deuda)

```sql
SELECT
    nombre,
    apellido,
    telefono,
    saldo,
    ultima_operacion,
    EXTRACT(DAY FROM NOW() - ultima_operacion) AS dias_mora
FROM saldos_clientes
WHERE
    activo = TRUE
    AND saldo > 0
    AND ultima_operacion < NOW() - INTERVAL '30 days'
ORDER BY dias_mora DESC;
```

### 3. Historial completo de un cliente

```sql
SELECT
    m.fecha,
    m.tipo,
    m.monto,
    m.observaciones,
    u.username AS registrado_por
FROM movimientos m
JOIN usuarios u ON m.usuario_id = u.id
WHERE m.cliente_id = 'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01'
ORDER BY m.fecha DESC;
```

### 4. Auditoría: Movimientos registrados por usuario

```sql
SELECT
    u.username,
    COUNT(m.id) AS total_movimientos,
    SUM(CASE WHEN m.tipo = 'DEBITO' THEN m.monto ELSE 0 END) AS total_debitos,
    SUM(CASE WHEN m.tipo = 'CREDITO' THEN m.monto ELSE 0 END) AS total_creditos
FROM usuarios u
LEFT JOIN movimientos m ON u.id = m.usuario_id
GROUP BY u.id, u.username
ORDER BY total_movimientos DESC;
```

### 5. Registrar una compra (DEBITO)

```sql
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
VALUES (
    'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01',  -- ID del cliente
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  -- ID del usuario que registra
    'DEBITO',
    1500.00,
    'Cartera modelo "Clásica" - Color negro'
);

-- La vista materializada se actualiza automáticamente (trigger)
```

### 6. Registrar un pago (CREDITO)

```sql
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
VALUES (
    'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'CREDITO',
    1000.00,
    'Pago en efectivo - Cuota 1/3'
);
```

### 7. Aplicar ajuste por mora (10%)

```sql
-- Primero obtener el saldo actual
SELECT saldo FROM saldos_clientes
WHERE cliente_id = 'c3ccddee-3333-4ef8-bb6d-6bb9bd380a03';

-- Aplicar 10% de recargo
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
VALUES (
    'c3ccddee-3333-4ef8-bb6d-6bb9bd380a03',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'AJUSTE',
    715.00,  -- 10% de $7,150
    'Aumento 10% aplicado por mora superior a 30 días'
);
```

### 8. Aplicar descuento (AJUSTE negativo)

```sql
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
VALUES (
    'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'AJUSTE',
    -200.00,  -- Negativo = descuento
    'Descuento por pronto pago'
);
```

---

## Integración con WhatsApp

El esquema incluye configuración para integración con WhatsApp:

```sql
-- Obtener URL de WhatsApp con mensaje pre-cargado
SELECT
    nombre,
    apellido,
    telefono,
    'https://wa.me/' || REPLACE(telefono, '+', '') ||
    '?text=' || REPLACE(
        (SELECT valor FROM configuracion WHERE clave = 'whatsapp_message_template'),
        '{nombre}',
        nombre
    ) AS whatsapp_url
FROM clientes
WHERE id = 'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01';
```

**Resultado**: `https://wa.me/541134567890?text=Hola María! Te contacto desde María Bags`

---

## Mantenimiento y Monitoreo

### Refrescar vista materializada manualmente (raramente necesario)

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY saldos_clientes;
```

**Nota**: El refresh es automático con trigger, solo ejecutar manualmente si hay inconsistencias.

### Verificar tamaño de tablas

```sql
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Estadísticas de movimientos por tipo

```sql
SELECT
    tipo,
    COUNT(*) AS cantidad,
    SUM(monto) AS total,
    AVG(monto) AS promedio,
    MIN(monto) AS minimo,
    MAX(monto) AS maximo
FROM movimientos
GROUP BY tipo;
```

---

## Guía de Migración desde Versión Anterior

Si ya existe una base de datos con el esquema 1.0.0:

```sql
-- 1. Corregir tipos de datos (TIMESTAMP -> TIMESTAMPTZ)
ALTER TABLE usuarios
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'America/Argentina/Buenos_Aires',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'America/Argentina/Buenos_Aires';

ALTER TABLE clientes
    ALTER COLUMN fecha_creacion TYPE TIMESTAMPTZ USING fecha_creacion AT TIME ZONE 'America/Argentina/Buenos_Aires',
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'America/Argentina/Buenos_Aires';

ALTER TABLE movimientos
    ALTER COLUMN fecha TYPE TIMESTAMPTZ USING fecha AT TIME ZONE 'America/Argentina/Buenos_Aires',
    ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'America/Argentina/Buenos_Aires';

ALTER TABLE configuracion
    ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'America/Argentina/Buenos_Aires';

-- 2. Aumentar precisión de montos
ALTER TABLE movimientos ALTER COLUMN monto TYPE DECIMAL(19,4);

-- 3. Recrear vista materializada con lógica corregida
DROP MATERIALIZED VIEW IF EXISTS saldos_clientes;
-- Luego ejecutar la definición de CREATE MATERIALIZED VIEW del schema 1.1.0

-- 4. Agregar nombres a constraints (requiere recreación)
-- Ver script completo en 001_initial_schema.sql
```

---

## Checklist de Producción

Antes de desplegar en producción:

- [ ] Cambiar contraseña del usuario `admin`
- [ ] Eliminar usuario de prueba `maria.lopez`
- [ ] Eliminar todos los clientes de prueba
- [ ] Verificar configuración de timezone en PostgreSQL
- [ ] Configurar backups automáticos diarios
- [ ] Implementar rotación de logs
- [ ] Configurar alertas de performance
- [ ] Revisar permisos de usuarios de base de datos
- [ ] Documentar procedimientos de disaster recovery
- [ ] Ejecutar ANALYZE en todas las tablas

---

## Contacto y Soporte

Para consultas sobre el diseño del esquema o problemas de migración, contactar al equipo de base de datos.

**Versión del documento**: 1.0.0
**Última actualización**: 2026-02-03
