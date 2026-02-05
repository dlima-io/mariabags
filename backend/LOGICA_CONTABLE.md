# Lógica Contable del Sistema María Bags

## Índice
1. [Visión General](#visión-general)
2. [Conceptos Fundamentales](#conceptos-fundamentales)
3. [Fórmula de Cálculo de Saldo](#fórmula-de-cálculo-de-saldo)
4. [Tipos de Movimientos](#tipos-de-movimientos)
5. [Flujos de Operaciones](#flujos-de-operaciones)
6. [Validaciones Implementadas](#validaciones-implementadas)
7. [Casos de Uso Detallados](#casos-de-uso-detallados)
8. [Integridad y Auditoría](#integridad-y-auditoría)
9. [Arquitectura de Base de Datos](#arquitectura-de-base-de-datos)
10. [Ejemplos de Cálculo](#ejemplos-de-cálculo)

---

## Visión General

El sistema de María Bags implementa un modelo de **cuenta corriente** donde se registran las operaciones financieras entre el negocio y sus clientes. Cada operación queda registrada como un **movimiento** en la base de datos, permitiendo:

- **Trazabilidad completa:** Cada peso que entra o sale está documentado
- **Auditoría obligatoria:** Cada movimiento registra quién lo creó
- **Cálculo automático de saldos:** Vista materializada optimizada
- **Preservación de historial:** Soft delete de clientes para no perder datos

---

## Conceptos Fundamentales

### Perspectiva del Sistema
El sistema registra las transacciones desde la **perspectiva del negocio** (María Bags):
- Un saldo positivo indica que el cliente **debe dinero** al negocio
- Un saldo negativo indica que el cliente tiene **crédito a favor** (pagó de más)
- Un saldo cero indica que no hay deuda pendiente

### Principios Contables Aplicados
1. **Partida simple:** No se usa contabilidad de partida doble (débito/crédito contable), sino un modelo simplificado de cuenta corriente
2. **Inmutabilidad:** Los movimientos no se modifican (excepto observaciones), solo se agregan nuevos
3. **Auditoría:** Cada movimiento registra el usuario que lo creó
4. **Conciliación:** El saldo siempre es la suma de todos los movimientos

---

## Fórmula de Cálculo de Saldo

### Fórmula Principal
```
Saldo = DEBITOS - CREDITOS + AJUSTES
```

### Interpretación
- **Saldo > 0:** Cliente debe dinero al negocio
- **Saldo = 0:** Cliente está al día, no tiene deuda
- **Saldo < 0:** Cliente tiene saldo a favor (pagó de más)

### Ejemplo Numérico
```
DEBITOS (compras):    $10,000
CREDITOS (pagos):     $7,000
AJUSTES (intereses):  $500

Saldo = 10,000 - 7,000 + 500 = $3,500
(El cliente debe $3,500)
```

---

## Tipos de Movimientos

### 1. DEBITO (Compra del Cliente)

**Definición:** Registro de una compra realizada por el cliente. Aumenta la deuda del cliente hacia el negocio.

**Características:**
- **Signo:** Siempre positivo (> 0)
- **Efecto en saldo:** Aumenta el saldo (suma)
- **Uso típico:** Venta de productos a crédito
- **Validación:** Monto debe ser mayor a cero

**Ejemplo:**
```
Cliente compra una cartera de $2,000
Movimiento: DEBITO +$2,000
Efecto: Saldo aumenta $2,000
```

**Registro en BD:**
```sql
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '456e7890-e89b-12d3-a456-426614174000',
  'DEBITO',
  2000.00,
  'Venta de cartera premium - modelo 2024'
);
```

---

### 2. CREDITO (Pago del Cliente)

**Definición:** Registro de un pago recibido del cliente. Reduce la deuda del cliente.

**Características:**
- **Signo:** Siempre positivo (> 0)
- **Efecto en saldo:** Disminuye el saldo (resta)
- **Uso típico:** Pago parcial o total de deuda
- **Validación:** Monto debe ser mayor a cero

**Ejemplo:**
```
Cliente paga $1,500 de su deuda
Movimiento: CREDITO +$1,500
Efecto: Saldo disminuye $1,500
```

**Registro en BD:**
```sql
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '456e7890-e89b-12d3-a456-426614174000',
  'CREDITO',
  1500.00,
  'Pago parcial - transferencia bancaria'
);
```

---

### 3. AJUSTE (Corrección/Interés/Descuento)

**Definición:** Registro de un ajuste sobre el saldo. Puede ser positivo (recargo, interés) o negativo (descuento, corrección).

**Características:**
- **Signo:** Puede ser positivo o negativo (≠ 0)
- **Efecto en saldo:** Suma algebraicamente al saldo
- **Uso típico:**
  - Intereses por mora (positivo)
  - Descuentos por pronto pago (negativo)
  - Corrección de errores (positivo o negativo)
- **Validación:** Monto no puede ser cero

**Ejemplo de Ajuste Positivo (Interés):**
```
Aplicar 10% de interés sobre deuda de $5,000
Movimiento: AJUSTE +$500
Efecto: Saldo aumenta $500
```

**Ejemplo de Ajuste Negativo (Descuento):**
```
Aplicar descuento de $200 por pronto pago
Movimiento: AJUSTE -$200
Efecto: Saldo disminuye $200
```

**Registro en BD (interés):**
```sql
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '456e7890-e89b-12d3-a456-426614174000',
  'AJUSTE',
  500.00,
  'Ajuste recargo del 10% sobre saldo de $5000'
);
```

**Registro en BD (descuento):**
```sql
INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
VALUES (
  '123e4567-e89b-12d3-a456-426614174000',
  '456e7890-e89b-12d3-a456-426614174000',
  'AJUSTE',
  -200.00,
  'Descuento por pronto pago'
);
```

---

## Flujos de Operaciones

### Flujo 1: Registro de Compra (DEBITO)

**Trigger:** Cliente compra un producto a crédito

**Pasos:**
1. **Validación de cliente:**
   - Verificar que el cliente existe en BD
   - Verificar que el cliente está activo (`activo = TRUE`)

2. **Validación de datos:**
   - Validar que el monto sea > 0
   - Sanitizar observaciones (prevenir XSS/SQL injection)

3. **Registro del movimiento:**
   - Crear movimiento tipo DEBITO
   - Incluir `usuario_id` del admin que registra la venta
   - Timestamp automático con `fecha = NOW()`

4. **Actualización de saldo:**
   - Trigger automático refresca vista materializada `saldos_clientes`
   - El saldo del cliente aumenta en el monto del DEBITO

**Datos Requeridos:**
- `cliente_id` (UUID del cliente)
- `monto` (Decimal, > 0)
- `observaciones` (String opcional, descripción del producto)
- `usuario_id` (UUID del usuario que registra, obtenido del JWT)

**Endpoint:** `POST /api/movimientos/compra`

**Body Ejemplo:**
```json
{
  "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
  "monto": 2500.00,
  "observaciones": "Cartera modelo Premium - Color Negro"
}
```

**Respuesta Exitosa (201):**
```json
{
  "id": "789e0123-e89b-12d3-a456-426614174000",
  "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
  "usuario_id": "456e7890-e89b-12d3-a456-426614174000",
  "tipo": "DEBITO",
  "monto": 2500.00,
  "fecha": "2024-01-20T14:30:00.000Z",
  "observaciones": "Cartera modelo Premium - Color Negro"
}
```

**Errores Posibles:**
- `404` - Cliente no encontrado
- `400` - Cliente inactivo
- `400` - Monto inválido (≤ 0)
- `401` - Token JWT inválido

---

### Flujo 2: Registro de Pago (CREDITO)

**Trigger:** Cliente realiza un pago (efectivo, transferencia, etc.)

**Pasos:**
1. **Validación de cliente:**
   - Verificar que el cliente existe
   - Verificar que el cliente está activo

2. **Validación de datos:**
   - Validar que el monto sea > 0
   - Sanitizar observaciones
   - **Nota:** No se valida si el pago excede la deuda (se permite saldo negativo = crédito a favor)

3. **Registro del movimiento:**
   - Crear movimiento tipo CREDITO
   - Incluir `usuario_id` del admin que recibe el pago
   - Timestamp automático

4. **Actualización de saldo:**
   - Trigger automático actualiza vista materializada
   - El saldo del cliente disminuye en el monto del CREDITO

**Datos Requeridos:**
- `cliente_id` (UUID del cliente)
- `monto` (Decimal, > 0)
- `observaciones` (String opcional, método de pago)
- `usuario_id` (UUID del usuario, obtenido del JWT)

**Endpoint:** `POST /api/movimientos/pago`

**Body Ejemplo:**
```json
{
  "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
  "monto": 1500.00,
  "observaciones": "Pago parcial - Transferencia Mercado Pago"
}
```

**Respuesta Exitosa (201):**
```json
{
  "id": "890e1234-e89b-12d3-a456-426614174000",
  "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
  "usuario_id": "456e7890-e89b-12d3-a456-426614174000",
  "tipo": "CREDITO",
  "monto": 1500.00,
  "fecha": "2024-01-22T10:15:00.000Z",
  "observaciones": "Pago parcial - Transferencia Mercado Pago"
}
```

---

### Flujo 3: Aplicación de Ajuste Fijo

**Trigger:** Necesidad de ajustar el saldo por un monto fijo (corrección, descuento, recargo)

**Pasos:**
1. **Validación de cliente:**
   - Verificar que el cliente existe y está activo

2. **Validación de datos:**
   - Validar que el monto sea ≠ 0
   - Monto positivo = recargo
   - Monto negativo = descuento
   - Sanitizar observaciones

3. **Registro del movimiento:**
   - Crear movimiento tipo AJUSTE
   - Incluir observaciones descriptivas automáticas si no se proveen
   - Incluir `usuario_id`

4. **Actualización de saldo:**
   - El saldo se ajusta según el signo del monto

**Datos Requeridos:**
- `cliente_id` (UUID del cliente)
- `monto` (Decimal, ≠ 0, puede ser negativo)
- `observaciones` (String, opcional pero recomendado)
- `usuario_id` (UUID del usuario, obtenido del JWT)

**Endpoint:** `POST /api/movimientos/ajuste`

**Body Ejemplo (Interés):**
```json
{
  "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
  "monto": 500.00,
  "observaciones": "Interés por mora - 30 días"
}
```

**Body Ejemplo (Descuento):**
```json
{
  "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
  "monto": -200.00,
  "observaciones": "Descuento por pronto pago"
}
```

---

### Flujo 4: Aplicación de Ajuste Porcentual

**Trigger:** Aplicar un porcentaje sobre el saldo actual (ejemplo: interés del 10% mensual)

**Pasos:**
1. **Validación de cliente:**
   - Verificar que el cliente existe y está activo

2. **Obtención del saldo actual:**
   - Consultar vista materializada `saldos_clientes`
   - Validar que el saldo sea ≠ 0 (no se puede aplicar % sobre saldo cero)

3. **Cálculo del ajuste:**
   ```
   monto_ajuste = (saldo_actual * porcentaje) / 100
   ```
   - Si porcentaje > 0: recargo (aumenta saldo)
   - Si porcentaje < 0: descuento (disminuye saldo)

4. **Validación adicional:**
   - Validar que el porcentaje sea ≠ 0

5. **Registro del movimiento:**
   - Crear movimiento tipo AJUSTE con el monto calculado
   - Observaciones automáticas incluyen el porcentaje y el saldo base
   - Ejemplo: "Ajuste recargo del 10% sobre saldo de $5000"

6. **Actualización de saldo:**
   - El saldo se ajusta según el monto calculado

**Datos Requeridos:**
- `cliente_id` (UUID del cliente)
- `porcentaje` (Number, ≠ 0, puede ser negativo)
- `observaciones` (String opcional, se generan automáticamente si no se proveen)
- `usuario_id` (UUID del usuario, obtenido del JWT)

**Endpoint:** `POST /api/movimientos/ajuste-porcentual`

**Body Ejemplo (Interés 10%):**
```json
{
  "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
  "porcentaje": 10,
  "observaciones": "Interés mensual por mora"
}
```

**Cálculo Interno:**
```javascript
// Saldo actual del cliente: $5,000
const porcentaje = 10;
const saldoActual = 5000;
const montoAjuste = (saldoActual * porcentaje) / 100; // $500

// Se crea un movimiento AJUSTE por $500
// Observaciones auto: "Ajuste recargo del 10% sobre saldo de $5000"
```

**Respuesta Exitosa (201):**
```json
{
  "id": "901e2345-e89b-12d3-a456-426614174000",
  "cliente_id": "123e4567-e89b-12d3-a456-426614174000",
  "usuario_id": "456e7890-e89b-12d3-a456-426614174000",
  "tipo": "AJUSTE",
  "monto": 500.00,
  "fecha": "2024-01-25T16:00:00.000Z",
  "observaciones": "Ajuste recargo del 10% sobre saldo de $5000"
}
```

---

## Validaciones Implementadas

### Validaciones a Nivel de Servicio (TypeScript)

#### 1. Cliente Debe Existir y Estar Activo
**Ubicación:** `movimientoService.ts` - líneas 36-43

```typescript
const cliente = await ClienteModel.findById(data.cliente_id);
if (!cliente) {
  throw new AppError('Cliente no encontrado', 404);
}
if (!cliente.activo) {
  throw new AppError('No se pueden registrar movimientos para clientes inactivos', 400);
}
```

**Razón:** Prevenir movimientos huérfanos y operaciones sobre clientes eliminados (soft delete).

---

#### 2. Montos de DEBITO y CREDITO Deben Ser Positivos
**Ubicación:** `movimientoService.ts` - líneas 45-51

```typescript
if (data.monto <= 0 && data.tipo !== TipoMovimiento.AJUSTE) {
  throw new AppError('El monto debe ser mayor a 0', 400);
}
```

**Razón:** Por definición, una compra o pago no puede ser de monto cero o negativo. Los ajustes son la excepción.

---

#### 3. Ajustes No Pueden Ser Cero
**Ubicación:** `movimientoService.ts` - líneas 49-51

```typescript
if (data.monto === 0 && data.tipo === TipoMovimiento.AJUSTE) {
  throw new AppError('Los ajustes no pueden ser de monto 0', 400);
}
```

**Razón:** Un ajuste de $0 no tiene sentido operativo y ensuciaría el historial.

---

#### 4. Ajuste Porcentual Requiere Saldo No Cero
**Ubicación:** `movimientoService.ts` - líneas 148-150

```typescript
if (clienteConSaldo.saldo === 0) {
  throw new AppError('No se puede aplicar ajuste porcentual sobre saldo 0', 400);
}
```

**Razón:** Matemáticamente, un porcentaje de cero siempre es cero.

---

#### 5. Sanitización de Observaciones
**Ubicación:** `movimientoService.ts` - líneas 53-57

```typescript
const sanitizedData = {
  ...data,
  observaciones: data.observaciones ? sanitizeString(data.observaciones) : undefined
};
```

**Razón:** Prevenir ataques XSS y SQL injection mediante sanitización de inputs.

---

### Validaciones a Nivel de Base de Datos

#### 1. Constraint de Tipo de Movimiento
**Ubicación:** `001_initial_schema.sql` - líneas 92-93

```sql
CONSTRAINT movimientos_tipo_check
    CHECK (tipo IN ('DEBITO', 'CREDITO', 'AJUSTE'))
```

**Razón:** Garantizar que solo existan los tres tipos válidos a nivel de BD.

---

#### 2. Constraint de Montos Según Tipo
**Ubicación:** `001_initial_schema.sql` - líneas 95-99

```sql
CONSTRAINT movimientos_monto_check
    CHECK (
        (tipo IN ('DEBITO', 'CREDITO') AND monto > 0) OR
        (tipo = 'AJUSTE' AND monto != 0)
    )
```

**Razón:** Validación de última línea de defensa. Asegura integridad incluso si se salta la validación de servicio.

---

#### 3. Foreign Key con RESTRICT
**Ubicación:** `001_initial_schema.sql` - líneas 79-89

```sql
CONSTRAINT movimientos_cliente_id_fkey
    FOREIGN KEY (cliente_id)
    REFERENCES clientes(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

CONSTRAINT movimientos_usuario_id_fkey
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
```

**Razón:**
- **RESTRICT en cliente:** No permitir eliminar clientes con movimientos (protección contable)
- **RESTRICT en usuario:** No permitir eliminar usuarios que registraron movimientos (auditoría)

---

#### 4. Campos Obligatorios (NOT NULL)
**Ubicación:** `001_initial_schema.sql` - líneas 69-74

```sql
cliente_id UUID NOT NULL,
usuario_id UUID NOT NULL,
tipo VARCHAR(10) NOT NULL,
monto DECIMAL(19, 4) NOT NULL,
fecha TIMESTAMPTZ DEFAULT NOW() NOT NULL
```

**Razón:** Garantizar que todo movimiento tenga los datos mínimos necesarios para auditoría.

---

### Validaciones de Lógica de Negocio

#### 1. Usuario Autenticado
**Ubicación:** `movimientoController.ts` - líneas 72, 87, 108, 129, 147

```typescript
const usuarioId = req.usuario!.id;
```

**Razón:** El middleware `authMiddleware` valida el JWT y adjunta `req.usuario`. Si no hay usuario autenticado, el request no llega al controller.

---

#### 2. Límites en Consultas
**Ubicación:** `movimientoService.ts` - líneas 189-191

```typescript
if (limit < 1 || limit > 100) {
  throw new AppError('El límite debe estar entre 1 y 100', 400);
}
```

**Razón:** Prevenir consultas masivas que puedan afectar el rendimiento del servidor.

---

#### 3. Validación de Rangos de Fechas
**Ubicación:** `movimientoService.ts` - líneas 216-218

```typescript
if (fechaInicio > fechaFin) {
  throw new AppError('La fecha de inicio debe ser anterior a la fecha de fin', 400);
}
```

**Razón:** Prevenir consultas con rangos de fechas inválidos.

---

## Casos de Uso Detallados

### Caso 1: Cliente Nuevo Realiza Primera Compra

**Contexto:**
- Cliente: María González (recién registrada)
- Producto: Cartera Premium
- Precio: $5,000
- Saldo inicial: $0

**Operación:**
```http
POST /api/movimientos/compra
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "cliente_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "monto": 5000.00,
  "observaciones": "Cartera Premium - Modelo 2024 - Color Negro"
}
```

**Movimiento Registrado:**
| Campo | Valor |
|-------|-------|
| tipo | DEBITO |
| monto | $5,000.00 |
| fecha | 2024-01-15 09:00:00 |
| usuario_id | admin-001 |
| observaciones | Cartera Premium - Modelo 2024 - Color Negro |

**Cálculo del Saldo:**
```
Saldo Anterior: $0
+ DEBITO: $5,000
= Saldo Nuevo: $5,000 (Cliente debe $5,000)
```

**Estado en Vista Materializada:**
```sql
SELECT * FROM saldos_clientes WHERE cliente_id = 'a1b2c3d4...';

cliente_id     | nombre | apellido  | saldo   | cantidad_movimientos
a1b2c3d4...    | María  | González  | 5000.00 | 1
```

---

### Caso 2: Cliente Paga Parcialmente

**Contexto:**
- Cliente: María González
- Saldo actual: $5,000
- Pago recibido: $3,000 (pago parcial)
- Método: Transferencia

**Operación:**
```http
POST /api/movimientos/pago
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "cliente_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "monto": 3000.00,
  "observaciones": "Pago parcial - Transferencia Mercado Pago"
}
```

**Movimiento Registrado:**
| Campo | Valor |
|-------|-------|
| tipo | CREDITO |
| monto | $3,000.00 |
| fecha | 2024-01-18 10:15:00 |
| usuario_id | admin-001 |
| observaciones | Pago parcial - Transferencia Mercado Pago |

**Cálculo del Saldo:**
```
Saldo Anterior: $5,000
- CREDITO: $3,000
= Saldo Nuevo: $2,000 (Cliente debe $2,000)
```

**Estado en Vista Materializada:**
```sql
SELECT * FROM saldos_clientes WHERE cliente_id = 'a1b2c3d4...';

cliente_id     | saldo   | total_debitos | total_creditos | cantidad_movimientos
a1b2c3d4...    | 2000.00 | 5000.00      | 3000.00        | 2
```

**Historial Completo de Movimientos:**
| Fecha | Tipo | Monto | Saldo Acumulado | Observaciones |
|-------|------|-------|----------------|---------------|
| 2024-01-15 09:00 | DEBITO | +$5,000 | $5,000 | Cartera Premium |
| 2024-01-18 10:15 | CREDITO | -$3,000 | $2,000 | Pago parcial - Transferencia |

---

### Caso 3: Cliente Hace Otra Compra

**Contexto:**
- Cliente: María González
- Saldo actual: $2,000
- Nueva compra: $2,000
- Producto: Mochila

**Operación:**
```http
POST /api/movimientos/compra
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "cliente_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "monto": 2000.00,
  "observaciones": "Mochila Ejecutiva - Color Marrón"
}
```

**Movimiento Registrado:**
| Campo | Valor |
|-------|-------|
| tipo | DEBITO |
| monto | $2,000.00 |
| fecha | 2024-01-20 14:30:00 |
| usuario_id | admin-001 |
| observaciones | Mochila Ejecutiva - Color Marrón |

**Cálculo del Saldo:**
```
Saldo Anterior: $2,000
+ DEBITO: $2,000
= Saldo Nuevo: $4,000 (Cliente debe $4,000)
```

**Historial Completo:**
| Fecha | Tipo | Monto | Saldo Acumulado | Observaciones |
|-------|------|-------|----------------|---------------|
| 2024-01-15 09:00 | DEBITO | +$5,000 | $5,000 | Cartera Premium |
| 2024-01-18 10:15 | CREDITO | -$3,000 | $2,000 | Pago parcial |
| 2024-01-20 14:30 | DEBITO | +$2,000 | $4,000 | Mochila Ejecutiva |

---

### Caso 4: Aplicar Interés por Mora (10%)

**Contexto:**
- Cliente: María González
- Saldo actual: $4,000
- Mora: 45 días sin pagar
- Interés: 10% mensual

**Operación:**
```http
POST /api/movimientos/ajuste-porcentual
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "cliente_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "porcentaje": 10,
  "observaciones": "Interés por mora - 45 días"
}
```

**Cálculo Automático:**
```javascript
Saldo Actual: $4,000
Porcentaje: 10%
Monto Ajuste = (4000 * 10) / 100 = $400
```

**Movimiento Registrado:**
| Campo | Valor |
|-------|-------|
| tipo | AJUSTE |
| monto | $400.00 |
| fecha | 2024-02-05 16:00:00 |
| usuario_id | admin-001 |
| observaciones | Ajuste recargo del 10% sobre saldo de $4000 |

**Cálculo del Saldo:**
```
Saldo Anterior: $4,000
+ AJUSTE: $400
= Saldo Nuevo: $4,400 (Cliente debe $4,400)
```

**Historial Completo:**
| Fecha | Tipo | Monto | Saldo Acumulado | Observaciones |
|-------|------|-------|----------------|---------------|
| 2024-01-15 09:00 | DEBITO | +$5,000 | $5,000 | Cartera Premium |
| 2024-01-18 10:15 | CREDITO | -$3,000 | $2,000 | Pago parcial |
| 2024-01-20 14:30 | DEBITO | +$2,000 | $4,000 | Mochila Ejecutiva |
| 2024-02-05 16:00 | AJUSTE | +$400 | $4,400 | Interés por mora - 45 días |

---

### Caso 5: Aplicar Descuento (Fijo)

**Contexto:**
- Cliente: María González
- Saldo actual: $4,400
- Descuento: $400 (por lealtad o promoción)

**Operación:**
```http
POST /api/movimientos/ajuste
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "cliente_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "monto": -400.00,
  "observaciones": "Descuento por lealtad - Cliente preferencial"
}
```

**Movimiento Registrado:**
| Campo | Valor |
|-------|-------|
| tipo | AJUSTE |
| monto | -$400.00 |
| fecha | 2024-02-06 11:00:00 |
| usuario_id | admin-001 |
| observaciones | Descuento por lealtad - Cliente preferencial |

**Cálculo del Saldo:**
```
Saldo Anterior: $4,400
+ AJUSTE: -$400
= Saldo Nuevo: $4,000 (Cliente debe $4,000)
```

**Nota:** El interés aplicado en el Caso 4 fue "perdonado" con este descuento.

---

### Caso 6: Cliente Paga Todo (Saldo a Cero)

**Contexto:**
- Cliente: María González
- Saldo actual: $4,000
- Pago: $4,000 (pago completo)

**Operación:**
```http
POST /api/movimientos/pago
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "cliente_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "monto": 4000.00,
  "observaciones": "Pago total - Efectivo"
}
```

**Movimiento Registrado:**
| Campo | Valor |
|-------|-------|
| tipo | CREDITO |
| monto | $4,000.00 |
| fecha | 2024-02-10 15:30:00 |
| usuario_id | admin-001 |
| observaciones | Pago total - Efectivo |

**Cálculo del Saldo:**
```
Saldo Anterior: $4,000
- CREDITO: $4,000
= Saldo Nuevo: $0 (Cliente está al día)
```

**Estado Final:**
```sql
SELECT * FROM saldos_clientes WHERE cliente_id = 'a1b2c3d4...';

cliente_id   | saldo | total_debitos | total_creditos | total_ajustes | cantidad_movimientos
a1b2c3d4...  | 0.00  | 7000.00      | 7000.00        | 0.00          | 6
```

**Historial Completo Final:**
| Fecha | Tipo | Monto | Saldo Acumulado | Observaciones |
|-------|------|-------|----------------|---------------|
| 2024-01-15 09:00 | DEBITO | +$5,000 | $5,000 | Cartera Premium |
| 2024-01-18 10:15 | CREDITO | -$3,000 | $2,000 | Pago parcial |
| 2024-01-20 14:30 | DEBITO | +$2,000 | $4,000 | Mochila Ejecutiva |
| 2024-02-05 16:00 | AJUSTE | +$400 | $4,400 | Interés por mora |
| 2024-02-06 11:00 | AJUSTE | -$400 | $4,000 | Descuento por lealtad |
| 2024-02-10 15:30 | CREDITO | -$4,000 | $0 | Pago total |

---

### Caso 7: Cliente Paga de Más (Saldo Negativo)

**Contexto:**
- Cliente: Pedro Martínez
- Saldo actual: $1,000
- Pago: $1,500 (paga de más por anticipado)

**Operación:**
```http
POST /api/movimientos/pago
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "cliente_id": "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
  "monto": 1500.00,
  "observaciones": "Pago anticipado - Transferencia"
}
```

**Movimiento Registrado:**
| Campo | Valor |
|-------|-------|
| tipo | CREDITO |
| monto | $1,500.00 |
| fecha | 2024-02-01 10:00:00 |
| usuario_id | admin-002 |
| observaciones | Pago anticipado - Transferencia |

**Cálculo del Saldo:**
```
Saldo Anterior: $1,000
- CREDITO: $1,500
= Saldo Nuevo: -$500 (Cliente tiene crédito a favor de $500)
```

**Interpretación:**
El cliente tiene $500 a favor que se descontarán automáticamente de sus próximas compras.

**Próxima Compra:**
```
Cliente compra producto de $800

Movimiento: DEBITO +$800
Cálculo:
  Saldo Anterior: -$500 (crédito a favor)
  + DEBITO: $800
  = Saldo Nuevo: $300 (Cliente debe $300)
```

---

### Caso 8: Corregir Error (Eliminar Movimiento)

**Contexto:**
- Se registró un pago de $5,000 por error (debió ser $500)
- Movimiento ID: `error-123-456`

**Precaución:**
La eliminación de movimientos es una operación sensible que afecta la integridad contable. Solo debe usarse para correcciones de errores inmediatos.

**Proceso Recomendado:**

**Opción 1: Eliminar y Recrear (Solo para errores recientes)**
```http
DELETE /api/movimientos/error-123-456
Authorization: Bearer {jwt_token}

# Luego registrar el movimiento correcto
POST /api/movimientos/pago
{
  "cliente_id": "...",
  "monto": 500.00,
  "observaciones": "Pago corregido (eliminado movimiento incorrecto)"
}
```

**Opción 2: Ajuste Compensatorio (Recomendado para errores antiguos)**
```http
# No eliminar, sino crear un AJUSTE compensatorio
POST /api/movimientos/ajuste
{
  "cliente_id": "...",
  "monto": 4500.00,  # Diferencia entre el error y lo correcto
  "observaciones": "Corrección: Pago real fue $500, se registraron $5000 por error"
}
```

**Razón de la Opción 2:**
- Mantiene el historial completo (auditoría)
- Documenta el error y su corrección
- No "reescribe la historia" contable

---

## Integridad y Auditoría

### Principios de Auditoría

#### 1. Registro de Usuario (Quién)
**Implementación:** Campo `usuario_id` obligatorio en cada movimiento

```sql
usuario_id UUID NOT NULL,

CONSTRAINT movimientos_usuario_id_fkey
    FOREIGN KEY (usuario_id)
    REFERENCES usuarios(id)
    ON DELETE RESTRICT
```

**Consulta de Auditoría:**
```sql
-- Ver quién registró cada movimiento de un cliente
SELECT
  m.fecha,
  m.tipo,
  m.monto,
  u.username as registrado_por,
  m.observaciones
FROM movimientos m
INNER JOIN usuarios u ON m.usuario_id = u.id
WHERE m.cliente_id = 'a1b2c3d4...'
ORDER BY m.fecha DESC;
```

**Salida Ejemplo:**
| fecha | tipo | monto | registrado_por | observaciones |
|-------|------|-------|----------------|---------------|
| 2024-02-10 15:30 | CREDITO | $4,000 | admin | Pago total |
| 2024-02-06 11:00 | AJUSTE | -$400 | admin | Descuento |
| 2024-02-05 16:00 | AJUSTE | $400 | admin | Interés por mora |

---

#### 2. Timestamp Automático (Cuándo)
**Implementación:** Campo `fecha` con default `NOW()`

```sql
fecha TIMESTAMPTZ DEFAULT NOW() NOT NULL,
```

**Precisión:** TIMESTAMPTZ incluye zona horaria (UTC)

**Consulta de Auditoría:**
```sql
-- Ver actividad de movimientos en un día específico
SELECT
  m.fecha,
  c.nombre || ' ' || c.apellido as cliente,
  m.tipo,
  m.monto,
  u.username
FROM movimientos m
INNER JOIN clientes c ON m.cliente_id = c.id
INNER JOIN usuarios u ON m.usuario_id = u.id
WHERE DATE(m.fecha) = '2024-02-10'
ORDER BY m.fecha;
```

---

#### 3. Inmutabilidad de Datos (Qué)
**Principio:** Los movimientos no se modifican (excepto observaciones)

**Campos Modificables:**
- `observaciones` (único campo editable, para correcciones menores de texto)

**Campos Inmutables:**
- `tipo`, `monto`, `fecha`, `cliente_id`, `usuario_id`

**Endpoint de Edición:**
```http
PATCH /api/movimientos/{id}/observaciones
Authorization: Bearer {jwt_token}
Content-Type: application/json

{
  "observaciones": "Texto corregido"
}
```

**Limitación:** No se registra el historial de cambios de observaciones (mejora futura).

---

#### 4. Trazabilidad Completa (Por Qué)
**Implementación:** Campo `observaciones` para contexto

```sql
observaciones TEXT,
```

**Mejores Prácticas:**
- DEBITO: Incluir descripción del producto vendido
- CREDITO: Incluir método de pago (efectivo, transferencia, etc.)
- AJUSTE: Incluir razón del ajuste (interés, descuento, corrección)

**Ejemplo de Buenas Observaciones:**
```
"Cartera Premium - Modelo 2024 - Color Negro - Venta presencial"
"Pago parcial $3,000 - Transferencia Mercado Pago - Comprobante #12345"
"Interés 10% por mora - 45 días sin pagar - Notificado por WhatsApp"
"Descuento por lealtad - Cliente frecuente - Autorizado por gerencia"
```

---

### Vista Materializada y Consistencia

#### Actualización Automática
**Trigger:** `trigger_refresh_saldos`

```sql
CREATE TRIGGER trigger_refresh_saldos
AFTER INSERT OR UPDATE OR DELETE ON movimientos
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_saldos_clientes();
```

**Comportamiento:**
- Se ejecuta DESPUÉS de cualquier cambio en `movimientos`
- Refresh es CONCURRENT (no bloquea lecturas)
- Garantiza que los saldos estén siempre actualizados

---

#### Validación de Consistencia

**Query de Validación:**
```sql
-- Comparar saldo calculado vs saldo en vista materializada
WITH saldo_real AS (
  SELECT
    cliente_id,
    COALESCE(SUM(CASE WHEN tipo = 'DEBITO' THEN monto ELSE 0 END), 0) -
    COALESCE(SUM(CASE WHEN tipo = 'CREDITO' THEN monto ELSE 0 END), 0) +
    COALESCE(SUM(CASE WHEN tipo = 'AJUSTE' THEN monto ELSE 0 END), 0) AS saldo_calculado
  FROM movimientos
  GROUP BY cliente_id
)
SELECT
  sc.cliente_id,
  sc.nombre,
  sc.apellido,
  sc.saldo AS saldo_vista,
  sr.saldo_calculado,
  (sc.saldo - sr.saldo_calculado) AS diferencia
FROM saldos_clientes sc
LEFT JOIN saldo_real sr ON sc.cliente_id = sr.cliente_id
WHERE ABS(sc.saldo - COALESCE(sr.saldo_calculado, 0)) > 0.01;
```

**Resultado Esperado:** Sin filas (diferencia = 0 para todos los clientes)

---

#### Reconstrucción Manual (Si es Necesario)

```sql
-- Refrescar manualmente la vista materializada
REFRESH MATERIALIZED VIEW CONCURRENTLY saldos_clientes;
```

**Uso:** Solo en caso de mantenimiento o inconsistencias detectadas.

---

### Soft Delete de Clientes

**Principio:** NUNCA eliminar registros de clientes que tienen movimientos

**Implementación:**
```sql
-- Desactivar cliente (soft delete)
UPDATE clientes SET activo = FALSE WHERE id = '...';
```

**Restricción en BD:**
```sql
CONSTRAINT movimientos_cliente_id_fkey
    FOREIGN KEY (cliente_id)
    REFERENCES clientes(id)
    ON DELETE RESTRICT  -- Impide eliminación física
```

**Consulta de Clientes Inactivos con Historial:**
```sql
SELECT
  c.id,
  c.nombre,
  c.apellido,
  c.activo,
  sc.saldo,
  sc.cantidad_movimientos
FROM clientes c
INNER JOIN saldos_clientes sc ON c.id = sc.cliente_id
WHERE c.activo = FALSE;
```

---

## Arquitectura de Base de Datos

### Diagrama de Relaciones

```
usuarios
    ├─ id (PK)
    ├─ username
    ├─ password_hash
    └─ rol
         ↓ (usuario_id FK - RESTRICT)
movimientos
    ├─ id (PK)
    ├─ cliente_id (FK → clientes.id - RESTRICT)
    ├─ usuario_id (FK → usuarios.id - RESTRICT)
    ├─ tipo (DEBITO/CREDITO/AJUSTE)
    ├─ monto (DECIMAL)
    ├─ fecha (TIMESTAMPTZ)
    └─ observaciones (TEXT)
         ↓ (cliente_id FK - RESTRICT)
clientes
    ├─ id (PK)
    ├─ nombre
    ├─ apellido
    ├─ telefono (UNIQUE)
    └─ activo (BOOLEAN)
         ↓ (LEFT JOIN)
saldos_clientes (MATERIALIZED VIEW)
    ├─ cliente_id (PK)
    ├─ nombre
    ├─ apellido
    ├─ telefono
    ├─ activo
    ├─ saldo (calculado)
    ├─ total_debitos
    ├─ total_creditos
    ├─ total_ajustes
    └─ ultima_operacion
```

---

### Índices para Performance

**Tabla: movimientos**
```sql
CREATE INDEX idx_movimientos_cliente_id ON movimientos(cliente_id);
CREATE INDEX idx_movimientos_usuario_id ON movimientos(usuario_id);
CREATE INDEX idx_movimientos_fecha ON movimientos(fecha DESC);
CREATE INDEX idx_movimientos_tipo ON movimientos(tipo);
CREATE INDEX idx_movimientos_cliente_fecha ON movimientos(cliente_id, fecha DESC);
```

**Propósito:**
- `idx_movimientos_cliente_id`: Consultas de historial por cliente (frecuente)
- `idx_movimientos_fecha DESC`: Consultas de movimientos recientes
- `idx_movimientos_cliente_fecha`: Índice compuesto para historial ordenado

**Vista Materializada: saldos_clientes**
```sql
CREATE UNIQUE INDEX idx_saldos_clientes_id ON saldos_clientes(cliente_id);
CREATE INDEX idx_saldos_clientes_saldo ON saldos_clientes(saldo DESC);
CREATE INDEX idx_saldos_clientes_activo_saldo ON saldos_clientes(activo, saldo DESC) WHERE activo = TRUE;
```

**Propósito:**
- `idx_saldos_clientes_id`: Búsqueda rápida por cliente
- `idx_saldos_clientes_saldo DESC`: Ranking de clientes con mayor deuda
- Índice parcial (`WHERE activo = TRUE`): Optimización para clientes activos

---

## Ejemplos de Cálculo

### Ejemplo Completo: Historial de 6 Meses

**Cliente:** Ana López
**Periodo:** Enero - Junio 2024

| Fecha | Tipo | Monto | Saldo Acumulado | Observaciones |
|-------|------|-------|----------------|---------------|
| 2024-01-05 | DEBITO | +$3,000 | $3,000 | Cartera Modelo A |
| 2024-01-15 | CREDITO | -$1,000 | $2,000 | Pago parcial - Efectivo |
| 2024-02-10 | DEBITO | +$2,500 | $4,500 | Mochila Ejecutiva |
| 2024-03-01 | AJUSTE | +$450 | $4,950 | Interés 10% por mora |
| 2024-03-15 | CREDITO | -$2,000 | $2,950 | Pago - Transferencia |
| 2024-04-20 | DEBITO | +$1,500 | $4,450 | Billetera Premium |
| 2024-05-10 | AJUSTE | -$450 | $4,000 | Descuento por lealtad |
| 2024-06-01 | CREDITO | -$4,000 | $0 | Pago total - Efectivo |

**Cálculo Final:**
```
Total DEBITOS:  $3,000 + $2,500 + $1,500 = $7,000
Total CREDITOS: $1,000 + $2,000 + $4,000 = $7,000
Total AJUSTES:  $450 + (-$450) = $0

Saldo = 7,000 - 7,000 + 0 = $0
```

**Validación en BD:**
```sql
SELECT * FROM saldos_clientes WHERE cliente_id = 'ana-lopez-id';

-- Resultado:
-- saldo: 0.00
-- total_debitos: 7000.00
-- total_creditos: 7000.00
-- total_ajustes: 0.00
-- cantidad_movimientos: 8
```

---

### Ejemplo: Ajuste Porcentual Complejo

**Escenario:**
- Saldo actual: $8,750
- Aplicar descuento del 12% por pronto pago

**Cálculo:**
```javascript
const saldoActual = 8750;
const porcentaje = -12; // Negativo para descuento
const montoAjuste = (saldoActual * porcentaje) / 100;
// montoAjuste = (8750 * -12) / 100 = -1050

Saldo Nuevo = 8750 + (-1050) = $7,700
```

**Movimiento Generado:**
```json
{
  "tipo": "AJUSTE",
  "monto": -1050.00,
  "observaciones": "Ajuste descuento del 12% sobre saldo de $8750"
}
```

---

## Conclusiones y Recomendaciones

### Fortalezas del Sistema

1. **Trazabilidad completa:** Cada operación está documentada
2. **Validaciones multicapa:** Servicio + Base de datos
3. **Performance optimizado:** Vista materializada + índices
4. **Auditoría básica:** usuario_id en cada movimiento
5. **Preservación de historial:** Soft delete + RESTRICT FKs

---

### Recomendaciones de Mejora

#### 1. Auditoría de Eliminaciones
**Problema:** No se registra quién elimina movimientos ni por qué

**Solución Propuesta:** Crear tabla `movimientos_eliminados`
```sql
CREATE TABLE movimientos_eliminados (
    id UUID PRIMARY KEY,
    movimiento_id UUID NOT NULL,
    cliente_id UUID NOT NULL,
    usuario_id UUID NOT NULL,
    tipo VARCHAR(10) NOT NULL,
    monto DECIMAL(19, 4) NOT NULL,
    fecha_original TIMESTAMPTZ NOT NULL,
    observaciones_original TEXT,
    eliminado_por UUID NOT NULL REFERENCES usuarios(id),
    fecha_eliminacion TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    motivo_eliminacion TEXT NOT NULL
);
```

**Uso:**
```javascript
// Antes de eliminar, guardar en tabla de auditoría
await MovimientoModel.createEliminacionRecord(movimientoId, usuarioId, motivo);
await MovimientoModel.delete(movimientoId);
```

---

#### 2. Historial de Cambios en Observaciones
**Problema:** Las modificaciones de observaciones no se registran

**Solución Propuesta:** Tabla `movimientos_observaciones_historial`
```sql
CREATE TABLE movimientos_observaciones_historial (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    movimiento_id UUID NOT NULL REFERENCES movimientos(id),
    observaciones_anterior TEXT,
    observaciones_nueva TEXT,
    modificado_por UUID NOT NULL REFERENCES usuarios(id),
    fecha_modificacion TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
```

---

#### 3. Transacciones Explícitas
**Problema:** Operaciones complejas no están envueltas en transacciones

**Solución Propuesta:**
```typescript
// Ejemplo: Aplicar interés a múltiples clientes
static async aplicarInteresMasivo(clientesIds: string[], porcentaje: number, usuarioId: string) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    for (const clienteId of clientesIds) {
      await this.aplicarAjustePorcentual(clienteId, porcentaje, usuarioId);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
```

---

#### 4. Validación de Saldo Negativo
**Decisión de Negocio:** ¿Se permite que clientes paguen de más (saldo negativo)?

**Opciones:**
- **A)** Permitir (implementación actual): Cliente puede tener crédito a favor
- **B)** Bloquear: No permitir pagos mayores a la deuda

Si se elige **B**, agregar validación:
```typescript
// En movimientoService.ts - registrarPago()
const clienteConSaldo = await ClienteModel.findByIdWithSaldo(clienteId);
if (monto > clienteConSaldo.saldo) {
  throw new AppError('El pago no puede ser mayor a la deuda', 400);
}
```

---

#### 5. Logs de Auditoría Centralizados
**Mejora:** Tabla `audit_log` para registrar todas las operaciones

```sql
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entidad VARCHAR(50) NOT NULL, -- 'movimiento', 'cliente', 'usuario'
    entidad_id UUID NOT NULL,
    operacion VARCHAR(20) NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    usuario_id UUID NOT NULL REFERENCES usuarios(id),
    fecha TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    ip_address INET,
    user_agent TEXT,
    datos_anteriores JSONB,
    datos_nuevos JSONB
);
```

---

## Glosario de Términos

- **DEBITO:** Compra a crédito del cliente (aumenta deuda)
- **CREDITO:** Pago del cliente (reduce deuda)
- **AJUSTE:** Corrección, interés o descuento (modifica saldo)
- **Saldo Positivo:** Cliente debe dinero al negocio
- **Saldo Negativo:** Cliente tiene crédito a favor
- **Soft Delete:** Desactivación lógica sin eliminar registros físicos
- **Vista Materializada:** Consulta precalculada y almacenada para performance
- **Auditoría:** Registro de quién, cuándo y qué modificó en el sistema
- **RESTRICT (FK):** Constraint que impide eliminar registros referenciados

---

**Versión:** 1.0
**Fecha:** 2024-02-04
**Autor:** Sistema de Auditoría Contable María Bags
