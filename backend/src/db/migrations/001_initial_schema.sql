-- María Bags - Schema Inicial Optimizado
-- Versión: 1.1.0
-- Descripción: Esquema completo para gestión de cuentas corrientes
-- Última revisión: 2026-02-03

-- =====================================================
-- EXTENSIONES
-- =====================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: usuarios
-- Descripción: Almacena administradores y staff del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(10) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraints con nombres explícitos
    CONSTRAINT usuarios_username_unique UNIQUE (username),
    CONSTRAINT usuarios_rol_check CHECK (rol IN ('ADMIN', 'STAFF'))
);

-- Índice para búsqueda rápida por username (optimización de login)
CREATE INDEX idx_usuarios_username ON usuarios(username);

COMMENT ON TABLE usuarios IS 'Administradores y staff del sistema. Contraseñas hasheadas con bcrypt (10 rounds).';
COMMENT ON COLUMN usuarios.username IS 'Nombre de usuario único para login.';
COMMENT ON COLUMN usuarios.password_hash IS 'Hash bcrypt de la contraseña (nunca almacenar en texto plano).';
COMMENT ON COLUMN usuarios.rol IS 'ADMIN: acceso completo | STAFF: acceso limitado.';

-- =====================================================
-- TABLA: clientes
-- Descripción: Almacena información de clientes
-- Nota CRÍTICA: NO usa DNI, el teléfono es el identificador único
-- =====================================================
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Constraint crítico: teléfono único
    CONSTRAINT clientes_telefono_unique UNIQUE (telefono)
);

-- Índices para optimización de consultas
CREATE INDEX idx_clientes_activo ON clientes(activo) WHERE activo = TRUE;
CREATE INDEX idx_clientes_nombre_apellido ON clientes(nombre, apellido);
CREATE INDEX idx_clientes_fecha_creacion ON clientes(fecha_creacion DESC);

COMMENT ON TABLE clientes IS 'Información de clientes. Identificación única por teléfono (sin DNI).';
COMMENT ON COLUMN clientes.telefono IS 'Identificador único del cliente. Formato: +54XXXXXXXXXX o similar.';
COMMENT ON COLUMN clientes.activo IS 'Soft delete: FALSE para clientes inactivos. NUNCA eliminar registros para preservar historial contable.';

-- =====================================================
-- TABLA: movimientos
-- Descripción: Registro de todas las transacciones
-- Nota CRÍTICA: usuario_id obligatorio para auditoría
-- =====================================================
CREATE TABLE IF NOT EXISTS movimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cliente_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    monto DECIMAL(19, 4) NOT NULL,
    fecha TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    -- Foreign keys con nombres explícitos y comportamiento ON DELETE
    CONSTRAINT movimientos_cliente_id_fkey
        FOREIGN KEY (cliente_id)
        REFERENCES clientes(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    CONSTRAINT movimientos_usuario_id_fkey
        FOREIGN KEY (usuario_id)
        REFERENCES usuarios(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,

    -- Check constraints
    CONSTRAINT movimientos_tipo_check
        CHECK (tipo IN ('DEBITO', 'CREDITO', 'AJUSTE')),

    CONSTRAINT movimientos_monto_check
        CHECK (
            (tipo IN ('DEBITO', 'CREDITO') AND monto > 0) OR
            (tipo = 'AJUSTE' AND monto != 0)
        )
);

-- Índices para optimización de consultas frecuentes
CREATE INDEX idx_movimientos_cliente_id ON movimientos(cliente_id);
CREATE INDEX idx_movimientos_usuario_id ON movimientos(usuario_id);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha DESC);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX idx_movimientos_cliente_fecha ON movimientos(cliente_id, fecha DESC);

COMMENT ON TABLE movimientos IS 'Registro completo de transacciones con auditoría obligatoria de usuario.';
COMMENT ON COLUMN movimientos.usuario_id IS 'AUDITORÍA CRÍTICA: Identifica qué usuario registró el movimiento. Campo obligatorio.';
COMMENT ON COLUMN movimientos.tipo IS 'DEBITO: compra del cliente (aumenta deuda) | CREDITO: pago recibido (reduce deuda) | AJUSTE: corrección/interés/descuento';
COMMENT ON COLUMN movimientos.monto IS 'Monto en pesos. DECIMAL(19,4) para precisión financiera. AJUSTES pueden ser negativos (descuentos).';
COMMENT ON CONSTRAINT movimientos_cliente_id_fkey ON movimientos IS 'RESTRICT: No permitir eliminar clientes con movimientos. Protege integridad contable.';
COMMENT ON CONSTRAINT movimientos_usuario_id_fkey ON movimientos IS 'RESTRICT: No permitir eliminar usuarios que registraron movimientos. Preserva auditoría.';

