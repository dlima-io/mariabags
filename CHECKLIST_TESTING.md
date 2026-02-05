# ✅ Checklist de Testing Manual - María Bags

## Pre-requisitos
- [ ] PostgreSQL instalado y corriendo
- [ ] Node.js instalado
- [ ] Dependencias instaladas (npm install en backend y frontend)
- [ ] Archivos .env creados

---

## 🗄️ Base de Datos

### Setup
- [ ] Ejecutar `setup-db.bat` o comandos manuales
- [ ] Base de datos "mariabags" creada
- [ ] Tablas creadas (usuarios, clientes, movimientos, configuracion, saldos_clientes)
- [ ] Datos de prueba cargados (2 usuarios, 5 clientes)

### Verificación
```sql
-- Ejecutar en psql
SELECT COUNT(*) FROM usuarios;    -- Debe devolver 2
SELECT COUNT(*) FROM clientes;    -- Debe devolver 5
SELECT COUNT(*) FROM movimientos; -- Debe devolver ~15
SELECT * FROM saldos_clientes;    -- Debe mostrar saldos calculados
```

- [ ] 2 usuarios en DB
- [ ] 5 clientes en DB
- [ ] Movimientos cargados
- [ ] Vista materializada funciona

---

## 🚀 Inicio de Servidores

### Backend (puerto 3000)
```bash
cd backend
npm run dev
```

- [ ] Backend inicia sin errores
- [ ] Mensaje "✅ Conectado a PostgreSQL"
- [ ] Mensaje "🚀 Servidor corriendo en http://localhost:3000"
- [ ] Health check responde: `curl http://localhost:3000/health`

### Frontend (puerto 5173)
```bash
cd frontend
npm run dev
```

- [ ] Frontend compila sin errores
- [ ] Accesible en http://localhost:5173
- [ ] No hay errores en consola del navegador (F12)

---

## 🔐 Autenticación

### Login
- [ ] Página de login se renderiza correctamente
- [ ] Animaciones de entrada funcionan
- [ ] Login con `admin / admin123` exitoso
- [ ] Redirección a Dashboard
- [ ] Token guardado en localStorage
- [ ] Usuario guardado en localStorage

### Verificaciones de Seguridad
- [ ] Login con credenciales incorrectas falla (401)
- [ ] Acceso a /clientes sin token redirige a /login
- [ ] Rate limiting activo (5 intentos en 15 min)
- [ ] JWT expira después de 1 hora

### DevTools Check
```javascript
// En consola del navegador (F12)
localStorage.getItem('token')   // ¿Existe?
localStorage.getItem('user')    // ¿Datos correctos?
```

- [ ] Token en localStorage
- [ ] User en localStorage
- [ ] No hay warnings de CORS

---

## 👥 Gestión de Clientes

### Visualización
- [ ] Lista de clientes se carga
- [ ] 5 clientes visibles
- [ ] Cards muestran nombre, apellido, teléfono
- [ ] Saldos se muestran correctamente
- [ ] Badges de color según saldo (rojo/verde)
- [ ] Animaciones de entrada (stagger)

### Búsqueda
- [ ] Buscar "ana" filtra correctamente
- [ ] Debounce funciona (300ms)
- [ ] Limpiar búsqueda restaura lista completa
- [ ] Búsqueda case-insensitive

### Crear Cliente
- [ ] Botón "Agregar Cliente" abre modal
- [ ] Formulario tiene validación
- [ ] Crear cliente con datos válidos funciona
- [ ] Toast de éxito aparece
- [ ] Cliente nuevo aparece en lista
- [ ] Saldo inicial es $0.00

### Validaciones
- [ ] Teléfono duplicado muestra error
- [ ] Campos vacíos muestran error
- [ ] Teléfono debe ser numérico
- [ ] Nombre/apellido requeridos

### Eliminar Cliente (Soft Delete)
- [ ] Botón de eliminar solicita confirmación
- [ ] Cliente eliminado desaparece de lista
- [ ] Toast de confirmación
- [ ] Verificar en DB: `activo = false` (NO borrado físico)

```sql
SELECT nombre, apellido, activo FROM clientes;
```

### WhatsApp Integration
- [ ] Botón WhatsApp visible en cards
- [ ] Click abre WhatsApp Web/App
- [ ] Número precargado correctamente
- [ ] Mensaje predeterminado incluido

---

## 💰 Movimientos

### Ver Historial
- [ ] Click en ClienteCard navega a detalle
- [ ] URL correcta: `/clientes/:id`
- [ ] Header muestra datos del cliente
- [ ] Card de saldo visible y actualizado
- [ ] Lista de movimientos cargada
- [ ] Movimientos ordenados por fecha DESC
- [ ] Cada movimiento muestra: tipo, monto, fecha, observaciones, usuario

### Badges de Tipo
- [ ] COMPRA = badge rojo
- [ ] PAGO = badge verde
- [ ] AJUSTE = badge azul

### Registrar Compra
- [ ] Botón "Registrar Compra" abre modal
- [ ] Formulario con campos: monto, observaciones
- [ ] Registrar compra de $5000
- [ ] Toast de éxito
- [ ] Movimiento aparece en lista
- [ ] **Saldo AUMENTA** en +$5000
- [ ] Usuario logueado aparece en movimiento

