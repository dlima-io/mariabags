# 🚀 Guía de Inicio Rápido - María Bags

## Requisitos Previos

- ✅ Node.js 18 o superior
- ✅ PostgreSQL 14 o superior
- ✅ npm o yarn

## Instalación en 5 Pasos

### 1️⃣ Crear Base de Datos PostgreSQL

```bash
# Conectar a PostgreSQL como superusuario
psql -U postgres

# Crear base de datos
CREATE DATABASE mariabags;

# Crear usuario (opcional)
CREATE USER mariabags_user WITH PASSWORD 'tu_password_seguro';
GRANT ALL PRIVILEGES ON DATABASE mariabags TO mariabags_user;

# Salir
\q
```

### 2️⃣ Configurar Backend

```bash
cd backend

# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus credenciales
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=mariabags
# DB_USER=postgres
# DB_PASSWORD=tu_password

# Instalar dependencias (ya instaladas)
npm install

# Ejecutar migración de base de datos
npm run migrate
```

**Nota:** Si `npm run migrate` no funciona aún (script pendiente), ejecuta manualmente:

```bash
psql -U postgres -d mariabags -f src/db/migrations/001_initial_schema.sql
```

### 3️⃣ Configurar Frontend

```bash
cd ../frontend

# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env si necesitas cambiar la URL del API
# VITE_API_URL=http://localhost:3000/api

# Instalar dependencias (ya instaladas)
npm install
```

### 4️⃣ Iniciar Servidores de Desarrollo

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Deberías ver:
```
🚀 Servidor María Bags corriendo en puerto 3000
📊 Entorno: development
🔗 Health check: http://localhost:3000/health
Conexión a PostgreSQL exitosa
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Deberías ver:
```
VITE v5.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 5️⃣ Acceder a la Aplicación

Abrir navegador en: **http://localhost:5173**

---

## 🔑 Credenciales por Defecto

**Usuario Administrador:**
- Username: `admin`
- Password: `admin123`

**⚠️ IMPORTANTE:** Cambiar esta contraseña antes de producción.

---

## 🧪 Verificar Instalación

### Backend - Health Check

```bash
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "timestamp": "2024-xx-xxT...",
  "environment": "development"
}
```

### Frontend - Compilación TypeScript

```bash
cd frontend
npx tsc --noEmit
```

No debería mostrar errores.

### Backend - Compilación TypeScript

```bash
cd backend
npx tsc --noEmit
```

No debería mostrar errores.

---

## 📝 Comandos Útiles

### Backend

```bash
# Desarrollo con hot reload
npm run dev

# Compilar TypeScript
npm run build

# Ejecutar versión compilada
npm start

# Ejecutar migraciones (cuando esté implementado)
npm run migrate

# Cargar datos de prueba (cuando esté implementado)
npm run seed

# Linter
npm run lint
```

### Frontend

```bash
# Desarrollo (puerto 5173)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint
```

---

## 🔧 Solución de Problemas

### Error: "Cannot connect to PostgreSQL"

1. Verificar que PostgreSQL esté corriendo:
   ```bash
   # Windows
   net start postgresql-x64-14

   # Linux/Mac
   sudo systemctl status postgresql
   ```

2. Verificar credenciales en `backend/.env`

3. Verificar que la base de datos `mariabags` exista:
   ```bash
   psql -U postgres -l | grep mariabags
   ```

### Error: "Port 3000 already in use"

Cambiar puerto en `backend/.env`:
```
PORT=3001
```

Actualizar también en `frontend/vite.config.ts` el proxy.

### Error: "Port 5173 already in use"

Cambiar puerto en `frontend/vite.config.ts`:
```typescript
server: {
  port: 5174,  // Cambiar aquí
  // ...
}
```

### Error: TypeScript compilation errors

Ejecutar:
```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npx tsc --noEmit
```

Si hay errores, revisar las importaciones y tipos.

---

## 📚 Próximos Pasos

1. ✅ Verificar que backend y frontend corren sin errores
2. 📖 Leer `backend/README.md` y `frontend/README.md`
3. 🗄️ Explorar el esquema de base de datos en `backend/src/db/migrations/001_initial_schema.sql`
4. 🎨 Familiarizarse con la paleta de colores en `frontend/tailwind.config.js`
5. 🔨 Comenzar desarrollo de lógica de negocio según el roadmap

---

## 🎯 Roadmap de Desarrollo

- [x] Setup inicial del proyecto
- [x] Configuración de base de datos
- [x] Sistema de autenticación (estructura base)
- [ ] **PRÓXIMO:** Implementar CRUD de clientes
- [ ] Registro de movimientos (compras/pagos)
- [ ] Cálculo de saldos
- [ ] Sistema de ajustes porcentuales
- [ ] Pantalla de notificaciones (mora > 30 días)
- [ ] Integración con WhatsApp
- [ ] Animaciones y pulido UX

---

## 🆘 Ayuda

- **Backend:** Consultar `backend/README.md`
- **Frontend:** Consultar `frontend/README.md`
- **General:** Consultar `README.md`
- **Setup:** Consultar `SETUP_COMPLETE.md`

---

**¡Listo para comenzar a desarrollar! 🚀**
