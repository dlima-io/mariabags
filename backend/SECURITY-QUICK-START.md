# Quick Start - Seguridad María Bags Backend

Este es un resumen ejecutivo de las mejoras de seguridad implementadas. Para detalles completos, ver `SECURITY.md` y `SECURITY-AUDIT-REPORT.md`.

---

## ¿Qué se Mejoró?

✅ **8 vulnerabilidades críticas corregidas**:
1. XSS Protection (sanitización de inputs)
2. Logging seguro (no expone passwords)
3. Rate Limiting (bloquea fuerza bruta)
4. Timing attacks mitigados
5. Validación de refresh tokens
6. JWT con algoritmo explícito
7. Validaciones de contraseñas robustas
8. Configuración segura documentada

✅ **Tests de seguridad automatizados**
✅ **Documentación completa**

---

## Archivos Importantes

### Para Desarrolladores
- `SECURITY.md` - Documentación completa de seguridad
- `SECURITY-AUDIT-REPORT.md` - Reporte técnico de auditoría
- `SECURITY-IMPROVEMENTS-SUMMARY.md` - Resumen de todos los cambios

### Para Testing
- `tests/security/test-authentication.js` - Tests de autenticación
- `tests/security/test-authorization.js` - Tests de RBAC
- `tests/security/test-token-expiry.js` - Tests de expiración
- `tests/security/README.md` - Guía de testing

---

## Checklist Rápido Pre-Deploy

### Configuración (.env)
```bash
# 1. Generar JWT_SECRET seguro
openssl rand -base64 32

# 2. Editar .env con valores seguros
JWT_SECRET=<tu-secret-aleatorio-32-chars>
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
BCRYPT_ROUNDS=12
NODE_ENV=production
CORS_ORIGIN=https://tu-dominio.com
```

### Testing
```bash
# 3. Ejecutar tests de seguridad
node tests/security/test-authentication.js
node tests/security/test-authorization.js
```

### Infraestructura
- [ ] HTTPS habilitado
- [ ] Certificado SSL válido
- [ ] Firewall configurado
- [ ] Logs centralizados
- [ ] Backups de base de datos

---

## Comandos Rápidos

### Desarrollo
```bash
# Iniciar servidor de desarrollo
npm run dev

# Ver logs en tiempo real
tail -f logs/app.log
```

### Testing de Seguridad
```bash
# Test básico (no requiere setup)
node tests/security/test-authentication.js

# Test de autorización (requiere usuarios de prueba)
node tests/security/test-authorization.js

# Test de expiración (cambiar JWT_EXPIRES_IN=5s temporalmente)
node tests/security/test-token-expiry.js
```

### Producción
```bash
# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Verificar health check
curl http://localhost:3000/health
```

---

## Endpoints de Autenticación

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "Admin123!"
}

# Rate limit: 5 intentos / 15 minutos
```

### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

# Rate limit: 10 intentos / hora
```

### Cambiar Contraseña
```bash
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}

# Rate limit: 3 intentos / 15 minutos
# Validación: Mínimo 8 caracteres, mayúscula, minúscula y número
```

### Verificar Token
```bash
GET /api/auth/me
Authorization: Bearer <token>
```

---

## Protección Implementada

### XSS (Cross-Site Scripting)
```typescript
// Todos los campos de texto escapados
body('nombre').escape()
body('observaciones').escape()
```

### SQL Injection
```typescript
// Queries parametrizadas
const query = 'SELECT * FROM usuarios WHERE username = $1';
await pool.query(query, [username]);
```

### Rate Limiting
```typescript
// Login: 5 intentos por 15 minutos
loginRateLimiter.middleware

// Cambio de contraseña: 3 intentos por 15 minutos
passwordChangeRateLimiter.middleware

// Refresh: 10 intentos por hora
refreshTokenRateLimiter.middleware
```

### JWT Seguro
```typescript
// Algoritmo explícito + issuer
jwt.sign(payload, secret, {
  algorithm: 'HS256',
  issuer: 'mariabags-api',
  expiresIn: '1h'
})
```

### Logging Seguro
```typescript
// Passwords nunca en logs
const sanitized = sanitizeForLogging(req.body);
// password -> [REDACTED]
```

---

## Respuestas Comunes

### ¿Qué pasa si olvido mi contraseña?
Actualmente no hay endpoint de recuperación. Implementar en futuro:
```bash
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

### ¿Cómo revocar un token?
Actualmente tokens no pueden revocarse (stateless JWT). Para revocar:
1. Cambiar JWT_SECRET (invalida TODOS los tokens)
2. O implementar blacklist con Redis (recomendado para producción)

### ¿Cuánto dura un token?
- Access Token: 1 hora (configurable)
- Refresh Token: 7 días (configurable)

### ¿Qué pasa si se bloquea por rate limiting?
```json
{
  "error": "Demasiados intentos. Por favor, intente más tarde.",
  "retryAfter": 900  // segundos
}
```
Esperar el tiempo indicado o contactar administrador.

---

## Errores Comunes y Soluciones

### Error: "Token expirado"
**Solución**: Usar refresh token para obtener nuevo access token

### Error: "Token inválido"
**Solución**: Re-autenticarse (login nuevamente)

### Error: "Demasiados intentos"
**Solución**: Esperar tiempo de cooldown (ver `retryAfter` en respuesta)

### Error: "No autenticado"
**Solución**: Incluir header `Authorization: Bearer <token>`

### Error: "No tiene permisos"
**Solución**: Verificar que tu usuario tiene el rol correcto (ADMIN/STAFF)

---

## Métricas de Seguridad

### Monitorear en Producción

1. **Intentos de Login Fallidos**
   - Normal: < 5% de requests
   - Alerta: > 10% (posible ataque)

2. **Tokens Expirados/Inválidos**
   - Normal: < 3% de requests
   - Alerta: > 10% (posible intento de ataque)

3. **Rate Limiting Activaciones**
   - Normal: < 1% de usuarios
   - Alerta: > 5% (posible ataque distribuido)

4. **Errores 401/403**
   - Normal: < 2% de requests
   - Alerta: > 10% (posible enumeración)

---

## Contacto de Seguridad

Para reportar vulnerabilidades:
- **NO crear issues públicos**
- Email: security@mariabags.com (configurar)
- Respuesta esperada: 48 horas

---

## Recursos Adicionales

### Documentación
- `SECURITY.md` - Guía completa de seguridad
- `SECURITY-AUDIT-REPORT.md` - Reporte técnico
- `tests/security/README.md` - Guía de testing

### Referencias Externas
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

## Próximos Pasos Recomendados

### Corto Plazo (1-2 semanas)
- [ ] Implementar recuperación de contraseña
- [ ] Configurar logs centralizados
- [ ] Setup monitoreo de métricas

### Mediano Plazo (1-3 meses)
- [ ] Migrar rate limiting a Redis
- [ ] Implementar blacklist de tokens
- [ ] 2FA (autenticación de dos factores)

### Largo Plazo (3-6 meses)
- [ ] Auditoría de seguridad externa
- [ ] Penetration testing
- [ ] Certificación de seguridad

---

**Versión**: 1.0
**Última actualización**: 2026-02-03
**Estado**: ✅ LISTO PARA PRODUCCIÓN
