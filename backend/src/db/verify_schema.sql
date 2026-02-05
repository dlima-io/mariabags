-- María Bags - Script de Verificación del Esquema
-- Descripción: Valida que el esquema esté correctamente instalado
-- Uso: psql -d mariabags -f verify_schema.sql

\echo '==================================================='
\echo 'VERIFICACIÓN DEL ESQUEMA - María Bags'
\echo 'Versión esperada: 1.1.0'
\echo '==================================================='
\echo ''

-- =====================================================
-- 1. VERIFICAR EXTENSIONES
-- =====================================================
\echo '1. Verificando extensiones...'
SELECT
    extname AS extension,
    extversion AS version
FROM pg_extension
WHERE extname = 'uuid-ossp';

\echo ''

-- =====================================================
-- 2. VERIFICAR TABLAS
-- =====================================================
\echo '2. Verificando existencia de tablas...'
SELECT
    table_name,
    CASE
        WHEN table_name IN ('usuarios', 'clientes', 'movimientos', 'configuracion') THEN 'OK'
        ELSE 'UNEXPECTED'
    END AS status
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
ORDER BY table_name;

\echo ''

-- =====================================================
-- 3. VERIFICAR TIPOS DE DATOS CRÍTICOS
-- =====================================================
\echo '3. Verificando tipos de datos (TIMESTAMPTZ y DECIMAL)...'
SELECT
    table_name,
    column_name,
    data_type,
    CASE
        WHEN column_name LIKE '%at' OR column_name LIKE 'fecha%' THEN
            CASE WHEN data_type = 'timestamp with time zone' THEN 'OK' ELSE 'ERROR: Debería ser TIMESTAMPTZ' END
        WHEN column_name = 'monto' THEN
            CASE WHEN numeric_precision = 19 AND numeric_scale = 4 THEN 'OK' ELSE 'ERROR: Debería ser DECIMAL(19,4)' END
        ELSE 'N/A'
    END AS validation
FROM information_schema.columns
WHERE table_schema = 'public'
    AND table_name IN ('usuarios', 'clientes', 'movimientos', 'configuracion')
    AND (
        column_name LIKE '%at'
        OR column_name LIKE 'fecha%'
        OR column_name = 'monto'
    )
ORDER BY table_name, column_name;

\echo ''

-- =====================================================
-- 4. VERIFICAR CONSTRAINTS ÚNICOS
-- =====================================================
\echo '4. Verificando constraints UNIQUE...'
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    'OK' AS status
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'UNIQUE'
    AND tc.table_schema = 'public'
    AND tc.table_name IN ('usuarios', 'clientes')
ORDER BY tc.table_name, tc.constraint_name;

\echo ''

-- =====================================================
-- 5. VERIFICAR FOREIGN KEYS
-- =====================================================
\echo '5. Verificando foreign keys y comportamiento ON DELETE...'
SELECT
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
    rc.delete_rule,
    CASE
        WHEN rc.delete_rule = 'RESTRICT' THEN 'OK'
        ELSE 'WARNING: Debería ser RESTRICT'
    END AS validation
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

\echo ''

-- =====================================================
-- 6. VERIFICAR CHECK CONSTRAINTS
-- =====================================================
\echo '6. Verificando CHECK constraints...'
SELECT
    tc.table_name,
    tc.constraint_name,
    cc.check_clause,
    'OK' AS status
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.constraint_type = 'CHECK'
    AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

\echo ''

-- =====================================================
-- 7. VERIFICAR ÍNDICES
-- =====================================================
\echo '7. Verificando índices...'
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('usuarios', 'clientes', 'movimientos', 'configuracion')
ORDER BY tablename, indexname;

\echo ''

-- =====================================================
-- 8. VERIFICAR VISTA MATERIALIZADA
-- =====================================================
\echo '8. Verificando vista materializada...'
SELECT
    schemaname,
    matviewname,
    ispopulated AS is_populated,
    CASE WHEN ispopulated THEN 'OK' ELSE 'ERROR: No está poblada' END AS status
