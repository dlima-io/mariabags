# Documentación de Seguridad - María Bags Backend

## Índice
1. [Medidas de Seguridad Implementadas](#medidas-de-seguridad-implementadas)
2. [Mejores Prácticas Seguidas](#mejores-prácticas-seguidas)
3. [Configuración de Producción](#configuración-de-producción)
4. [Checklist Pre-Deploy](#checklist-pre-deploy)
5. [Procedimientos de Seguridad](#procedimientos-de-seguridad)
6. [Auditoría y Monitoreo](#auditoría-y-monitoreo)

---

## Medidas de Seguridad Implementadas

### 1. Autenticación y Autorización

#### JWT (JSON Web Tokens)
- **Algoritmo**: HS256 (HMAC-SHA256) especificado explícitamente
- **Issuer**: `mariabags-api` para validación adicional
- **Expiración**:
  - Access Token: 1 hora (configurable)
  - Refresh Token: 7 días (configurable)
- **Almacenamiento**: Se recomienda httpOnly cookies o secure storage en cliente

#### Bcrypt para Hashing de Contraseñas
- **Salt Rounds**: 12 (configurable desde .env, mínimo 10)
- **Comparación**: Tiempo constante mediante bcrypt.compare()
- **Ubicación**: `backend/src/models/UsuarioModel.ts`

#### Middleware de Autenticación
- **Archivo**: `backend/src/middleware/authMiddleware.ts`
- **Funcionalidad**:
  - Valida token JWT en header Authorization
  - Verifica formato Bearer
  - Maneja errores específicos (token expirado, inválido)
  - Inyecta usuario en req.usuario para controladores

#### Control de Acceso Basado en Roles (RBAC)
- **Roles**: ADMIN, STAFF
- **Middleware**: `requireRole(...roles)`
- **Aplicación**:
  - Gestión de usuarios: Solo ADMIN
  - Operaciones de clientes/movimientos: ADMIN y STAFF autenticados

### 2. Protección contra Ataques Comunes

#### SQL Injection
- **Protección**: Queries parametrizadas en todas las consultas PostgreSQL
- **Ejemplo**:
  ```typescript
  const query = 'SELECT * FROM usuarios WHERE username = $1';
  await pool.query(query, [username]);
  ```
- **Estado**: ✅ Implementado en todos los modelos

#### Cross-Site Scripting (XSS)
- **Protección**: Sanitización de inputs con express-validator
- **Implementación**: `.escape()` en todos los campos de texto
- **Archivo**: `backend/src/utils/validators.ts`
- **Campos sanitizados**:
  - Nombres, apellidos (clientes)
  - Usernames
  - Observaciones de movimientos

#### Rate Limiting
- **Implementación**: Middleware personalizado en memoria
- **Archivo**: `backend/src/middleware/rateLimiter.ts`
- **Límites**:
  - Login: 5 intentos por 15 minutos
  - Cambio de contraseña: 3 intentos por 15 minutos
  - Refresh token: 10 intentos por hora
- **Clave**: IP + username para mayor precisión
- **Nota**: Para producción con múltiples instancias, migrar a Redis

#### Timing Attacks
- **Protección**: bcrypt.compare() usa comparación de tiempo constante
- **Mensajes de error**: Genéricos para login (no distingue usuario inexistente vs password incorrecta)

### 3. Validación de Entrada

#### Express-Validator
- **Archivo**: `backend/src/utils/validators.ts`
- **Validaciones implementadas**:

**Clientes**:
- Nombre/Apellido: 2-100 caracteres, escapado
- Teléfono: Formato internacional E.164
- Activo: Boolean

**Movimientos**:
- Cliente ID: UUID válido
- Tipo: Enum (DEBITO, CREDITO, AJUSTE)
- Monto: Positivo, máximo 99,999,999.99
- Observaciones: Máximo 500 caracteres, escapado

**Usuarios**:
- Username: 4-50 caracteres alfanuméricos + guión bajo
- Password: Mínimo 8 caracteres
- Cambio de password: Mayúscula, minúscula y número obligatorios
- Refresh Token: Formato JWT válido

### 4. Manejo Seguro de Errores

#### Error Handler
- **Archivo**: `backend/src/middleware/errorHandler.ts`
- **Características**:
  - Sanitización de datos sensibles antes de loguear
  - Filtra: passwords, tokens, password_hash
  - Oculta stack traces en producción
  - Mensajes genéricos al cliente en producción

#### Ejemplo de sanitización:
```typescript
// Campos sensibles se reemplazan por [REDACTED] en logs
const sensitive = ['password', 'password_hash', 'token', 'refreshToken'];
```

### 5. Configuración de Seguridad HTTP

#### Helmet.js
- **Estado**: Instalado en package.json
- **Acción requerida**: Verificar configuración en server.ts
- **Headers recomendados**:
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff
  - Strict-Transport-Security: max-age=31536000
  - Content-Security-Policy: default-src 'self'

#### CORS
- **Configuración**: Whitelist de orígenes
- **Archivo**: Configurar en server.ts
- **Recomendación**: Solo permitir frontend en producción

---

## Mejores Prácticas Seguidas

### Arquitectura de Seguridad

1. **Separación de Capas**:
   - Routes → Controllers → Services → Models
   - Lógica de seguridad centralizada en middleware

2. **Principio de Menor Privilegio**:
   - Solo retornar datos necesarios
   - Password NUNCA se incluye en respuestas (excepto para autenticación interna)

3. **Defensa en Profundidad**:
   - Validación en múltiples capas
   - Autenticación + Autorización + Validación de Input

4. **Inmutabilidad de Auditoría**:
   - Campo `usuario_id` obligatorio en movimientos
   - Soft delete de clientes (campo `activo`)
   - Preservación de historial para compliance

### Seguridad de Datos

1. **Nunca Loguear Información Sensible**:
   - ✅ Passwords filtrados en errorHandler
   - ✅ Tokens no logueados
   - ✅ PII sanitizado antes de logs

2. **Almacenamiento Seguro**:
   - Variables de entorno para secrets (.env)
   - .env en .gitignore
   - .env.example con valores dummy

3. **Transporte Seguro**:
   - HTTPS obligatorio en producción
   - Tokens en Authorization header (no en URL)

---

## Configuración de Producción

### Variables de Entorno Críticas

```bash
# JWT Secret - GENERAR UNO NUEVO
# Comando: openssl rand -base64 32
JWT_SECRET=<secret-aleatorio-minimo-32-caracteres>

# Tiempos de expiración reducidos
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Bcrypt rounds (12 recomendado)
BCRYPT_ROUNDS=12

# Node environment
NODE_ENV=production

# CORS (solo frontend de producción)
CORS_ORIGIN=https://mariabags.com

# Base de datos (usar credenciales de producción)
DB_HOST=<rds-endpoint>
DB_PASSWORD=<password-seguro>
DB_SSL=true  # Habilitar SSL
```

### Recomendaciones de Infraestructura

1. **Base de Datos**:
   - SSL/TLS para conexiones PostgreSQL
   - Credenciales con permisos mínimos
   - Backups automáticos cifrados
   - No exponer puerto públicamente

2. **Servidor**:
   - Firewall configurado (solo puertos 80/443)
   - Fail2ban para protección adicional
   - Certificado SSL válido (Let's Encrypt)
   - Reverse proxy (Nginx) con rate limiting adicional

3. **Logs**:
   - Centralizar logs (CloudWatch, Loggly)
   - Rotar logs periódicamente
   - Alertas para eventos críticos:
     - Múltiples intentos de login fallidos
     - Errores 500
     - Tokens inválidos frecuentes

4. **Monitoreo**:
   - Health checks (endpoint /api/health)
   - Métricas de rendimiento
   - Alertas de disponibilidad

---

## Checklist Pre-Deploy

### Configuración

- [ ] Generar JWT_SECRET aleatorio (mínimo 32 caracteres)
- [ ] Configurar NODE_ENV=production
- [ ] Establecer CORS_ORIGIN con dominio real
- [ ] Configurar BCRYPT_ROUNDS a 12
- [ ] Reducir JWT_EXPIRES_IN a 1h o menos
- [ ] Configurar variables de base de datos con credenciales de producción
- [ ] Habilitar SSL en conexión PostgreSQL

### Código

- [ ] Verificar que .env no está en git
- [ ] Confirmar que helmet está aplicado en server.ts
- [ ] Revisar que no hay console.log con datos sensibles
- [ ] Validar que todas las rutas críticas tienen authMiddleware
- [ ] Confirmar rate limiting en endpoints de autenticación
- [ ] Verificar manejo de errores sin stack traces en producción

### Base de Datos

- [ ] Ejecutar migraciones en producción
- [ ] Crear usuario admin inicial
- [ ] Configurar backups automáticos
- [ ] Verificar constraints de unicidad (username, teléfono)
- [ ] Confirmar foreign keys y cascadas

### Infraestructura

- [ ] Certificado SSL instalado y válido
- [ ] HTTPS habilitado (HTTP redirige a HTTPS)
- [ ] Firewall configurado
- [ ] Reverse proxy configurado (Nginx/Apache)
- [ ] Rate limiting a nivel de infraestructura
- [ ] Logs centralizados configurados

### Testing de Seguridad

- [ ] Ejecutar scripts de testing de seguridad (ver carpeta tests/)
- [ ] Probar login con credenciales incorrectas (rate limiting)
- [ ] Verificar tokens expirados son rechazados
- [ ] Confirmar tokens inválidos son rechazados
- [ ] Probar acceso sin autenticación (debe fallar)
- [ ] Validar RBAC (STAFF no puede crear usuarios)
- [ ] Intentar SQL injection en inputs
- [ ] Intentar XSS en campos de texto

### Monitoreo

- [ ] Configurar alertas de uptime
- [ ] Establecer métricas de rendimiento baseline
- [ ] Configurar alertas de errores 500
- [ ] Monitorear uso de rate limiting
- [ ] Revisar logs de autenticación fallida

---

## Procedimientos de Seguridad

### Rotación de Secrets

**JWT_SECRET**:
1. Generar nuevo secret: `openssl rand -base64 32`
2. Actualizar variable de entorno
3. Reiniciar servidor
4. Todos los tokens existentes quedarán inválidos (usuarios deberán re-autenticarse)

**Contraseñas de Base de Datos**:
1. Crear nuevo usuario en PostgreSQL
2. Actualizar permisos
3. Actualizar .env
4. Reiniciar servidor
5. Eliminar usuario antiguo

### Respuesta a Incidentes

**Compromiso de Cuenta**:
1. Desactivar usuario: `UPDATE usuarios SET activo = false WHERE id = ?`
2. Forzar cambio de contraseña
3. Revisar logs de actividad
4. Notificar al usuario

**Ataque de Fuerza Bruta Detectado**:
1. Verificar rate limiting está funcionando
2. Revisar logs de IP atacante
3. Bloquear IP a nivel de firewall si es necesario
4. Considerar reducir límites de rate limiting

**Fuga de Datos**:
1. Identificar alcance del compromiso
2. Rotar todos los secrets (JWT, DB)
3. Forzar reset de contraseñas
4. Notificar a usuarios afectados
5. Analizar logs para punto de entrada

### Actualizaciones de Seguridad

**Dependencias**:
```bash
# Revisar vulnerabilidades
npm audit

# Actualizar automáticamente
npm audit fix

# Manual para breaking changes
npm outdated
npm update <package>
```

**Frecuencia recomendada**:
- Crítico: Inmediato
- Alto: 7 días
- Medio: 30 días
- Bajo: Cada release

---

## Auditoría y Monitoreo

### Logs de Auditoría

**Eventos que se loguean**:
- Login exitoso/fallido
- Cambios de contraseña
- Creación/modificación de usuarios
- Activaciones de rate limiting
- Errores no manejados

**Ubicación**: Console (redirigir a archivo en producción)

**Campos incluidos**:
- Timestamp
- Usuario (si está autenticado)
- IP
- Endpoint
- Método HTTP
- Status code

### Métricas de Seguridad

**KPIs a monitorear**:
1. Tasa de intentos de login fallidos
2. Número de tokens expirados/inválidos por día
3. Activaciones de rate limiting
4. Errores 401/403
5. Tiempo promedio de respuesta de autenticación

### Revisión de Seguridad

**Periodicidad**:
- Semanal: Revisar logs de autenticación
- Mensual: npm audit + actualizar dependencias
- Trimestral: Revisión completa de código
- Anual: Auditoría de seguridad externa

**Checklist de Revisión Mensual**:
- [ ] Ejecutar npm audit
- [ ] Revisar logs de errores 500
- [ ] Analizar intentos de login fallidos
- [ ] Verificar rate limiting stats
- [ ] Revisar usuarios activos
- [ ] Comprobar backups funcionando
- [ ] Validar certificado SSL vigente

---

## Recursos Adicionales

### Documentación de Referencia
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Bcrypt Explained](https://auth0.com/blog/hashing-in-action-understanding-bcrypt/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)

### Contacto de Seguridad
Para reportar vulnerabilidades de seguridad, contactar a:
- Email: security@mariabags.com (configurar)
- Respuesta esperada: 48 horas

---

**Última actualización**: 2026-02-03
**Versión**: 1.0
**Responsable**: Equipo de Desarrollo
