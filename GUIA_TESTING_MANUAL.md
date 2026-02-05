# Guía de Testing Manual - María Bags

## Estado del Proyecto
✅ Backend: 32 archivos, 33 endpoints REST
✅ Frontend: 46 archivos, 33 componentes React
✅ Dependencias instaladas correctamente
✅ Archivos .env creados

---

## 📋 Pre-requisitos

### 1. PostgreSQL
- **Versión detectada**: PostgreSQL 18.1 ✅
- **Usuario**: postgres
- **Password**: Configurar en `backend/.env` (actualmente: `postgres`)

---

## 🚀 Pasos de Testing

### PASO 1: Configurar Base de Datos

```bash
# 1.1. Crear base de datos
psql -U postgres
CREATE DATABASE mariabags;
\q

# 1.2. Ejecutar migración (crear tablas)
psql -U postgres -d mariabags -f backend/src/db/migrations/001_initial_schema.sql

# 1.3. Cargar datos de prueba
psql -U postgres -d mariabags -f backend/src/db/seeds/001_initial_data.sql
```

**Datos de prueba incluidos:**
- 2 usuarios admin (admin/admin123, maria/maria123)
- 5 clientes con movimientos
- Saldos variados para testing

---

### PASO 2: Iniciar Backend

```bash
cd backend
npm run dev
```

**✅ Éxito esperado:**
```
[nodemon] starting `ts-node src/server.ts`
✅ Conectado a PostgreSQL
🚀 Servidor corriendo en http://localhost:3000
```

**❌ Errores posibles:**

| Error | Solución |
|-------|----------|
| `Error: connect ECONNREFUSED` | PostgreSQL no está corriendo. Iniciar servicio |
| `password authentication failed` | Verificar DB_PASSWORD en backend/.env |
| `database "mariabags" does not exist` | Ejecutar PASO 1.1 |
| `relation "usuarios" does not exist` | Ejecutar PASO 1.2 |

---

### PASO 3: Iniciar Frontend

```bash
# En nueva terminal
cd frontend
npm run dev
```

**✅ Éxito esperado:**
```
VITE v5.0.11  ready in 450 ms
➜  Local:   http://localhost:5173/
```

---

### PASO 4: Testing del Login

1. **Abrir navegador**: http://localhost:5173
2. **Credenciales de prueba**:
   - Usuario: `admin`
   - Password: `admin123`

**✅ Éxito esperado:**
- Animación de entrada del formulario
- Al hacer login: redirección al Dashboard
- Token JWT guardado en localStorage

**Verificar en DevTools (F12):**
```javascript
// Application > Local Storage > http://localhost:5173
localStorage.getItem('token')  // Debe existir
localStorage.getItem('user')   // {"username":"admin", ...}
```

**❌ Errores posibles:**

| Error | Causa | Solución |
|-------|-------|----------|
| `Network Error` | Backend no responde | Verificar que backend esté corriendo en :3000 |
| `401 Unauthorized` | Credenciales incorrectas | Verificar que se ejecutó PASO 1.3 (seed) |
| `CORS Error` | Configuración CORS | Verificar CORS_ORIGIN en backend/.env = http://localhost:5173 |

---

### PASO 5: Testing de Clientes

#### 5.1. Navegar a Clientes
- Click en botón "Clientes" en el Dashboard o navegar a `/clientes`

**✅ Éxito esperado:**
- Lista de 5 clientes de prueba
- Cards con nombres, teléfonos, saldos
- Badges de color según saldo (rojo=deuda, verde=a favor)
- Botones WhatsApp funcionando

#### 5.2. Buscar Cliente
- Escribir "ana" en barra de búsqueda

**✅ Éxito esperado:**
- Debounce de 300ms
- Filtrado en tiempo real
- Mostrar solo "Ana Martínez"

#### 5.3. Crear Nuevo Cliente
1. Click en botón "Agregar Cliente" (+)
2. Completar formulario:
   - Nombre: Juan
   - Apellido: Pérez
   - Teléfono: 3512222222

**✅ Éxito esperado:**
- Modal con animación
- Validación de campos
- Toast de éxito "Cliente creado"
- Cliente aparece en lista
- Saldo inicial: $0.00