### Registrar Pago
- [ ] Botón "Registrar Pago" abre modal
- [ ] Registrar pago de $2000
- [ ] Toast de éxito
- [ ] Movimiento aparece en lista
- [ ] **Saldo DISMINUYE** en -$2000

### Cálculo de Saldo
**Fórmula: Saldo = DEBITOS - CREDITOS + AJUSTES**

Ejemplo con cliente de prueba:
```
Compras (DEBITO):  $15,000
Pagos (CREDITO):   -$8,000
Ajustes:               $500
--------------------------
Saldo total:        $7,500
```

- [ ] Saldo calculado correctamente
- [ ] Saldo se actualiza en tiempo real
- [ ] Color del badge correcto (rojo si > 0)

### Filtrado
- [ ] Selector "Todos" muestra todos los movimientos
- [ ] "Solo Compras" filtra solo DEBITO
- [ ] "Solo Pagos" filtra solo CREDITO
- [ ] Saldo total NO cambia al filtrar

### Verificación en DB
```sql
SELECT * FROM saldos_clientes WHERE nombre = 'Ana';
```

- [ ] total_debitos correcto
- [ ] total_creditos correcto
- [ ] total_ajustes correcto
- [ ] saldo = debitos - creditos + ajustes

---

## 📱 Responsive Design

### Mobile (375px)
- [ ] DevTools: iPhone SE o custom 375x667
- [ ] Grid de clientes: 1 columna
- [ ] Botones touch-friendly (≥44px)
- [ ] Modal ocupa pantalla completa
- [ ] Formularios legibles
- [ ] Safe area padding visible
- [ ] Tabs de navegación en bottom

### Tablet (768px)
- [ ] Grid de clientes: 2 columnas
- [ ] Layout adaptado
- [ ] Formularios centrados

### Desktop (1280px+)
- [ ] Grid de clientes: 3 columnas
- [ ] Espaciado optimizado
- [ ] Hover effects funcionan

---

## 🔒 Seguridad

### XSS Prevention
Crear cliente con:
```
Nombre: <script>alert('XSS')</script>
```

- [ ] Script no se ejecuta
- [ ] Renderizado como texto escapado

### Rate Limiting (Login)
Intentar login 6 veces con password incorrecta:

- [ ] Primeros 5 intentos: 401
- [ ] Sexto intento: **429 Too Many Requests**
- [ ] Mensaje "Demasiados intentos"

### JWT Expiration
- [ ] Token expira después de 1 hora
- [ ] Acceso con token expirado redirige a /login
- [ ] Toast "Sesión expirada"

### HTTPS Headers
```bash
curl -I http://localhost:3000/health
```

- [ ] Helmet headers presentes (X-Content-Type-Options, etc.)

---

## ⚡ Performance

### Tiempos de Respuesta
- [ ] Login: < 500ms
- [ ] Listar clientes: < 300ms
- [ ] Búsqueda: < 300ms (con debounce)
- [ ] Registrar movimiento: < 400ms
- [ ] Carga inicial: < 1s

### Optimizaciones
- [ ] Componentes con React.memo donde corresponde
- [ ] Debounce en búsqueda activo
- [ ] No re-renders innecesarios

---

## 🐛 Bugs Encontrados

### Críticos (Bloquean uso)
1.
2.

### Medios (Afectan UX)
1.
2.

### Bajos (Cosméticos)
1.
2.

---

## 📊 Resumen de Testing

**Fecha**: _______________
**Tester**: _______________
**Tiempo total**: _____ minutos

### Estadísticas
- Tests ejecutados: ____ / 100+
- Tests exitosos: ____
- Tests fallidos: ____
- Bugs críticos: ____
- Bugs medios: ____
- Bugs bajos: ____

### Decisión Final
- [ ] ✅ **APROBADO** - Listo para producción
- [ ] ⚠️ **APROBADO CON OBSERVACIONES** - Requiere ajustes menores
- [ ] ❌ **RECHAZADO** - Requiere correcciones críticas

### Comentarios Adicionales
```
...
```

---

## 🎯 Siguiente Paso

Si el testing es exitoso:
1. [ ] Configurar variables de entorno para producción
2. [ ] Generar JWT_SECRET seguro: `openssl rand -base64 32`
3. [ ] Configurar base de datos PostgreSQL en servidor
4. [ ] Build de producción: `npm run build`
5. [ ] Deploy backend
6. [ ] Deploy frontend
7. [ ] Configurar dominio y SSL

---

## 📞 Ayuda

**Errores comunes y soluciones rápidas:**

| Error | Solución |
|-------|----------|
| Backend no conecta a DB | Verificar PostgreSQL corriendo, credenciales en .env |
| CORS error | Verificar CORS_ORIGIN en backend/.env = URL frontend |
| 401 en todos los endpoints | Verificar JWT_SECRET igual en backend y que no esté expirado |
| Clientes no cargan | Verificar seed ejecutado, tabla no vacía |
| Saldo incorrecto | Verificar vista materializada: `REFRESH MATERIALIZED VIEW saldos_clientes;` |

**Logs:**
```bash
# Backend
cd backend && npm run dev > testing-backend.log 2>&1

# Verificar logs
tail -f testing-backend.log
```
