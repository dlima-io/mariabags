# Tests de Lógica Contable - María Bags

## Descripción

Este directorio contiene los tests y ejemplos de validación de la lógica contable del sistema María Bags.

## Archivos

### 1. `test-saldo-logic.js`
Suite de tests automatizados para validar la lógica de cálculo de saldos.

**Tests incluidos:**
- ✓ Test 1: Compra aumenta saldo
- ✓ Test 2: Pago reduce saldo
- ✓ Test 3: Ajuste positivo aumenta saldo
- ✓ Test 4: Ajuste negativo reduce saldo
- ✓ Test 5: Secuencia completa de operaciones
- ✓ Test 6: Cliente inactivo rechazado
- ✓ Test 7: Monto positivo validado
- ✓ Test 8: Vista materializada actualizada
- ✓ Test 9: AJUSTE cero rechazado
- ✓ Test 10: Consistencia vista y tabla

### 2. `EJEMPLOS_CALCULO.md`
Ejemplos paso a paso de cómo se calculan los saldos con casos reales.

## Requisitos Previos

### 1. PostgreSQL
- PostgreSQL 14 o superior instalado
- Base de datos `mariabags` creada
- Schema inicial aplicado (`001_initial_schema.sql`)

### 2. Node.js
- Node.js 18 o superior
- Módulo `pg` instalado

### 3. Variables de Entorno
Crear archivo `.env` en la raíz del proyecto backend:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mariabags
DB_USER=postgres
DB_PASSWORD=tu_password
```

## Instalación

### Paso 1: Instalar Dependencias

```bash
cd backend
npm install
```

### Paso 2: Verificar Configuración de BD

```bash
# Probar conexión a PostgreSQL
psql -U postgres -d mariabags -c "SELECT version();"
```

### Paso 3: Aplicar Schema (si no lo has hecho)

```bash
psql -U postgres -d mariabags -f src/db/migrations/001_initial_schema.sql
```

## Ejecución de Tests

### Método 1: Ejecutar Directamente con Node

```bash
cd backend
node tests/contable/test-saldo-logic.js
```

### Método 2: Usar npm script (recomendado)

Agregar script en `backend/package.json`:

```json
{
  "scripts": {
    "test:contable": "node tests/contable/test-saldo-logic.js"
  }
}
```

Ejecutar:

```bash
cd backend
npm run test:contable
```

## Salida Esperada

Si todos los tests pasan, verás algo como:

```
╔══════════════════════════════════════════════════════════╗
║       Tests de Lógica Contable - Sistema María Bags       ║
╚══════════════════════════════════════════════════════════╝

============================================================
SETUP: Creando datos de prueba
============================================================
ℹ Usuario de prueba creado: 123e4567-...
ℹ Cliente de prueba creado: 789e0123-...
ℹ Movimientos previos limpiados
✓ Setup completado

============================================================
TEST 1: Compra aumenta saldo
============================================================
ℹ Saldo inicial: $0
ℹ Compra registrada: $1000
ℹ Saldo final: $1000
✓ Test 1 aprobado: Compra aumenta saldo correctamente (+$1000)

...

╔══════════════════════════════════════════════════════════╗
║                       RESUMEN                              ║
╚══════════════════════════════════════════════════════════╝
Total de tests: 10
Aprobados: 10
Fallidos: 0
Duración: 2.45s

🎉 TODOS LOS TESTS APROBADOS
```

## Troubleshooting

### Error: "Connection refused"

**Problema:** No se puede conectar a PostgreSQL

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# O en Windows:
services.msc  # Buscar "PostgreSQL" y verificar que esté en "Running"
```

### Error: "Database does not exist"

**Problema:** Base de datos `mariabags` no existe

**Solución:**
```bash
# Crear base de datos
psql -U postgres -c "CREATE DATABASE mariabags;"
```

### Error: "relation 'clientes' does not exist"

**Problema:** Schema no aplicado

**Solución:**
```bash
# Aplicar schema
psql -U postgres -d mariabags -f src/db/migrations/001_initial_schema.sql
```

### Error: "Cannot find module 'pg'"

**Problema:** Dependencia `pg` no instalada

**Solución:**
```bash
cd backend
npm install pg
```

### Error en Tests Individuales

**Ejemplo:** "Test 7 FALLÓ: Check constraint violation"

**Interpretación:** Esto es ESPERADO. El test valida que la base de datos rechace montos inválidos.

**Acción:** Revisar el mensaje del test. Si dice "correctamente rechazado", el test pasó.

## Limpieza de Datos de Prueba

Los tests automáticamente limpian los datos que crean (setup y cleanup). Si necesitas limpiar manualmente:

```sql
-- Eliminar datos de prueba
DELETE FROM movimientos WHERE cliente_id IN (
  SELECT id FROM clientes WHERE telefono = 'TEST-999999'
);

DELETE FROM clientes WHERE telefono = 'TEST-999999';
DELETE FROM usuarios WHERE username = 'test_admin';

-- Refrescar vista materializada
REFRESH MATERIALIZED VIEW CONCURRENTLY saldos_clientes;
```

## Validación Manual con Query SQL

Puedes validar manualmente el saldo de cualquier cliente:

```sql
-- Reemplazar 'CLIENTE_UUID' con el ID real
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
  sc.saldo as saldo_vista_materializada
FROM clientes c
LEFT JOIN movimientos m ON c.id = m.cliente_id
LEFT JOIN saldos_clientes sc ON c.id = sc.cliente_id
WHERE c.id = 'CLIENTE_UUID'
GROUP BY c.id, c.nombre, c.apellido, sc.saldo;
```

## Próximos Pasos

1. **Ejecutar tests localmente** para validar tu ambiente
2. **Integrar tests en CI/CD** (GitHub Actions, GitLab CI, etc.)
3. **Agregar tests adicionales** según necesidades del negocio
4. **Automatizar ejecución** en pre-commit hooks

## Integración con CI/CD

### GitHub Actions

Crear archivo `.github/workflows/test-contable.yml`:

```yaml
name: Tests Contables

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_DB: mariabags_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: |
          cd backend
          npm install

      - name: Apply database schema
        run: |
          cd backend
          PGPASSWORD=postgres psql -h localhost -U postgres -d mariabags_test -f src/db/migrations/001_initial_schema.sql

      - name: Run tests
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: mariabags_test
          DB_USER: postgres
          DB_PASSWORD: postgres
        run: |
          cd backend
          node tests/contable/test-saldo-logic.js
```

## Recursos Adicionales

- **Documentación Contable:** `../../LOGICA_CONTABLE.md`
- **Ejemplos de Cálculo:** `EJEMPLOS_CALCULO.md`
- **Validación General:** `../../VALIDACION_LOGICA_CONTABLE.md`
- **Schema de BD:** `../../src/db/migrations/001_initial_schema.sql`

## Soporte

Si encuentras problemas:

1. Revisar la sección **Troubleshooting** arriba
2. Verificar que todos los **Requisitos Previos** estén cumplidos
3. Consultar la documentación en `LOGICA_CONTABLE.md`
4. Abrir un issue en el repositorio con los logs completos

---

**Versión:** 1.0
**Última Actualización:** 2024-02-04
**Mantenedor:** Equipo de Desarrollo María Bags