**❌ Errores a probar:**
- Teléfono duplicado → Toast error "El teléfono ya está registrado"
- Campos vacíos → Mensajes de validación

#### 5.4. Eliminar Cliente (Soft Delete)
1. Click en ícono de basura en cualquier cliente
2. Confirmar eliminación

**✅ Éxito esperado:**
- Toast "Cliente eliminado"
- Cliente desaparece de la lista
- **VERIFICAR EN DB**: Campo `activo = false` (NO se borra físicamente)

```sql
SELECT id, nombre, apellido, activo FROM clientes;
-- El cliente eliminado debe tener activo=false
```

#### 5.5. WhatsApp Integration
1. Click en ícono de WhatsApp en cualquier cliente

**✅ Éxito esperado:**
- Abre WhatsApp Web/App
- Número precargado
- Mensaje: "Hola! Te contacto desde María Bags"

---

### PASO 6: Testing de Movimientos

#### 6.1. Ver Historial de Cliente
1. Click en cualquier ClienteCard (ej: Ana Martínez)

**✅ Éxito esperado:**
- Redirección a `/clientes/:id`
- Header con datos del cliente
- Card de saldo actualizado
- Lista de movimientos ordenados por fecha DESC
- Badges de color:
  - 🔴 COMPRA (rojo)
  - 🟢 PAGO (verde)
  - 🔵 AJUSTE (azul)

#### 6.2. Registrar Compra
1. Click en botón "Registrar Compra"
2. Completar:
   - Monto: 5000
   - Observaciones: "Cartera modelo XYZ"
3. Enviar

**✅ Éxito esperado:**
- Toast "Compra registrada"
- Movimiento aparece en lista
- **Saldo aumenta** en +$5000
- Badge rojo "COMPRA"
- Usuario que lo cargó visible

#### 6.3. Registrar Pago
1. Click en botón "Registrar Pago"
2. Completar:
   - Monto: 2000
   - Observaciones: "Pago parcial"
3. Enviar

**✅ Éxito esperado:**
- Toast "Pago registrado"
- Movimiento aparece en lista
- **Saldo disminuye** en -$2000
- Badge verde "PAGO"

#### 6.4. Verificar Cálculo de Saldo

**Fórmula correcta:**
```
Saldo = DÉBITOS - CRÉDITOS + AJUSTES
Saldo = COMPRAS - PAGOS + AJUSTES
```

**Ejemplo con Ana Martínez:**
```
Compras:  $15,000 (DEBITO)
Pagos:    -$8,000 (CREDITO)
Ajustes:      $500 (AJUSTE)
----------------------------
Saldo:     $7,500  ✅
```

**Verificar en vista materializada:**
```sql
SELECT * FROM saldos_clientes WHERE nombre = 'Ana';
-- total_debitos, total_creditos, total_ajustes, saldo
```

#### 6.5. Filtrado por Tipo
1. Click en "Todos" → Seleccionar "Solo Compras"

**✅ Éxito esperado:**
- Solo movimientos tipo DEBITO visibles
- Saldo no cambia (es total)

---

### PASO 7: Testing de Seguridad

#### 7.1. Rate Limiting
```bash
# Intentar login 6 veces con password incorrecta
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"wrong"}' \
  -w "\n%{http_code}\n"
```

**✅ Éxito esperado:**
- Primeros 5 intentos: 401 Unauthorized
- Sexto intento: **429 Too Many Requests**
- Mensaje: "Demasiados intentos"

#### 7.2. JWT Expiración
1. Login exitoso
2. Cambiar en backend/.env: `JWT_EXPIRES_IN=10s`
3. Reiniciar backend
4. Login nuevamente
5. Esperar 15 segundos
6. Intentar crear cliente

**✅ Éxito esperado:**
- 401 Unauthorized
- Redirect automático a /login
- Toast "Sesión expirada"

#### 7.3. XSS Prevention
Intentar crear cliente con script:
```
Nombre: <script>alert('XSS')</script>
```

**✅ Éxito esperado:**
- Guardado como texto plano (escapado)
- No se ejecuta script
- Renderizado: `&lt;script&gt;alert('XSS')&lt;/script&gt;`

