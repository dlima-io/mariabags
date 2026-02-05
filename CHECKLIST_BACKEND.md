# Checklist de Integración Backend - Historial de Movimientos

## Lista de Verificación para el Desarrollador Backend

Esta lista ayuda a asegurar que el backend esté correctamente preparado para trabajar con el módulo de Historial de Movimientos del frontend.

---

## 1. Endpoints de Clientes

### GET /api/clientes/:id
**Estado:** [ ] Implementado [ ] Probado

**Requisitos:**
- [x] Retorna información básica del cliente
- [ ] Incluye campo `saldo` (number)
- [ ] Incluye campo `ultima_operacion` (string | null) - fecha ISO
- [ ] Calcula el saldo correctamente: DEBITOS - CREDITOS + AJUSTES
- [ ] Maneja cliente no encontrado (404)
- [ ] Requiere autenticación (JWT)

**Respuesta esperada:**
```json
{
  "id": "uuid-v4",
  "nombre": "María",
  "apellido": "González",
  "telefono": "+541234567890",
  "activo": true,
  "fecha_creacion": "2024-01-15T10:30:00.000Z",
  "saldo": 4000.00,
  "ultima_operacion": "2024-02-04T14:30:00.000Z"
}
```

**Cálculo del saldo:**
```sql
-- PostgreSQL
SELECT
  c.*,
  COALESCE(
    SUM(CASE
      WHEN m.tipo = 'DEBITO' THEN m.monto
      WHEN m.tipo = 'CREDITO' THEN -m.monto
      ELSE m.monto
    END),
    0
  ) as saldo,
  MAX(m.fecha) as ultima_operacion
FROM CLIENTES c
LEFT JOIN MOVIMIENTOS m ON c.id = m.cliente_id
WHERE c.id = $1
GROUP BY c.id;
```

---

## 2. Endpoints de Movimientos

### GET /api/movimientos/cliente/:id
**Estado:** [ ] Implementado [ ] Probado

**Requisitos:**
- [ ] Retorna todos los movimientos del cliente
- [ ] Ordenados por fecha DESC (más reciente primero)
- [ ] Incluye información del usuario que registró
- [ ] Join con tabla USUARIOS para traer username
- [ ] Maneja cliente sin movimientos (array vacío)
- [ ] Requiere autenticación (JWT)

**Respuesta esperada:**
```json
[
  {
    "id": "uuid-v4",
    "cliente_id": "uuid-v4",
    "usuario_id": "uuid-v4",
    "tipo": "DEBITO",
    "monto": 2000.00,
    "fecha": "2024-02-04T14:30:00.000Z",
    "observaciones": "Cartera modelo premium, color negro",
    "usuario": {
      "username": "admin"
    }
  },
  {
    "id": "uuid-v4",
    "cliente_id": "uuid-v4",
    "usuario_id": "uuid-v4",
    "tipo": "CREDITO",
    "monto": 1500.00,
    "fecha": "2024-02-03T10:15:00.000Z",
    "observaciones": "Pago en efectivo",
    "usuario": {
      "username": "admin"
    }
  }
]
```

**Query sugerida:**
```sql
-- PostgreSQL
SELECT
  m.*,
  json_build_object('username', u.username) as usuario
FROM MOVIMIENTOS m
INNER JOIN USUARIOS u ON m.usuario_id = u.id
WHERE m.cliente_id = $1
ORDER BY m.fecha DESC;
```

---

### POST /api/movimientos/compra
**Estado:** [ ] Implementado [ ] Probado

**Requisitos:**
- [ ] Crea un movimiento tipo DEBITO
- [ ] Valida que cliente_id exista
- [ ] Valida que monto sea > 0
- [ ] Valida que monto sea <= 99999999.99
- [ ] Obtiene usuario_id del token JWT
- [ ] Registra fecha actual (NOW())
- [ ] Observaciones opcional (max 500 chars)
- [ ] Retorna el movimiento creado con usuario incluido
- [ ] Requiere autenticación (JWT)

**Request:**
```json
{
  "cliente_id": "uuid-v4",
  "monto": 2000.00,
  "observaciones": "Cartera modelo premium"
}
```

**Validaciones:**
```javascript
- cliente_id: required, uuid, exists
- monto: required, number, > 0, <= 99999999.99
- observaciones: optional, string, max 500 chars
```

