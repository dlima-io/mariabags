# Base de Datos - María Bags

Directorio de migraciones, seeds y scripts de base de datos PostgreSQL.

## Estructura de Archivos

```
db/
├── README.md                          # Este archivo
├── SCHEMA_REVIEW.md                   # Documentación detallada del esquema
├── verify_schema.sql                  # Script de verificación del esquema
├── migrations/
│   └── 001_initial_schema.sql        # Schema inicial (v1.1.0)
└── seeds/
    └── 001_initial_data.sql          # Datos de prueba
```

## Instalación Inicial

### Prerrequisitos

- PostgreSQL 14+ instalado
- Acceso con permisos de superusuario (para crear extensiones)

### Paso 1: Crear la Base de Datos

```bash
# Conectar como superusuario
psql -U postgres

# Crear base de datos
CREATE DATABASE mariabags;

# Crear usuario (opcional)
CREATE USER mariabags_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE mariabags TO mariabags_user;

# Salir
\q
```

### Paso 2: Ejecutar Migración Inicial

```bash
# Ejecutar schema
psql -U postgres -d mariabags -f migrations/001_initial_schema.sql
```

**Salida esperada**:
```
CREATE EXTENSION
CREATE TABLE
CREATE INDEX
...
INSERT 0 5
```

### Paso 3: Cargar Datos de Prueba (Opcional - Solo Desarrollo)

```bash
# Ejecutar seeds
psql -U postgres -d mariabags -f seeds/001_initial_data.sql
```

**Importante**: Los seeds contienen datos de prueba. **NO ejecutar en producción**.

### Paso 4: Verificar Instalación

```bash
# Ejecutar script de verificación
psql -U postgres -d mariabags -f verify_schema.sql
```

**Revisar la salida**:
- Todas las líneas deben mostrar `OK`
- Si hay `ERROR` o `WARNING`, revisar el problema

## Datos de Prueba (Seeds)

### Usuarios Disponibles

| Usuario | Password | Rol |
|---------|----------|-----|
| admin | admin123 | ADMIN |
| maria.lopez | staff123 | STAFF |

### Clientes de Prueba

1. **María González** - Deuda: $4,000.00
2. **Juan Pérez** - Al día: $0.00
3. **Laura Martínez** - Deuda con mora: $7,150.00
4. **Carlos Rodríguez** - Inactivo (soft delete)
5. **Ana Silva** - Sin movimientos

Ver detalles completos en `seeds/001_initial_data.sql`.

## Consultas Rápidas

### Ver todos los clientes con sus saldos

```sql
psql -d mariabags -c "SELECT nombre, apellido, saldo FROM saldos_clientes ORDER BY saldo DESC;"
```

### Ver clientes en mora (> 30 días)

```sql
psql -d mariabags -c "
SELECT
    nombre,
    apellido,
    saldo,
    EXTRACT(DAY FROM NOW() - ultima_operacion) AS dias_mora
FROM saldos_clientes
WHERE activo = TRUE
    AND saldo > 0
    AND ultima_operacion < NOW() - INTERVAL '30 days'
ORDER BY dias_mora DESC;
"
```

### Ver historial de un cliente

```sql
psql -d mariabags

-- Reemplazar el UUID con el ID del cliente
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

## Operaciones Comunes

### Registrar una compra (DEBITO)

```sql
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
VALUES (
    'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01',  -- ID del cliente
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',  -- ID del usuario
    'DEBITO',
    1500.00,
    'Cartera modelo "Premium"'
);
```

### Registrar un pago (CREDITO)

```sql
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
VALUES (
    'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'CREDITO',
    1000.00,
    'Pago en efectivo'
);
```

### Aplicar ajuste por mora

```sql
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
VALUES (
    'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'AJUSTE',
    400.00,  -- Positivo = recargo
    'Aumento 10% por mora > 30 días'
);
```

### Desactivar un cliente (Soft Delete)

```sql
UPDATE clientes
SET activo = FALSE
WHERE id = 'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01';
```

## Mantenimiento

### Backup Manual

```bash
# Backup completo
pg_dump -U postgres mariabags > mariabags_backup_$(date +%Y%m%d).sql

# Backup solo schema (sin datos)
pg_dump -U postgres --schema-only mariabags > mariabags_schema.sql

# Backup solo datos
pg_dump -U postgres --data-only mariabags > mariabags_data.sql
```

### Restaurar Backup

```bash
# Eliminar base de datos existente (CUIDADO!)
psql -U postgres -c "DROP DATABASE IF EXISTS mariabags;"