FROM pg_matviews
WHERE schemaname = 'public'
    AND matviewname = 'saldos_clientes';

\echo ''

-- =====================================================
-- 9. VERIFICAR TRIGGERS
-- =====================================================
\echo '9. Verificando triggers...'
SELECT
    trigger_name,
    event_object_table AS table_name,
    action_timing,
    event_manipulation,
    'OK' AS status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

\echo ''

-- =====================================================
-- 10. VERIFICAR FUNCIONES
-- =====================================================
\echo '10. Verificando funciones...'
SELECT
    routine_name AS function_name,
    routine_type,
    'OK' AS status
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN ('refresh_saldos_clientes', 'update_updated_at_column')
ORDER BY routine_name;

\echo ''

-- =====================================================
-- 11. VERIFICAR DATOS INICIALES
-- =====================================================
\echo '11. Verificando datos de configuración...'
SELECT
    clave,
    LEFT(valor, 50) AS valor,
    'OK' AS status
FROM configuracion
ORDER BY clave;

\echo ''

-- =====================================================
-- 12. CONTEO DE REGISTROS (Si se ejecutaron los seeds)
-- =====================================================
\echo '12. Conteo de registros...'
SELECT 'usuarios' AS tabla, COUNT(*) AS cantidad FROM usuarios
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'movimientos', COUNT(*) FROM movimientos
UNION ALL
SELECT 'configuracion', COUNT(*) FROM configuracion;

\echo ''

-- =====================================================
-- 13. VERIFICAR SALDOS (Si se ejecutaron los seeds)
-- =====================================================
\echo '13. Verificando cálculo de saldos (si hay datos de prueba)...'
SELECT
    nombre,
    apellido,
    activo,
    total_debitos,
    total_creditos,
    total_ajustes,
    saldo,
    CASE
        WHEN nombre = 'María' AND apellido = 'González' THEN
            CASE WHEN saldo = 4000.00 THEN 'OK' ELSE 'ERROR: Esperado $4,000.00' END
        WHEN nombre = 'Juan' AND apellido = 'Pérez' THEN
            CASE WHEN saldo = 0.00 THEN 'OK' ELSE 'ERROR: Esperado $0.00' END
        WHEN nombre = 'Laura' AND apellido = 'Martínez' THEN
            CASE WHEN saldo = 7150.00 THEN 'OK' ELSE 'ERROR: Esperado $7,150.00' END
        WHEN nombre = 'Carlos' AND apellido = 'Rodríguez' THEN
            CASE WHEN saldo = 2500.00 THEN 'OK' ELSE 'ERROR: Esperado $2,500.00' END
        WHEN nombre = 'Ana' AND apellido = 'Silva' THEN
            CASE WHEN saldo = 0.00 THEN 'OK' ELSE 'ERROR: Esperado $0.00' END
        ELSE 'N/A'
    END AS validation
FROM saldos_clientes
ORDER BY saldo DESC;

\echo ''

-- =====================================================
-- 14. VERIFICAR AUDITORÍA
-- =====================================================
\echo '14. Verificando que todos los movimientos tienen usuario_id (auditoría)...'
SELECT
    CASE
        WHEN COUNT(*) = 0 THEN 'OK: Todos los movimientos tienen usuario_id'
        ELSE 'ERROR: ' || COUNT(*) || ' movimientos sin usuario_id'
    END AS validation
FROM movimientos
WHERE usuario_id IS NULL;

\echo ''

-- =====================================================
-- RESUMEN FINAL
-- =====================================================
\echo '==================================================='
\echo 'VERIFICACIÓN COMPLETADA'
\echo '==================================================='
\echo ''
\echo 'Revisar cualquier línea que muestre ERROR o WARNING'
\echo 'Todos los campos con "OK" indican funcionamiento correcto'
\echo ''
