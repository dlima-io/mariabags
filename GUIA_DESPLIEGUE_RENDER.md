# 🚀 Guía de Despliegue en Render - MARIA Clothing & Bags

## 📋 Prerequisitos

1. Cuenta en [Render](https://render.com) (gratis)
2. Repositorio Git (GitHub, GitLab o Bitbucket)
3. Código pusheado al repositorio

---

## 🎯 Paso 1: Preparar el Repositorio

### 1.1 Asegurar que `.env` NO esté en Git

Verifica tu `.gitignore`:

```bash
# Verificar que .env está ignorado
cat .gitignore | grep .env
```

Si no está, agrégalo:

```bash
echo ".env" >> .gitignore
echo "backend/.env" >> backend/.gitignore
echo "frontend/.env" >> frontend/.gitignore
```

### 1.2 Pushear el código a GitHub

```bash
# Si aún no tienes un repositorio remoto
git remote add origin https://github.com/TU_USUARIO/mariabags.git

# Pushear todos los cambios
git push -u origin fresh-start
```

---

## 🗄️ Paso 2: Crear la Base de Datos PostgreSQL

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **"New +"** → **"PostgreSQL"**
3. Configuración:
   - **Name:** `mariabags-db`
   - **Database:** `mariabags`
   - **User:** `mariabags_user`
   - **Region:** Oregon (o la más cercana)
   - **Plan:** Free
4. Click **"Create Database"**
5. **IMPORTANTE:** Guarda las credenciales que aparecen:
   - Internal Database URL
   - External Database URL
   - Hostname
   - Port
   - Database
   - Username
   - Password

### 2.1 Ejecutar Migraciones

Una vez creada la DB, necesitas ejecutar las migraciones. Hay dos opciones:

**Opción A: Desde tu máquina local (Recomendado)**

```bash
# Instalar PostgreSQL client si no lo tienes
# Windows: descargar desde https://www.postgresql.org/download/windows/

# Conectar a la base de datos de Render
psql "postgresql://mariabags_user:PASSWORD@HOST:5432/mariabags"

# Copiar y pegar el contenido de tu archivo de schema/migraciones
```

**Opción B: Usar DBeaver o pgAdmin**

1. Descargar [DBeaver](https://dbeaver.io/download/)
2. Conectar usando las credenciales de Render
3. Ejecutar tus scripts SQL de migración

---

## 🔧 Paso 3: Desplegar el Backend

1. En Render Dashboard: **"New +"** → **"Web Service"**
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Name:** `mariabags-backend`
   - **Region:** Oregon
   - **Branch:** `fresh-start` (o tu rama principal)
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

### 3.1 Configurar Variables de Entorno

En la sección **"Environment"**, agregar:

```
NODE_ENV=production
PORT=3000
DB_HOST=<hostname_de_render_db>
DB_PORT=5432
DB_NAME=mariabags
DB_USER=mariabags_user
DB_PASSWORD=<password_de_render_db>
JWT_SECRET=<generar_secret_aleatorio>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
CORS_ORIGIN=https://mariabags-frontend.onrender.com
```

**Para generar JWT_SECRET:**

```bash
# En tu terminal local
openssl rand -base64 64
```

Copia el resultado y úsalo como `JWT_SECRET`.

### 3.2 Configurar CORS_ORIGIN

⚠️ **IMPORTANTE:** Actualiza `CORS_ORIGIN` después de desplegar el frontend (Paso 4).

4. Click **"Create Web Service"**
5. **Espera 5-10 minutos** mientras se despliega
6. Una vez desplegado, guarda la URL: `https://mariabags-backend.onrender.com`

---

## 🎨 Paso 4: Desplegar el Frontend

1. En Render Dashboard: **"New +"** → **"Static Site"**
2. Conecta tu repositorio de GitHub
3. Configuración:
   - **Name:** `mariabags-frontend`
   - **Region:** Oregon
   - **Branch:** `fresh-start`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
   - **Plan:** Free

### 4.1 Configurar Variables de Entorno

En la sección **"Environment"**, agregar:

```
VITE_API_URL=https://mariabags-backend.onrender.com/api
VITE_APP_NAME=MARIA Clothing & Bags
VITE_WHATSAPP_DEFAULT_MESSAGE=Hola! Te contacto desde MARIA Clothing & Bags
```

⚠️ **Usa la URL del backend del Paso 3**

4. Click **"Create Static Site"**
5. **Espera 3-5 minutos** mientras se despliega
6. Una vez desplegado, guarda la URL: `https://mariabags-frontend.onrender.com`

---

## 🔄 Paso 5: Actualizar CORS en el Backend

1. Ve al servicio **mariabags-backend** en Render
2. Click en **"Environment"**
3. Edita `CORS_ORIGIN` con la URL del frontend:
   ```
   CORS_ORIGIN=https://mariabags-frontend.onrender.com
   ```
4. Click **"Save Changes"**
5. El servicio se reiniciará automáticamente

---

## 👤 Paso 6: Crear Usuario Administrador

### Opción A: Via API (Recomendado)

```bash
# Usando curl o Postman
curl -X POST https://mariabags-backend.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "TuPasswordSeguro123!",
    "rol": "ADMIN"
  }'
```

### Opción B: Via SQL Directo

```sql
-- Conectar a la DB de Render con psql o DBeaver
INSERT INTO usuarios (id, username, password_hash, rol, fecha_creacion)
VALUES (
  gen_random_uuid(),
  'admin',
  -- Password hasheado (usa bcrypt online con 12 rounds)
  '$2a$12$TU_PASSWORD_HASHEADO',
  'ADMIN',
  NOW()
);
```

---

## ✅ Paso 7: Verificar el Despliegue

1. **Backend Health Check:**
   ```
   https://mariabags-backend.onrender.com/api/health
   ```
   Deberías ver: `{"status": "ok", "database": "connected"}`

2. **Frontend:**
   ```
   https://mariabags-frontend.onrender.com
   ```
   Deberías ver la pantalla de login

3. **Login:**
   - Abre el frontend
   - Ingresa con el usuario creado en el Paso 6
   - Verifica que puedas ver el dashboard

---

## 🎉 ¡Listo!

Tu aplicación está desplegada en:
- 🌐 **Frontend:** https://mariabags-frontend.onrender.com
- 🔧 **Backend:** https://mariabags-backend.onrender.com

---

## 📝 Notas Importantes

### Plan Free de Render

- ⏱️ **Inactividad:** Si no hay tráfico por 15 minutos, el servicio se "duerme"
- 🐌 **Primera carga:** Puede tardar 30-60 segundos en "despertar"
- 💾 **Base de datos:** 90 días de retención, máximo 1 GB
- 🔄 **Deploys:** Automáticos cuando pusheas a la rama configurada

### Upgrades Recomendados (Si necesitas)

- **Starter Plan ($7/mes por servicio):**
  - Sin sleep automático
  - Más recursos (512 MB RAM)
  - Mejor para producción seria

### Dominios Personalizados

1. Ve al servicio en Render
2. Click en **"Settings"** → **"Custom Domain"**
3. Agrega tu dominio (ej: `app.mariabags.com`)
4. Configura los DNS según instrucciones de Render
5. HTTPS automático con Let's Encrypt

---

## 🆘 Troubleshooting

### Backend no conecta a la DB

```bash
# Verificar variables de entorno
# En Render Dashboard → Backend → Environment
# Asegurar que DB_HOST, DB_PORT, etc. sean correctos
```

### CORS Error en el Frontend

```bash
# Verificar que CORS_ORIGIN en backend tenga la URL exacta del frontend
CORS_ORIGIN=https://mariabags-frontend.onrender.com
# SIN barra final /
```

### Build falla en Backend

```bash
# Verificar que tsconfig.json exista
# Verificar que package.json tenga:
"scripts": {
  "build": "tsc",
  "start": "node dist/server.js"
}
```

### Frontend no se comunica con Backend

```bash
# Verificar VITE_API_URL en frontend
# Debe terminar en /api
VITE_API_URL=https://mariabags-backend.onrender.com/api
```

---

## 🔐 Seguridad en Producción

- ✅ JWT_SECRET generado con `openssl rand -base64 64`
- ✅ HTTPS automático en Render
- ✅ Variables de entorno nunca en el código
- ✅ CORS configurado solo para tu dominio
- ✅ BCRYPT_ROUNDS=12 para passwords

---

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Render Dashboard → Service → Logs
2. Verifica el health check del backend
3. Inspecciona la consola del navegador (F12)
