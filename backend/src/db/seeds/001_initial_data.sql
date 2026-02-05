-- María Bags - Datos Iniciales de Prueba
-- Versión: 1.0.0
-- Descripción: Seeds para desarrollo y testing
-- Última revisión: 2026-02-03

-- =====================================================
-- IMPORTANTE: Este archivo contiene datos de prueba
-- NO ejecutar en producción
-- =====================================================

-- =====================================================
-- USUARIO ADMINISTRADOR
-- =====================================================
-- Password: admin123 (CAMBIAR EN PRODUCCIÓN)
-- Hash generado con: bcrypt.hash('admin123', 10)
INSERT INTO usuarios (id, username, password_hash, rol, created_at) VALUES
    (
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'admin',
        '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'ADMIN',
        NOW() - INTERVAL '30 days'
    )
ON CONFLICT (username) DO NOTHING;

-- Usuario STAFF de prueba
-- Password: staff123
INSERT INTO usuarios (id, username, password_hash, rol, created_at) VALUES
    (
        'b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'maria.lopez',
        '$2a$10$xQZ9kE8.X8qC9hXKp0KvVOYj8xZ3YN1cX2qZ8YJ0pZ1pZ2pZ3pZ4pZ',
        'STAFF',
        NOW() - INTERVAL '15 days'
    )
ON CONFLICT (username) DO NOTHING;

COMMENT ON COLUMN usuarios.password_hash IS 'Usuarios de prueba: admin/admin123, maria.lopez/staff123';

-- =====================================================
-- CLIENTES DE PRUEBA
-- =====================================================

-- Cliente 1: María González (cliente con deuda)
INSERT INTO clientes (id, nombre, apellido, telefono, activo, fecha_creacion) VALUES
    (
        'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01',
        'María',
        'González',
        '+541134567890',
        TRUE,
        NOW() - INTERVAL '60 days'
    )
ON CONFLICT (telefono) DO NOTHING;

-- Cliente 2: Juan Pérez (cliente al día)
INSERT INTO clientes (id, nombre, apellido, telefono, activo, fecha_creacion) VALUES
    (
        'c2bbccdd-2222-4ef8-bb6d-6bb9bd380a02',
        'Juan',
        'Pérez',
        '+541145678901',
        TRUE,
        NOW() - INTERVAL '45 days'
    )
ON CONFLICT (telefono) DO NOTHING;

-- Cliente 3: Laura Martínez (cliente con mora prolongada)
INSERT INTO clientes (id, nombre, apellido, telefono, activo, fecha_creacion) VALUES
    (
        'c3ccddee-3333-4ef8-bb6d-6bb9bd380a03',
        'Laura',
        'Martínez',
        '+541156789012',
        TRUE,
        NOW() - INTERVAL '90 days'
    )
ON CONFLICT (telefono) DO NOTHING;

-- Cliente 4: Carlos Rodríguez (cliente inactivo - soft delete)
INSERT INTO clientes (id, nombre, apellido, telefono, activo, fecha_creacion) VALUES
    (
        'c4ddeeff-4444-4ef8-bb6d-6bb9bd380a04',
        'Carlos',
        'Rodríguez',
        '+541167890123',
        FALSE,
        NOW() - INTERVAL '120 days'
    )
ON CONFLICT (telefono) DO NOTHING;

-- Cliente 5: Ana Silva (cliente nuevo sin movimientos)
INSERT INTO clientes (id, nombre, apellido, telefono, activo, fecha_creacion) VALUES
    (
        'c5eeffaa-5555-4ef8-bb6d-6bb9bd380a05',
        'Ana',
        'Silva',
        '+541178901234',
        TRUE,
        NOW() - INTERVAL '5 days'
    )
ON CONFLICT (telefono) DO NOTHING;

-- =====================================================
-- MOVIMIENTOS CLIENTE 1: María González
-- Saldo esperado: $4,000.00 (deuda)
-- =====================================================

-- Compra inicial de cartera
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'DEBITO',
        5000.00,
        NOW() - INTERVAL '60 days',
        'Cartera modelo "Primavera" - Color negro'
    );

-- Pago parcial
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'CREDITO',
        3000.00,
        NOW() - INTERVAL '45 days',
        'Pago en efectivo - Primera cuota'
    );

-- Segunda compra
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c1aabbcc-1111-4ef8-bb6d-6bb9bd380a01',
        'b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'DEBITO',
        2000.00,
        NOW() - INTERVAL '30 days',
        'Billetera modelo "Clásica" - Color marrón'
    );

-- =====================================================
-- MOVIMIENTOS CLIENTE 2: Juan Pérez
-- Saldo esperado: $0.00 (al día)
-- =====================================================

-- Compra de mochila
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c2bbccdd-2222-4ef8-bb6d-6bb9bd380a02',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'DEBITO',
        8500.00,
        NOW() - INTERVAL '40 days',
        'Mochila ejecutiva - Color gris'
    );