---

### PASO 8: Testing Responsive

#### 8.1. Mobile (375px)
- Abrir DevTools (F12) → Toggle device toolbar
- Seleccionar iPhone SE o custom 375x667

**✅ Éxito esperado:**
- Grid de clientes: 1 columna
- Botones touch-friendly (≥44px)
- Formularios adaptados
- Safe area padding en bottom
- Tabs de navegación inferior visibles

#### 8.2. Tablet (768px)
- Cambiar a iPad o custom 768x1024

**✅ Éxito esperado:**
- Grid de clientes: 2 columnas
- Formularios centrados

#### 8.3. Desktop (1280px)
- Cambiar a Desktop

**✅ Éxito esperado:**
- Grid de clientes: 3 columnas
- Layout optimizado

---

## 🐛 Checklist de Bugs Comunes

Marcar si se encuentran bugs:

- [ ] Login no redirecciona
- [ ] Saldo calculado incorrectamente
- [ ] Movimientos no se actualizan en tiempo real
- [ ] WhatsApp no abre con número correcto
- [ ] Búsqueda no filtra
- [ ] Modal no cierra
- [ ] Toast no aparece
- [ ] Rate limiting no funciona
- [ ] Soft delete elimina físicamente
- [ ] CORS error en producción
- [ ] JWT no se guarda en localStorage
- [ ] Animaciones se ven mal en mobile

---

## 📊 Resultados Esperados

### Backend Health Check
```bash
curl http://localhost:3000/health
```
**Respuesta:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "uptime": 45.234
}
```

### Endpoints Funcionales (33 total)
```
✅ POST   /api/auth/login
✅ POST   /api/auth/refresh
✅ GET    /api/clientes
✅ GET    /api/clientes/:id
✅ POST   /api/clientes
✅ PUT    /api/clientes/:id
✅ DELETE /api/clientes/:id
✅ GET    /api/movimientos/cliente/:clienteId
✅ POST   /api/movimientos
✅ POST   /api/movimientos/compra
✅ POST   /api/movimientos/pago
✅ POST   /api/movimientos/ajuste
... (y más)
```

---

## 🎯 Métricas de Éxito

| Métrica | Objetivo | Estado |
|---------|----------|--------|
| Tiempo de carga inicial | < 1s | ⏱️ |
| Tiempo de login | < 500ms | ⏱️ |
| Búsqueda de clientes | < 300ms | ⏱️ |
| Registro de movimiento | < 400ms | ⏱️ |
| Rate limiting activo | 5 intentos/15min | ⏱️ |
| Responsive funcional | 375px - 1920px | ⏱️ |

---

## 📝 Reporte de Testing

Completar después del testing:

**Fecha**: ___________
**Tester**: ___________
**Versión**: 1.0.0

**Resultados:**
- Pasos completados: __ / 8
- Bugs encontrados: __
- Severidad crítica: __
- Severidad media: __
- Severidad baja: __

**Bugs Encontrados:**
1.
2.
3.

**Conclusión:**
[ ] ✅ Aprobado para producción
[ ] ⚠️ Requiere correcciones menores
[ ] ❌ Requiere correcciones críticas

---

## 🔧 Troubleshooting Rápido

**Backend no inicia:**
```bash
# Verificar puerto ocupado
netstat -ano | findstr :3000

# Matar proceso si es necesario
taskkill /PID <PID> /F

# Reiniciar
cd backend && npm run dev
```

**Frontend no compila:**
```bash
# Limpiar cache
rm -rf node_modules .vite
npm install
npm run dev
```

**PostgreSQL no conecta:**
```bash
# Verificar servicio (Windows)
services.msc # Buscar "postgresql"

# Verificar puerto
psql -U postgres -c "SHOW port;"
```

---

## 📞 Soporte

Si encuentras bugs, documenta:
1. Paso exacto que causa el error
2. Mensaje de error (screenshot)
3. Consola del navegador (F12)
4. Logs del backend (terminal)
5. Variables de entorno (.env)

**Log del backend en archivo:**
```bash
cd backend
npm run dev > testing.log 2>&1
```
