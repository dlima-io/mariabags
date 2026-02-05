# Proyecto: María Bags - Gestión de Cuentas Corrientes

## Visión General
Webapp mobile-first para el control de deudas y pagos de "María Bags". El sistema prioriza la rapidez en el registro y una interfaz vibrante, optimizada para uso táctil.

## Stack Tecnológico
- **Frontend:** React (Vite) + Tailwind CSS + Framer Motion.
- **Backend:** Node.js (Express) + TypeScript.
- **Base de Datos:** PostgreSQL.
- **Seguridad:** JWT (Auth), Bcryptjs (Hashing), CORS configurado.

## Protocolo de Seguridad y Auditoría
1. **Identificación Única:** Al no usar DNI, el campo `telefono` debe ser único (`UNIQUE`) para evitar duplicados.
2. **Cifrado de Acceso:** Contraseñas de administradores siempre con `bcrypt` (10 rounds).
3. **Integridad Contable:** Cada inserción en `MOVIMIENTOS` debe incluir obligatoriamente el `usuario_id` del administrador para auditoría ("¿Quién cargó este pago?").
4. **Validación de Datos:** Sanitización de inputs para prevenir SQL Injection y XSS.
5. **Persistencia:** No eliminar registros de clientes; usar un campo `activo: boolean` (Soft Delete) para preservar el historial de deudas.

## Estructura de Datos (Esquema SQL)
- **CLIENTES:** `id (UUID)`, `nombre`, `apellido`, `telefono (UNIQUE)`, `activo (boolean)`, `fecha_creacion`.
- **MOVIMIENTOS:** `id (UUID)`, `cliente_id`, `usuario_id (Audit)`, `tipo (DEBITO/CREDITO/AJUSTE)`, `monto`, `fecha`, `observaciones`.
- **USUARIOS:** `id (UUID)`, `username`, `password_hash`, `rol (ADMIN/STAFF)`.
- **CONFIGURACION:** `clave`, `valor`.

## Reglas de Arquitectura
- **Backend:** Arquitectura de capas: `Routes` -> `Controllers` -> `Services` -> `Models`.
- **Lógica de Saldo:** El saldo de un cliente es una operación calculada en el servidor: `SUM(CREDITOS) - SUM(DEBITOS)`.
- **Lógica de Ajustes:** Los ajustes son individuales por defecto. 
- **Flexibilidad de Ajuste:** Se debe soportar entrada incremental (sumar monto) o porcentual (multiplicar saldo actual). 
- **Transparencia:** Todo ajuste debe ser reversible mediante un movimiento de signo opuesto o reflejar claramente en el historial que fue una modificación administrativa, no una compra.

## Guía de Estilo UI/UX
- **Paleta:** Colores brillantes (Rosa vibrante, Blanco purista, Acentos en Negro).
- **Mobile-First:** Botones grandes (44px min), navegación por tabs inferior.
- **WhatsApp:** Integración directa mediante `wa.me/[telefono]` con mensaje pre-cargado.

## Roadmap de Desarrollo
1. Setup de Postgres y Auth (Backend).
2. CRUD de Clientes (sin DNI) y validación de teléfono.
3. Lógica de transacciones (Carga de compras y pagos).
4. Pantalla de Notificaciones (Clientes con deuda > 30 días).
5. Pulido de animaciones y UX móvil.