# Crear nueva base de datos
psql -U postgres -c "CREATE DATABASE mariabags;"

# Restaurar
psql -U postgres -d mariabags < mariabags_backup_20260203.sql
```

### Actualizar Vista Materializada (raramente necesario)

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY saldos_clientes;
```

**Nota**: La vista se actualiza automáticamente con triggers. Solo ejecutar si hay inconsistencias.

### Verificar Integridad

```bash
# Ejecutar script de verificación
psql -U postgres -d mariabags -f verify_schema.sql
```

### Analizar Performance

```sql
-- Estadísticas de tablas
ANALYZE usuarios;
ANALYZE clientes;
ANALYZE movimientos;
ANALYZE configuracion;

-- Ver tamaño de tablas
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

## Resetear Base de Datos (Solo Desarrollo)

```bash
# ADVERTENCIA: Esto elimina TODOS los datos

# Conectar a PostgreSQL
psql -U postgres

# Eliminar y recrear
DROP DATABASE IF EXISTS mariabags;
CREATE DATABASE mariabags;
\q

# Recrear schema y seeds
psql -U postgres -d mariabags -f migrations/001_initial_schema.sql
psql -U postgres -d mariabags -f seeds/001_initial_data.sql

# Verificar
psql -U postgres -d mariabags -f verify_schema.sql
```

## Integración con Node.js

### Ejemplo de Configuración (pg module)

```javascript
// config/database.js
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mariabags',
  user: process.env.DB_USER || 'mariabags_user',
  password: process.env.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export default pool;
```

### Ejemplo de Query

```javascript
// services/clienteService.js
import pool from '../config/database.js';

export async function obtenerSaldoCliente(clienteId) {
  const query = `
    SELECT
      nombre,
      apellido,
      saldo,
      ultima_operacion
    FROM saldos_clientes
    WHERE cliente_id = $1
  `;

  const result = await pool.query(query, [clienteId]);
  return result.rows[0];
}

export async function registrarCompra(clienteId, usuarioId, monto, observaciones) {
  const query = `
    INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
    VALUES ($1, $2, 'DEBITO', $3, $4)
    RETURNING *
  `;

  const result = await pool.query(query, [clienteId, usuarioId, monto, observaciones]);
  return result.rows[0];
}
```

## Variables de Entorno Recomendadas

Crear archivo `.env`:

```env
# Base de Datos
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mariabags
DB_USER=mariabags_user
DB_PASSWORD=tu_password_seguro

# Zona horaria
TZ=America/Argentina/Buenos_Aires

# Ambiente
NODE_ENV=development
```

## Troubleshooting

### Error: "extension uuid-ossp does not exist"

```sql
-- Conectar como superusuario
psql -U postgres -d mariabags

-- Crear extensión manualmente
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "relation saldos_clientes does not exist"

```sql
-- Recrear vista materializada
REFRESH MATERIALIZED VIEW saldos_clientes;
```

### Saldos incorrectos

```sql
-- 1. Verificar movimientos
SELECT COUNT(*) FROM movimientos;

-- 2. Refrescar vista
REFRESH MATERIALIZED VIEW CONCURRENTLY saldos_clientes;

-- 3. Verificar saldos
SELECT * FROM saldos_clientes ORDER BY saldo DESC;
```

### Performance lenta en consultas de saldo

La vista materializada `saldos_clientes` ya tiene los saldos pre-calculados. **Siempre usar la vista**, nunca calcular con SUM en tiempo real:

**INCORRECTO** (lento):
```sql
SELECT
    c.id,
    SUM(CASE WHEN m.tipo = 'DEBITO' THEN m.monto ELSE 0 END) -
    SUM(CASE WHEN m.tipo = 'CREDITO' THEN m.monto ELSE 0 END) AS saldo
FROM clientes c
LEFT JOIN movimientos m ON c.id = m.cliente_id
GROUP BY c.id;
```

**CORRECTO** (rápido):
```sql
SELECT cliente_id, saldo FROM saldos_clientes;
```

## Documentación Adicional

- **SCHEMA_REVIEW.md**: Explicación detallada del diseño, decisiones técnicas y ejemplos avanzados
- **PostgreSQL Documentation**: https://www.postgresql.org/docs/

## Contacto

Para consultas sobre el esquema de base de datos, revisar `SCHEMA_REVIEW.md` o contactar al equipo de desarrollo.

**Versión**: 1.0.0
**Última actualización**: 2026-02-03