**Respuesta esperada:**
```json
{
  "id": "uuid-v4",
  "cliente_id": "uuid-v4",
  "usuario_id": "uuid-v4",
  "tipo": "DEBITO",
  "monto": 2000.00,
  "fecha": "2024-02-04T14:30:00.000Z",
  "observaciones": "Cartera modelo premium",
  "usuario": {
    "username": "admin"
  }
}
```

---

### POST /api/movimientos/pago
**Estado:** [ ] Implementado [ ] Probado

**Requisitos:**
- [ ] Crea un movimiento tipo CREDITO
- [ ] Mismas validaciones que compra
- [ ] Obtiene usuario_id del token JWT
- [ ] Registra fecha actual
- [ ] Retorna movimiento con usuario

**Request:**
```json
{
  "cliente_id": "uuid-v4",
  "monto": 1500.00,
  "observaciones": "Pago en efectivo"
}
```

**Validaciones:**
Iguales a POST /api/movimientos/compra

---

### POST /api/movimientos/ajuste
**Estado:** [ ] Implementado [ ] Probado

**Requisitos:**
- [ ] Crea un movimiento tipo AJUSTE
- [ ] Valida cliente_id exista
- [ ] Valida monto != 0 (puede ser negativo)
- [ ] Valida monto entre -99999999.99 y 99999999.99
- [ ] Acepta campo opcional `porcentaje` (si se usa)
- [ ] Obtiene usuario_id del token JWT
- [ ] Registra fecha actual
- [ ] Retorna movimiento con usuario

**Request:**
```json
{
  "cliente_id": "uuid-v4",
  "monto": 400.00,
  "observaciones": "Recargo por mora 10%",
  "porcentaje": 10
}
```

**Validaciones:**
```javascript
- cliente_id: required, uuid, exists
- monto: required, number, != 0, >= -99999999.99, <= 99999999.99
- observaciones: optional, string, max 500 chars
- porcentaje: optional, number (si se implementa)
```

---

## 3. Autenticación y Seguridad

### JWT Token
**Estado:** [ ] Verificado

**Requisitos:**
- [ ] Todas las rutas de movimientos requieren JWT
- [ ] Token se valida en cada request
- [ ] Token incluye usuario_id
- [ ] Token se extrae del header Authorization: Bearer [token]
- [ ] Token inválido retorna 401
- [ ] Token expirado retorna 401

**Middleware de autenticación:**
```javascript
// Pseudocódigo
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.userId = decoded.id; // ← Importante: Disponible para controllers
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido' });
  }
}
```

---

## 4. Validaciones de Datos

### Validación de Monto
**Estado:** [ ] Implementado

**Requisitos:**
- [ ] Tipo number (no string)
- [ ] Precisión de 2 decimales
- [ ] Compras/Pagos: solo positivos
- [ ] Ajustes: pueden ser negativos
- [ ] Máximo: 99,999,999.99
- [ ] No puede ser 0

**Validador sugerido:**
```javascript
function validateMonto(monto, tipo) {
  if (typeof monto !== 'number') {
    throw new Error('El monto debe ser un número');
  }

  if (monto === 0) {
    throw new Error('El monto no puede ser cero');
  }

  if (Math.abs(monto) > 99999999.99) {
    throw new Error('El monto excede el límite permitido');
  }

  if (tipo !== 'AJUSTE' && monto < 0) {
    throw new Error('El monto no puede ser negativo para compras y pagos');
  }

  // Validar decimales
  if (!/^\d+(\.\d{1,2})?$/.test(monto.toString())) {
    throw new Error('El monto debe tener máximo 2 decimales');
  }

  return true;
}
```

---

### Validación de Observaciones
**Estado:** [ ] Implementado

**Requisitos:**
- [ ] Campo opcional
- [ ] Tipo string
- [ ] Máximo 500 caracteres
- [ ] Sanitizar contra XSS
- [ ] Trim de espacios

**Validador sugerido:**
```javascript
function validateObservaciones(obs) {
  if (!obs) return null; // Opcional

  if (typeof obs !== 'string') {
    throw new Error('Las observaciones deben ser texto');
  }

  const trimmed = obs.trim();

  if (trimmed.length > 500) {
    throw new Error('Las observaciones no pueden superar los 500 caracteres');
  }

  // Sanitizar contra XSS
  return sanitizeHTML(trimmed);
}
```

---

## 5. Manejo de Errores

### Códigos de Estado HTTP
**Estado:** [ ] Implementado

