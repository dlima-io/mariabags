# Guía de Uso - Módulo de Historial de Movimientos

## Inicio Rápido

### 1. Acceder al Historial de un Cliente

Hay dos formas de acceder al historial:

**Opción A: Desde la lista de clientes**
```
1. Ir a /clientes
2. Hacer click en cualquier card de cliente
3. Se abrirá automáticamente el historial en /clientes/:id
```

**Opción B: URL directa**
```
Navegar directamente a: /clientes/[UUID-del-cliente]
```

### 2. Visualizar el Historial

Al entrar a la página de historial, verás:

```
┌────────────────────────────────────────────────┐
│ [← Volver]                                     │
│                                                │
│ ┌────────────────────────────────────────────┐ │
│ │ SALDO ACTUAL                               │ │
│ │ Cliente: María González                    │ │
│ │ $4,000.00                                  │ │
│ │ [+ Registrar Movimiento]                   │ │
│ └────────────────────────────────────────────┘ │
│                                                │
│ [Todos] [Compras] [Pagos] [Ajustes]          │
│                                                │
│ [Movimiento 1]                                 │
│ [Movimiento 2]                                 │
│ [Movimiento 3]                                 │
│                                                │
└────────────────────────────────────────────────┘
```

### 3. Registrar un Movimiento

**Paso 1: Abrir el formulario**
- Click en el botón "+ Registrar Movimiento" en la SaldoCard

**Paso 2: Completar el formulario**

```
┌────────────────────────────────────────────────┐
│ Registrar Movimiento                     [X]   │
│ ──────────────────────────────────────────────│
│                                                │
│ Tipo de Movimiento:                            │
│ [Compra] [Pago] [Ajuste]                      │
│                                                │
│ Monto: *                                       │
│ $ [____]                                       │
│                                                │
│ Observaciones (opcional):                      │
│ [_________________________________]            │
│                                                │
│ [Cancelar]          [Registrar]               │
└────────────────────────────────────────────────┘
```

**Paso 3: Seleccionar tipo**
- **Compra**: Para registrar una deuda (aumenta el saldo)
- **Pago**: Para registrar un pago (reduce el saldo)
- **Ajuste**: Para correcciones (puede ser + o -)

**Paso 4: Ingresar monto**
- Solo números positivos para Compra/Pago
- Números negativos permitidos para Ajuste
- Máximo: $99,999,999.99
- No puede ser cero

**Paso 5: Agregar observaciones (opcional)**
- Descripción del producto o servicio
- Máximo 500 caracteres
- Ejemplo: "Cartera modelo premium, color negro"

**Paso 6: Confirmar**
- Click en "Registrar"
- Si el monto es > $10,000, aparecerá una confirmación
- Al confirmar, el movimiento se crea y la lista se actualiza

### 4. Filtrar Movimientos

Usa los botones de filtro para ver solo ciertos tipos:

- **Todos**: Muestra todos los movimientos
- **Compras**: Solo débitos (compras)
- **Pagos**: Solo créditos (pagos)
- **Ajustes**: Solo ajustes

Cada botón muestra el contador de movimientos de ese tipo.

### 5. Interpretar el Saldo

**Saldo Positivo (Rojo)**
```
Cliente debe: $4,000.00
```
El cliente tiene deuda pendiente.

**Saldo Cero (Verde)**
```
Cliente está al día: $0.00
```
No hay deuda ni crédito.

**Saldo Negativo (Azul)**
```
Cliente tiene a favor: $500.00
```
El cliente tiene un saldo a favor (pagó de más).

### 6. Leer un Movimiento

Cada movimiento muestra:

```
┌────────────────────────────────────────────────┐
│ 📅 20/01/2024 14:30                            │
│                                                │
│ [COMPRA]  Cartera Premium                     │
│ + $2,000.00                    Saldo: $4,000  │
│                                                │
│ Por: admin                                     │
└────────────────────────────────────────────────┘
```

**Elementos:**
- **Fecha y hora**: Cuándo se registró
- **Badge**: Tipo de movimiento (COMPRA/PAGO/AJUSTE)
- **Observaciones**: Descripción del producto/servicio
- **Monto**: Cantidad con signo (+ aumenta, - reduce)
- **Saldo**: Saldo acumulado después de este movimiento
- **Usuario**: Quién registró el movimiento (auditoría)

## Conceptos Importantes

### Tipos de Movimiento

#### COMPRA (DEBITO)
- **Color**: Rojo
- **Signo**: + (positivo)
- **Efecto**: Aumenta la deuda
- **Ejemplo**: Cliente compra una cartera de $2,000
- **Resultado**: Saldo aumenta en $2,000

#### PAGO (CREDITO)
- **Color**: Verde
- **Signo**: - (negativo)
- **Efecto**: Reduce la deuda
- **Ejemplo**: Cliente paga $1,500
- **Resultado**: Saldo disminuye en $1,500

#### AJUSTE
- **Color**: Azul (positivo) / Naranja (negativo)
- **Signo**: + o -
- **Efecto**: Ajusta el saldo
- **Ejemplos**:
  - Recargo por mora: +$400 (aumenta deuda)
  - Descuento: -$200 (reduce deuda)

### Cálculo del Saldo

```
Saldo Actual = COMPRAS - PAGOS + AJUSTES

Ejemplo:
- Compras: $10,000
- Pagos: $6,000
- Ajustes: +$400
- Saldo: $10,000 - $6,000 + $400 = $4,400
```

### Saldo Acumulado

En cada movimiento se muestra el saldo acumulado hasta ese momento:

