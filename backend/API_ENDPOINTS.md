# María Bags - Documentación de API

## Base URL

```
http://localhost:3000/api
```

---

## 🔐 Autenticación

Todos los endpoints (excepto `/auth/login`, `/auth/refresh` y `/auth/verify`) requieren autenticación mediante JWT token en el header:

```
Authorization: Bearer <token>
```

### POST /api/auth/login

Iniciar sesión y obtener tokens.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid",
    "username": "admin",
    "rol": "ADMIN"
  }
}
```

### POST /api/auth/refresh

Renovar token expirado usando refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "token": "nuevo_token...",
  "refreshToken": "nuevo_refresh_token...",
  "usuario": { ... }
}
```

### POST /api/auth/verify

Verificar si un token es válido.

**Request Body:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response 200:**
```json
{
  "valid": true,
  "usuario": {
    "id": "uuid",
    "username": "admin",
    "rol": "ADMIN"
  }
}
```

### GET /api/auth/me

Obtener información del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response 200:**
```json
{
  "usuario": {
    "id": "uuid",
    "username": "admin",
    "rol": "ADMIN"
  }
}
```

### POST /api/auth/change-password

Cambiar contraseña del usuario autenticado.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currentPassword": "admin123",
  "newPassword": "nueva_password_segura"
}
```

**Response 200:**
```json
{
  "message": "Contraseña cambiada exitosamente"
}
```

---

## 👥 Clientes

### GET /api/clientes

Obtener todos los clientes activos.

**Query Params:**
- `includeInactive` (boolean, opcional): Incluir clientes inactivos

**Response 200:**
```json
[
  {
    "id": "uuid",
    "nombre": "María",
    "apellido": "González",
    "telefono": "+541134567890",
    "activo": true,
    "fecha_creacion": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
  }
]
```

### GET /api/clientes/with-saldo

Obtener todos los clientes con sus saldos.

**Query Params:**
- `includeInactive` (boolean, opcional)

**Response 200:**
```json
[
  {
    "id": "uuid",
    "nombre": "María",
    "apellido": "González",
    "telefono": "+541134567890",
    "activo": true,
    "saldo": 4000.00,
    "ultima_operacion": "2024-01-20T14:00:00Z",
    "cantidad_movimientos": 3
  }
]
```

### GET /api/clientes/deuda

Obtener clientes con deuda (saldo > 0).

**Response 200:**
```json
[
  {
    "id": "uuid",
    "nombre": "María",
    "apellido": "González",
    "saldo": 4000.00,
    ...
  }
]
```

### GET /api/clientes/mora

Obtener clientes con mora (> X días sin pagar con deuda).

**Query Params:**
- `dias` (number, opcional, default: 30): Días de mora

**Response 200:**
```json
[
  {
    "id": "uuid",
    "nombre": "Laura",
    "apellido": "Martínez",
    "saldo": 7150.00,
    "dias_mora": 45,
    ...
  }
]
```

### GET /api/clientes/search

Buscar clientes por nombre, apellido o teléfono.

**Query Params:**
- `q` (string, requerido): Término de búsqueda
- `includeInactive` (boolean, opcional)

**Response 200:**
```json
[
  {
    "id": "uuid",
    "nombre": "María",
    "apellido": "González",
    ...
  }
]
```

### GET /api/clientes/:id

Obtener cliente por ID.

**Response 200:**
```json
{
  "id": "uuid",
  "nombre": "María",
  "apellido": "González",
  "telefono": "+541134567890",
  "activo": true,
  "fecha_creacion": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z"
}
```

### GET /api/clientes/:id/saldo

Obtener cliente con saldo.

**Response 200:**
```json
{
  "id": "uuid",
  "nombre": "María",
  "apellido": "González",
  "telefono": "+541134567890",
  "activo": true,
  "saldo": 4000.00,
  "ultima_operacion": "2024-01-20T14:00:00Z",
  "cantidad_movimientos": 3
}
```

### GET /api/clientes/:id/whatsapp

Generar link de WhatsApp para contactar cliente.

**Query Params:**
- `message` (string, opcional): Mensaje personalizado

**Response 200:**
```json
{
  "url": "https://wa.me/541134567890?text=Hola%20Mar%C3%ADa!%20Te%20contacto%20desde%20Mar%C3%ADa%20Bags",
  "telefono": "+541134567890",
  "mensaje": "Hola María! Te contacto desde María Bags"
}
```

### POST /api/clientes

Crear nuevo cliente.

**Request Body:**
```json
{
  "nombre": "Carlos",
  "apellido": "Pérez",
  "telefono": "+541145678901"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "nombre": "Carlos",
  "apellido": "Pérez",
  "telefono": "+541145678901",
  "activo": true,
  "fecha_creacion": "2024-01-21T10:00:00Z",
  "updated_at": "2024-01-21T10:00:00Z"
}
```

### PUT /api/clientes/:id

Actualizar cliente.

**Request Body:**
```json
{
  "nombre": "Carlos Eduardo",
  "apellido": "Pérez",
  "telefono": "+541145678901",
  "activo": true
}
```

**Response 200:**
```json
{
  "id": "uuid",
  "nombre": "Carlos Eduardo",
  "apellido": "Pérez",
  ...
}
```

### DELETE /api/clientes/:id

Desactivar cliente (soft delete).

**Response 200:**
```json
{
  "message": "Cliente desactivado exitosamente",
  "cliente": { ... }
}
```

---

## 💰 Movimientos

### GET /api/movimientos/recientes

Obtener movimientos recientes de todos los clientes.

**Query Params:**
- `limit` (number, opcional, default: 20, max: 100)

**Response 200:**
```json
[
  {
    "id": "uuid",
    "cliente_id": "uuid",
    "usuario_id": "uuid",
    "tipo": "DEBITO",
    "monto": 5000.00,
    "fecha": "2024-01-20T14:00:00Z",
    "observaciones": "Cartera modelo Premium",
    "created_at": "2024-01-20T14:00:00Z",
    "nombre": "María",
    "apellido": "González",
    "telefono": "+541134567890"
  }
]
```

### GET /api/movimientos/estadisticas

Obtener estadísticas de movimientos.

**Query Params:**
- `clienteId` (uuid, opcional): Filtrar por cliente específico

**Response 200:**
```json
{
  "total_movimientos": 150,
  "total_debitos": 125000.00,
  "total_creditos": 98000.00,
  "total_ajustes": 2500.00,
  "primer_movimiento": "2024-01-01T10:00:00Z",
  "ultimo_movimiento": "2024-01-20T14:00:00Z"
}
```

### GET /api/movimientos/cliente/:clienteId

Obtener movimientos de un cliente específico.

**Query Params:**
- `limit` (number, opcional): Limitar cantidad de resultados

**Response 200:**
```json
[
  {
    "id": "uuid",
    "cliente_id": "uuid",
    "usuario_id": "uuid",
    "tipo": "DEBITO",
    "monto": 5000.00,
    "fecha": "2024-01-20T14:00:00Z",
    "observaciones": "Cartera modelo Premium",
    "created_at": "2024-01-20T14:00:00Z"
  }
]
```

### GET /api/movimientos/:id

Obtener movimiento por ID.

**Response 200:**
```json
{
  "id": "uuid",
  "cliente_id": "uuid",
  "usuario_id": "uuid",
  "tipo": "DEBITO",
  "monto": 5000.00,
  "fecha": "2024-01-20T14:00:00Z",
  "observaciones": "Cartera modelo Premium",
  "created_at": "2024-01-20T14:00:00Z"
}
```

### POST /api/movimientos

Crear nuevo movimiento.

**Request Body:**
```json
{
  "cliente_id": "uuid",
  "tipo": "DEBITO",
  "monto": 5000.00,
  "observaciones": "Cartera modelo Premium"
}
```

**Tipos de movimiento:**
- `DEBITO`: Compra del cliente (aumenta deuda)
- `CREDITO`: Pago recibido (reduce deuda)
- `AJUSTE`: Corrección/interés/descuento (puede ser positivo o negativo)

**Response 201:**
```json
{
  "id": "uuid",
  "cliente_id": "uuid",
  "usuario_id": "uuid (del usuario autenticado)",
  "tipo": "DEBITO",
  "monto": 5000.00,
  "fecha": "2024-01-20T14:00:00Z",
  "observaciones": "Cartera modelo Premium",
  "created_at": "2024-01-20T14:00:00Z"
}
```

### POST /api/movimientos/compra

Atajo para registrar una compra (DEBITO).

**Request Body:**
```json
{
  "cliente_id": "uuid",
  "monto": 5000.00,
  "observaciones": "Cartera modelo Premium"
}
```

### POST /api/movimientos/pago

Atajo para registrar un pago (CREDITO).

**Request Body:**
```json
{
  "cliente_id": "uuid",
  "monto": 3000.00,
  "observaciones": "Pago parcial"
}
```

### POST /api/movimientos/ajuste

Aplicar ajuste manual (recargo o descuento).

**Request Body:**
```json
{
  "cliente_id": "uuid",
  "monto": 500.00,
  "observaciones": "Recargo por mora"
}
```

**Nota:** El monto puede ser negativo para descuentos.

### POST /api/movimientos/ajuste-porcentual

Aplicar ajuste porcentual sobre el saldo actual.

**Request Body:**
```json
{
  "cliente_id": "uuid",
  "porcentaje": 10,
  "observaciones": "Recargo 10% por mora"
}
```

**Nota:** El porcentaje puede ser negativo para descuentos.

**Ejemplo de cálculo:**
- Saldo actual: $4,000
- Porcentaje: 10%
- Ajuste aplicado: $400
- Nuevo saldo: $4,400

### PATCH /api/movimientos/:id/observaciones

Actualizar observaciones de un movimiento.

**Request Body:**
```json
{
  "observaciones": "Nueva observación actualizada"
}
```

### DELETE /api/movimientos/:id

Eliminar movimiento (solo para corrección de errores).

**Response 200:**
```json
{
  "message": "Movimiento eliminado exitosamente"
}
```

---

## 👤 Usuarios (Solo ADMIN)

### GET /api/usuarios

Obtener todos los usuarios. **Requiere rol ADMIN.**

**Response 200:**
```json
[
  {
    "id": "uuid",
    "username": "admin",
    "rol": "ADMIN",
    "created_at": "2024-01-01T10:00:00Z",
    "updated_at": "2024-01-01T10:00:00Z"
  }
]
```

### GET /api/usuarios/:id

Obtener usuario por ID.

**Response 200:**
```json
{
  "id": "uuid",
  "username": "admin",
  "rol": "ADMIN",
  "created_at": "2024-01-01T10:00:00Z",
  "updated_at": "2024-01-01T10:00:00Z"
}
```

### POST /api/usuarios

Crear nuevo usuario. **Requiere rol ADMIN.**

**Request Body:**
```json
{
  "username": "nuevo_usuario",
  "password": "password123",
  "rol": "STAFF"
}
```

**Roles disponibles:**
- `ADMIN`: Acceso completo (gestión de usuarios, clientes, movimientos)
- `STAFF`: Acceso limitado (solo clientes y movimientos)

**Response 201:**
```json
{
  "id": "uuid",
  "username": "nuevo_usuario",
  "rol": "STAFF",
  "created_at": "2024-01-21T10:00:00Z",
  "updated_at": "2024-01-21T10:00:00Z"
}
```

### PUT /api/usuarios/:id

Actualizar usuario. **Requiere rol ADMIN.**

**Request Body:**
```json
{
  "username": "usuario_actualizado",
  "password": "nueva_password",
  "rol": "ADMIN"
}
```

**Nota:** Todos los campos son opcionales.

### DELETE /api/usuarios/:id

Eliminar usuario. **Requiere rol ADMIN.**

**Restricciones:**
- No se puede eliminar un usuario que tenga movimientos registrados
- No se puede eliminar el propio usuario autenticado

**Response 200:**
```json
{
  "message": "Usuario eliminado exitosamente"
}
```

### PATCH /api/usuarios/:id/rol

Cambiar rol de usuario. **Requiere rol ADMIN.**

**Request Body:**
```json
{
  "rol": "STAFF"
}
```

**Restricción:**
- Un admin no puede quitarse sus propios privilegios de ADMIN

---

## 📊 Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Operación exitosa |
| 201 | Recurso creado exitosamente |
| 400 | Error en los datos enviados (validación) |
| 401 | No autenticado o token inválido |
| 403 | No autorizado (sin permisos) |
| 404 | Recurso no encontrado |
| 409 | Conflicto (ej: teléfono duplicado) |
| 500 | Error interno del servidor |

---

## 🔒 Seguridad

### Headers Requeridos

Todos los endpoints autenticados requieren:

```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Validaciones