-- Pago total
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c2bbccdd-2222-4ef8-bb6d-6bb9bd380a02',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'CREDITO',
        8500.00,
        NOW() - INTERVAL '35 days',
        'Pago completo transferencia bancaria'
    );

-- Nueva compra reciente
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c2bbccdd-2222-4ef8-bb6d-6bb9bd380a02',
        'b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'DEBITO',
        3500.00,
        NOW() - INTERVAL '10 days',
        'Riñonera deportiva - Color azul'
    );

-- Pago de la nueva compra
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c2bbccdd-2222-4ef8-bb6d-6bb9bd380a02',
        'b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'CREDITO',
        3500.00,
        NOW() - INTERVAL '5 days',
        'Pago en efectivo'
    );

-- =====================================================
-- MOVIMIENTOS CLIENTE 3: Laura Martínez
-- Saldo esperado: $7,150.00 (deuda con mora prolongada)
-- =====================================================

-- Compra antigua
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c3ccddee-3333-4ef8-bb6d-6bb9bd380a03',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'DEBITO',
        6500.00,
        NOW() - INTERVAL '85 days',
        'Set de 3 carteras - Colección "Verano"'
    );

-- Pago mínimo
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c3ccddee-3333-4ef8-bb6d-6bb9bd380a03',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'CREDITO',
        1000.00,
        NOW() - INTERVAL '70 days',
        'Pago parcial en efectivo'
    );

-- Ajuste: Interés por mora (10%)
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c3ccddee-3333-4ef8-bb6d-6bb9bd380a03',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'AJUSTE',
        550.00,
        NOW() - INTERVAL '55 days',
        'Aumento 10% aplicado por mora superior a 30 días'
    );

-- Nueva compra (agrava la deuda)
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c3ccddee-3333-4ef8-bb6d-6bb9bd380a03',
        'b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'DEBITO',
        2100.00,
        NOW() - INTERVAL '20 days',
        'Cartera modelo "Premium" - Color rojo'
    );

-- Pago pequeño reciente
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c3ccddee-3333-4ef8-bb6d-6bb9bd380a03',
        'b1ffcd99-9c0b-4ef8-bb6d-6bb9bd380a22',
        'CREDITO',
        1000.00,
        NOW() - INTERVAL '10 days',
        'Pago a cuenta'
    );

-- =====================================================
-- MOVIMIENTOS CLIENTE 4: Carlos Rodríguez (INACTIVO)
-- Saldo esperado: $2,500.00 (deuda histórica)
-- =====================================================

-- Compra histórica
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c4ddeeff-4444-4ef8-bb6d-6bb9bd380a04',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'DEBITO',
        3500.00,
        NOW() - INTERVAL '110 days',
        'Maletín ejecutivo - Color negro'
    );

-- Pago parcial antes de inactivarse
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, fecha, observaciones) VALUES
    (
        'c4ddeeff-4444-4ef8-bb6d-6bb9bd380a04',
        'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
        'CREDITO',
        1000.00,
        NOW() - INTERVAL '100 days',
        'Pago parcial'
    );

-- =====================================================
-- VERIFICACIÓN DE SALDOS (Comentarios de referencia)
-- =====================================================
-- María González:   DEBITOS (7000) - CREDITOS (3000) = $4,000.00
-- Juan Pérez:       DEBITOS (12000) - CREDITOS (12000) = $0.00
-- Laura Martínez:   DEBITOS (8600) - CREDITOS (2000) + AJUSTES (550) = $7,150.00
-- Carlos Rodríguez: DEBITOS (3500) - CREDITOS (1000) = $2,500.00
-- Ana Silva:        Sin movimientos = $0.00

-- =====================================================
-- CONFIGURACIÓN ADICIONAL
-- =====================================================
INSERT INTO configuracion (clave, valor, descripcion) VALUES
    ('ultima_sincronizacion', NOW()::TEXT, 'Última sincronización de datos'),
    ('modo_desarrollo', 'true', 'Indica si la app está en modo desarrollo')
ON CONFLICT (clave) DO UPDATE SET valor = EXCLUDED.valor;

-- =====================================================
-- REFRESH INICIAL DE VISTA MATERIALIZADA
-- =====================================================
REFRESH MATERIALIZED VIEW saldos_clientes;

-- =====================================================
-- FIN DE SEEDS
-- =====================================================

-- Consulta de verificación (comentada - descomentar para testing)
-- SELECT
--     c.nombre,
--     c.apellido,
--     c.telefono,
--     c.activo,
--     s.total_debitos,
--     s.total_creditos,
--     s.total_ajustes,
--     s.saldo,
--     s.cantidad_movimientos
-- FROM clientes c
-- LEFT JOIN saldos_clientes s ON c.id = s.cliente_id
-- ORDER BY s.saldo DESC NULLS LAST;