**Requisitos:**
- [ ] 200: Éxito (GET)
- [ ] 201: Creado (POST exitoso)
- [ ] 400: Error de validación
- [ ] 401: No autorizado
- [ ] 404: Cliente no encontrado
- [ ] 500: Error del servidor

**Formato de respuesta de error:**
```json
{
  "message": "Descripción del error",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Ejemplos:**
```json
// 400 - Validación
{
  "message": "El monto debe ser mayor a cero",
  "code": "INVALID_AMOUNT"
}

// 404 - No encontrado
{
  "message": "Cliente no encontrado",
  "code": "CLIENT_NOT_FOUND"
}

// 401 - No autorizado
{
  "message": "Token inválido o expirado",
  "code": "UNAUTHORIZED"
}
```

---

## 6. Base de Datos

### Tabla MOVIMIENTOS
**Estado:** [ ] Verificada

**Requisitos:**
- [ ] Campo `id` UUID PRIMARY KEY
- [ ] Campo `cliente_id` UUID NOT NULL REFERENCES CLIENTES(id)
- [ ] Campo `usuario_id` UUID NOT NULL REFERENCES USUARIOS(id)
- [ ] Campo `tipo` ENUM('DEBITO', 'CREDITO', 'AJUSTE') NOT NULL
- [ ] Campo `monto` DECIMAL(12,2) NOT NULL
- [ ] Campo `fecha` TIMESTAMP NOT NULL DEFAULT NOW()
- [ ] Campo `observaciones` VARCHAR(500) NULL
- [ ] Índice en `cliente_id`
- [ ] Índice en `fecha` DESC

**SQL de creación:**
```sql
CREATE TABLE IF NOT EXISTS MOVIMIENTOS (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES CLIENTES(id),
  usuario_id UUID NOT NULL REFERENCES USUARIOS(id),
  tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('DEBITO', 'CREDITO', 'AJUSTE')),
  monto DECIMAL(12,2) NOT NULL,
  fecha TIMESTAMP NOT NULL DEFAULT NOW(),
  observaciones VARCHAR(500),

  CONSTRAINT check_monto CHECK (monto != 0)
);

CREATE INDEX idx_movimientos_cliente ON MOVIMIENTOS(cliente_id);
CREATE INDEX idx_movimientos_fecha ON MOVIMIENTOS(fecha DESC);
```

---

## 7. Testing

### Tests Unitarios
**Estado:** [ ] Implementados

**Requisitos:**
- [ ] Test: Crear compra exitosa
- [ ] Test: Crear pago exitoso
- [ ] Test: Crear ajuste exitoso
- [ ] Test: Validar monto negativo en compra (falla)
- [ ] Test: Validar monto cero (falla)
- [ ] Test: Validar monto muy grande (falla)
- [ ] Test: Cliente no existe (falla)
- [ ] Test: Sin autenticación (falla)
- [ ] Test: Observaciones muy largas (falla)
- [ ] Test: Cálculo de saldo correcto

---

### Tests de Integración
**Estado:** [ ] Implementados

**Requisitos:**
- [ ] Test: Flujo completo - crear compra y verificar saldo
- [ ] Test: Múltiples movimientos y saldo acumulado
- [ ] Test: Obtener historial de cliente
- [ ] Test: Historial ordenado por fecha DESC
- [ ] Test: Usuario incluido en movimientos

---

## 8. Performance

### Optimizaciones
**Estado:** [ ] Implementadas

**Requisitos:**
- [ ] Query de saldo optimizada (índices)
- [ ] Query de historial con JOIN eficiente
- [ ] Paginación opcional para clientes con muchos movimientos
- [ ] Cache de saldo (opcional, con invalidación)
- [ ] Límite de resultados (opcional)

**Query optimizada con paginación:**
```sql
-- Con paginación
SELECT
  m.*,
  json_build_object('username', u.username) as usuario