-- =====================================================
-- TABLA: configuracion
-- Descripción: Parámetros de configuración del sistema
-- =====================================================
CREATE TABLE IF NOT EXISTS configuracion (
    clave VARCHAR(100) PRIMARY KEY,
    valor TEXT NOT NULL,
    descripcion TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE configuracion IS 'Configuración global del sistema. Key-value store flexible.';

-- =====================================================
-- VISTA MATERIALIZADA: saldos_clientes
-- Descripción: Cálculo optimizado de saldos actuales
-- Lógica CORREGIDA: Saldo = DEBITOS - CREDITOS + AJUSTES
-- (Saldo positivo = cliente debe dinero)
-- =====================================================
CREATE MATERIALIZED VIEW IF NOT EXISTS saldos_clientes AS
SELECT
    c.id AS cliente_id,
    c.nombre,
    c.apellido,
    c.telefono,
    c.activo,
    COALESCE(SUM(CASE WHEN m.tipo = 'DEBITO' THEN m.monto ELSE 0 END), 0) AS total_debitos,
    COALESCE(SUM(CASE WHEN m.tipo = 'CREDITO' THEN m.monto ELSE 0 END), 0) AS total_creditos,
    COALESCE(SUM(CASE WHEN m.tipo = 'AJUSTE' THEN m.monto ELSE 0 END), 0) AS total_ajustes,
    (
        COALESCE(SUM(CASE WHEN m.tipo = 'DEBITO' THEN m.monto ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN m.tipo = 'CREDITO' THEN m.monto ELSE 0 END), 0) +
        COALESCE(SUM(CASE WHEN m.tipo = 'AJUSTE' THEN m.monto ELSE 0 END), 0)
    ) AS saldo,
    MAX(m.fecha) AS ultima_operacion,
    COUNT(m.id) AS cantidad_movimientos
FROM clientes c
LEFT JOIN movimientos m ON c.id = m.cliente_id
GROUP BY c.id, c.nombre, c.apellido, c.telefono, c.activo;

-- Índices para la vista materializada
CREATE UNIQUE INDEX idx_saldos_clientes_id ON saldos_clientes(cliente_id);
CREATE INDEX idx_saldos_clientes_saldo ON saldos_clientes(saldo DESC);
CREATE INDEX idx_saldos_clientes_activo_saldo ON saldos_clientes(activo, saldo DESC) WHERE activo = TRUE;

COMMENT ON MATERIALIZED VIEW saldos_clientes IS 'Vista materializada para consultas rápidas de saldos. Auto-refresh con trigger. Saldo positivo = cliente debe dinero.';

-- =====================================================
-- FUNCIÓN: Actualizar vista materializada automáticamente
-- =====================================================
CREATE OR REPLACE FUNCTION refresh_saldos_clientes()
RETURNS TRIGGER AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY saldos_clientes;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION refresh_saldos_clientes() IS 'Trigger function para actualizar saldos_clientes automáticamente tras cambios en movimientos.';

-- Trigger para auto-refresh de la vista materializada
DROP TRIGGER IF EXISTS trigger_refresh_saldos ON movimientos;
CREATE TRIGGER trigger_refresh_saldos
AFTER INSERT OR UPDATE OR DELETE ON movimientos
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_saldos_clientes();

-- =====================================================
-- FUNCIÓN: Actualizar timestamp updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column() IS 'Trigger function para actualizar automáticamente el campo updated_at.';

-- Triggers para actualización automática de updated_at
DROP TRIGGER IF EXISTS update_usuarios_updated_at ON usuarios;
CREATE TRIGGER update_usuarios_updated_at
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_configuracion_updated_at ON configuracion;
CREATE TRIGGER update_configuracion_updated_at
    BEFORE UPDATE ON configuracion
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- CONFIGURACIÓN INICIAL
-- =====================================================
INSERT INTO configuracion (clave, valor, descripcion) VALUES
    ('app_version', '1.0.0', 'Versión actual de la aplicación'),
    ('whatsapp_message_template', 'Hola {nombre}! Te contacto desde María Bags', 'Plantilla para mensajes de WhatsApp'),
    ('dias_mora_notificacion', '30', 'Días de mora para mostrar notificación de deuda'),
    ('tasa_interes_mensual', '0', 'Tasa de interés mensual (0 = desactivado)'),
    ('moneda', 'ARS', 'Código de moneda (ARS = Peso Argentino)')
ON CONFLICT (clave) DO NOTHING;

-- =====================================================
-- FIN DEL SCHEMA
-- =====================================================