- Todos los inputs son sanitizados contra XSS
- Consultas SQL parametrizadas (prevención SQL Injection)
- Contraseñas hasheadas con bcrypt (10 rounds)
- JWT tokens con expiración configurable

### Auditoría

- Todos los movimientos incluyen `usuario_id` (quién lo registró)
- Timestamps automáticos (`created_at`, `updated_at`)
- Soft delete en clientes (preserva historial)

---

## 💡 Ejemplos de Uso

### Login y obtener token

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Crear cliente

```bash
curl -X POST http://localhost:3000/api/clientes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "+541145678901"
  }'
```

### Registrar compra

```bash
curl -X POST http://localhost:3000/api/movimientos/compra \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "cliente_id": "uuid-del-cliente",
    "monto": 5000.00,
    "observaciones": "Cartera modelo Premium - Color negro"
  }'
```

### Ver clientes con deuda

```bash
curl http://localhost:3000/api/clientes/deuda \
  -H "Authorization: Bearer <token>"
```

### Generar link de WhatsApp

```bash
curl "http://localhost:3000/api/clientes/uuid-del-cliente/whatsapp?message=Hola! Tenés una deuda pendiente" \
  -H "Authorization: Bearer <token>"
```

---

## 🔄 Flujo Típico de Uso

1. **Login** → Obtener token JWT
2. **Crear/Buscar cliente** → Obtener ID del cliente
3. **Registrar compra** → POST `/api/movimientos/compra`
4. **Ver saldo** → GET `/api/clientes/:id/saldo`
5. **Registrar pago** → POST `/api/movimientos/pago`
6. **Ver clientes con mora** → GET `/api/clientes/mora`
7. **Contactar por WhatsApp** → GET `/api/clientes/:id/whatsapp`

---

Para más información, consultar:
- `backend/README.md` - Documentación del backend
- `CLAUDE.md` - Especificaciones del proyecto