FROM MOVIMIENTOS m
INNER JOIN USUARIOS u ON m.usuario_id = u.id
WHERE m.cliente_id = $1
ORDER BY m.fecha DESC
LIMIT $2 OFFSET $3;
```

---

## 9. Logs y Auditoría

### Logging
**Estado:** [ ] Implementado

**Requisitos:**
- [ ] Log de todos los movimientos creados
- [ ] Log con formato: [TIMESTAMP] [USER] [ACTION] [DETAILS]
- [ ] Incluir IP del usuario
- [ ] Incluir datos del movimiento
- [ ] Nivel INFO para éxitos
- [ ] Nivel ERROR para fallos

**Ejemplo de log:**
```
[2024-02-04 14:30:00] [admin] [CREATE_COMPRA] Cliente: uuid-123, Monto: $2000, IP: 192.168.1.1
[2024-02-04 14:31:00] [admin] [CREATE_PAGO] Cliente: uuid-123, Monto: $1500, IP: 192.168.1.1
```

---

## 10. Documentación

### API Documentation
**Estado:** [ ] Completada

**Requisitos:**
- [ ] Swagger/OpenAPI spec
- [ ] Ejemplos de requests
- [ ] Ejemplos de responses
- [ ] Códigos de error documentados
- [ ] Autenticación documentada

---

## 11. Checklist de Deploy

### Pre-Deploy
- [ ] Todas las migraciones de BD ejecutadas
- [ ] Tests pasando al 100%
- [ ] Variables de entorno configuradas
- [ ] JWT_SECRET configurado
- [ ] CORS configurado para frontend
- [ ] Logs funcionando

### Post-Deploy
- [ ] Verificar endpoints con Postman/Thunder Client
- [ ] Verificar cálculo de saldo
- [ ] Verificar autenticación
- [ ] Verificar logs
- [ ] Monitorear errores

---

## 12. Endpoints para Verificar Manualmente

### Usando curl o Postman

```bash
# 1. Login (obtener token)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Guardar el token de la respuesta

# 2. Obtener cliente con saldo
curl -X GET http://localhost:3000/api/clientes/[UUID] \
  -H "Authorization: Bearer [TOKEN]"

# 3. Obtener movimientos
curl -X GET http://localhost:3000/api/movimientos/cliente/[UUID] \
  -H "Authorization: Bearer [TOKEN]"

# 4. Crear compra
curl -X POST http://localhost:3000/api/movimientos/compra \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "[UUID]",
    "monto": 2000,
    "observaciones": "Cartera premium"
  }'

# 5. Crear pago
curl -X POST http://localhost:3000/api/movimientos/pago \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "[UUID]",
    "monto": 1500,
    "observaciones": "Pago en efectivo"
  }'

# 6. Crear ajuste
curl -X POST http://localhost:3000/api/movimientos/ajuste \
  -H "Authorization: Bearer [TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "[UUID]",
    "monto": 400,
    "observaciones": "Recargo 10%"
  }'
```

---

## 13. Casos de Prueba

### Caso 1: Flujo Completo
```
1. Crear cliente nuevo
2. Verificar saldo = 0
3. Crear compra de $2000
4. Verificar saldo = $2000
5. Crear compra de $1500
6. Verificar saldo = $3500
7. Crear pago de $1000
8. Verificar saldo = $2500
9. Crear ajuste de +$500
10. Verificar saldo = $3000
11. Obtener historial
12. Verificar 4 movimientos en orden DESC
```

### Caso 2: Validaciones
```
1. Intentar crear compra con monto 0 → Error 400
2. Intentar crear compra con monto negativo → Error 400
3. Intentar crear compra sin token → Error 401
4. Intentar crear compra con cliente inexistente → Error 404
5. Intentar crear con observaciones > 500 chars → Error 400
```

---

## Resumen de Checklist

### Endpoints
- [ ] GET /api/clientes/:id (con saldo)
- [ ] GET /api/movimientos/cliente/:id
- [ ] POST /api/movimientos/compra
- [ ] POST /api/movimientos/pago
- [ ] POST /api/movimientos/ajuste

### Validaciones
- [ ] Monto positivo (compra/pago)
- [ ] Monto no cero
- [ ] Monto máximo 99,999,999.99
- [ ] Observaciones max 500 chars
- [ ] Cliente existe
- [ ] Usuario autenticado

### Respuestas
- [ ] Incluir campo usuario en movimientos
- [ ] Incluir saldo en cliente
- [ ] Ordenar movimientos por fecha DESC
- [ ] Códigos HTTP correctos
- [ ] Formato de error consistente

### Seguridad
- [ ] JWT en todas las rutas
- [ ] Usuario_id desde token
- [ ] Sanitización de inputs
- [ ] CORS configurado

### Performance
- [ ] Índices en BD
- [ ] Queries optimizadas
- [ ] Joins eficientes

### Testing
- [ ] Tests unitarios
- [ ] Tests de integración
- [ ] Tests de carga (opcional)

---

**Última actualización:** 2026-02-04
**Versión:** 1.0.0
**Estado:** Listo para implementación backend