```
Inicial: $0

1. Compra $2,000  → Saldo: $2,000
2. Compra $1,500  → Saldo: $3,500
3. Pago $1,000    → Saldo: $2,500
4. Ajuste +$500   → Saldo: $3,000
```

## Atajos de Teclado

- **ESC**: Cerrar modal de registro
- **Tab**: Navegar entre campos del formulario
- **Enter**: Enviar formulario (cuando está enfocado en un botón)

## Estados y Mensajes

### Loading
```
[Spinner animado]
Cargando movimientos...
```

### Empty State
```
[Icono de documento]
No hay movimientos registrados
Aún no se han registrado compras, pagos o ajustes para este cliente.
[Registrar primer movimiento]
```

### Éxito
```
✓ Movimiento registrado exitosamente
```

### Error
```
✗ Error al registrar movimiento
✗ El monto debe ser un número válido
✗ Error al cargar datos
```

### Confirmación (Montos grandes)
```
¿Confirmar movimiento de $15,000.00?
[Cancelar] [Aceptar]
```

## Validaciones del Formulario

| Campo | Validación | Mensaje de Error |
|-------|-----------|------------------|
| Tipo | Requerido | - |
| Monto | Requerido | "El monto debe ser un número válido" |
| Monto | > 0 | "El monto no puede ser cero" |
| Monto | < 99,999,999.99 | "El monto es demasiado grande" |
| Monto (Compra/Pago) | Positivo | "El monto no puede ser negativo para compras y pagos" |
| Observaciones | <= 500 chars | "Las observaciones no pueden superar los 500 caracteres" |

## Comportamiento Responsive

### Mobile (< 768px)
- Filtros en scroll horizontal
- Lista full width
- Modal full screen
- Touch targets de 44px mínimo

### Tablet (768px - 1024px)
- Filtros en wrap
- Modal centrado con max-width
- Mejor aprovechamiento del espacio

### Desktop (> 1024px)
- Vista optimizada
- Modal centrado
- Todos los filtros visibles

## Performance

### Optimizaciones Aplicadas
- React.memo en MovimientoItem
- Lazy loading de la página
- Carga paralela de datos
- Memoización de filtros
- AnimatePresence para animaciones eficientes

### Límites Recomendados
- Hasta 100 movimientos: Rendimiento óptimo
- 100-500 movimientos: Buen rendimiento
- > 500 movimientos: Considerar paginación o virtualización

## Troubleshooting

### El historial no carga
**Problema**: Pantalla de loading infinita
**Solución**:
1. Verificar que el backend esté corriendo
2. Verificar que el cliente existe
3. Revisar la consola del navegador para errores
4. Verificar el token JWT en localStorage

### No se puede registrar un movimiento
**Problema**: El botón "Registrar" está deshabilitado
**Solución**:
1. Verificar que el monto sea válido (> 0)
2. Verificar que no supere el máximo
3. Verificar que las observaciones no superen 500 caracteres

### El saldo no se actualiza
**Problema**: El saldo sigue igual después de registrar
**Solución**:
1. Refrescar la página manualmente
2. Verificar que el movimiento se haya creado en el backend
3. Click en el botón "Actualizar" al final de la lista

### Los filtros no funcionan
**Problema**: Al seleccionar un filtro, no se filtran los movimientos
**Solución**:
1. Verificar que haya movimientos de ese tipo
2. Revisar el contador en el botón del filtro
3. Si muestra 0, no hay movimientos de ese tipo

## Integración con Backend

### Endpoints Requeridos

```
GET  /api/clientes/:id
     → Retorna: { id, nombre, apellido, telefono, saldo, ultima_operacion, ... }

GET  /api/movimientos/cliente/:id
     → Retorna: [{ id, tipo, monto, fecha, observaciones, usuario: { username }, ... }]

POST /api/movimientos/compra
     → Body: { cliente_id, monto, observaciones? }
     → Retorna: Movimiento creado

POST /api/movimientos/pago
     → Body: { cliente_id, monto, observaciones? }
     → Retorna: Movimiento creado

POST /api/movimientos/ajuste
     → Body: { cliente_id, monto, observaciones?, porcentaje? }
     → Retorna: Movimiento creado
```

### Headers Automáticos

Todas las peticiones incluyen:
```
Authorization: Bearer [JWT_TOKEN]
Content-Type: application/json
```

### Manejo de Errores

```javascript
try {
  // Petición
} catch (error) {
  // 401: Redirige a /login
  // 404: Muestra mensaje de error
  // 500: Toast de error
}
```

## Extensiones Futuras

Funcionalidades que se pueden agregar:

1. **Exportar a PDF**: Descargar historial completo
2. **Búsqueda**: Buscar en observaciones
3. **Filtros avanzados**: Por rango de fechas
4. **Editar movimiento**: Modificar monto u observaciones
5. **Eliminar movimiento**: Soft delete con confirmación
6. **Gráficos**: Visualización de estadísticas
7. **Paginación**: Para listas muy largas
8. **Comentarios**: Agregar notas a movimientos
9. **Adjuntos**: Subir comprobantes
10. **Notificaciones**: Push para recordatorios

## Soporte

Para problemas o preguntas:
1. Revisar la documentación completa en `DISEÑO_HISTORIAL_MOVIMIENTOS.md`
2. Revisar la implementación en `IMPLEMENTACION_HISTORIAL_MOVIMIENTOS.md`
3. Verificar el código en `frontend/src/components/`

---

**Última actualización**: 2026-02-04
**Versión**: 1.0.0
