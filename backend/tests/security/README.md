# Tests de Seguridad - María Bags Backend

Esta carpeta contiene scripts para probar los mecanismos de seguridad del API.

## Requisitos

- Node.js 18+ (con fetch nativo)
- Servidor del API corriendo (por defecto en http://localhost:3000)
- Usuarios de prueba configurados (ver más abajo)

## Preparación

### 1. Crear usuarios de prueba

Ejecutar en PostgreSQL o mediante el API:

```sql
-- Usuario ADMIN
INSERT INTO usuarios (username, password_hash, rol)
VALUES (
  'admin_test',
  '$2a$12$hashed_password_here', -- Hash de 'Admin123!'
  'ADMIN'
);

-- Usuario STAFF
INSERT INTO usuarios (username, password_hash, rol)
VALUES (
  'staff_test',
  '$2a$12$hashed_password_here', -- Hash de 'Staff123!'
  'STAFF'
);
```

O usar el endpoint de creación de usuarios (requiere usuario ADMIN existente).

### 2. Configurar variables de entorno (opcional)

Crear archivo `.env.test` en la raíz del backend:

```bash
API_URL=http://localhost:3000/api
TEST_ADMIN_USER=admin_test
TEST_ADMIN_PASS=Admin123!
TEST_STAFF_USER=staff_test
TEST_STAFF_PASS=Staff123!
```

## Ejecución de Tests

### Test 1: Autenticación

Prueba mecanismos básicos de autenticación:
- Login con credenciales incorrectas
- Acceso sin token
- Tokens inválidos
- Rate limiting
- SQL Injection
- XSS

```bash
node tests/security/test-authentication.js
```

**No requiere usuarios de prueba** (solo prueba casos de error)

### Test 2: Autorización (RBAC)

Prueba control de acceso basado en roles:
- ADMIN puede gestionar usuarios
- STAFF no puede gestionar usuarios
- Ambos pueden acceder a clientes
- No se puede escalar privilegios

```bash
node tests/security/test-authorization.js
```

**Requiere usuarios**: admin_test y staff_test

### Test 3: Expiración de Tokens

Prueba manejo de tokens expirados:
- Token válido funciona
- Token expirado es rechazado
- Refresh token genera nuevo token
- Token viejo sigue inválido

```bash
# IMPORTANTE: Configurar JWT_EXPIRES_IN=5s antes de ejecutar
node tests/security/test-token-expiry.js
# RESTAURAR JWT_EXPIRES_IN=1h después
```

**Requiere usuario**: admin_test
**IMPORTANTE**: Cambiar temporalmente `JWT_EXPIRES_IN=5s` en `.env`

## Interpretación de Resultados

### Símbolos

- ✓ (verde): Test pasó correctamente
- ✗ (rojo): Test falló, posible vulnerabilidad
- ⚠ (amarillo): Advertencia o nota importante
- ℹ (azul): Información adicional

### Qué hacer si un test falla

1. **Revisar el código** relacionado con el test fallido
2. **Verificar configuración** (.env, variables de entorno)
3. **Comprobar prerrequisitos** (usuarios de prueba, permisos)
4. **Analizar logs del servidor** para más contexto
5. **Corregir vulnerabilidad** si es real
6. **Re-ejecutar test** para confirmar corrección

## Tests Adicionales Recomendados

Estos tests no están implementados pero se recomiendan para auditoría completa:

### Input Validation
```bash
# Probar límites de campos
# Probar caracteres especiales
# Probar payloads grandes
```

### Session Management
```bash
# Probar múltiples sesiones simultáneas
# Probar revocación de tokens
# Probar sesión en múltiples dispositivos
```

### Data Exposure
```bash
# Verificar que passwords nunca se retornan
# Verificar que logs no contienen datos sensibles
# Probar endpoints con datos de otros usuarios
```

### Performance
```bash
# Probar DoS con requests masivos
# Verificar timeouts de consultas lentas
# Probar payloads extremadamente grandes
```

## Automatización

Para integración continua, ejecutar todos los tests:

```bash
#!/bin/bash
# run-security-tests.sh

echo "Ejecutando tests de seguridad..."

# Test 1: Autenticación
echo "\n=== TEST 1: Autenticación ==="
node tests/security/test-authentication.js
AUTH_EXIT=$?

# Test 2: Autorización
echo "\n=== TEST 2: Autorización ==="
node tests/security/test-authorization.js
AUTHZ_EXIT=$?

# Test 3: Tokens (requiere configuración manual)
# echo "\n=== TEST 3: Expiración de Tokens ==="
# node tests/security/test-token-expiry.js
# TOKEN_EXIT=$?

if [ $AUTH_EXIT -ne 0 ] || [ $AUTHZ_EXIT -ne 0 ]; then
  echo "\n❌ Algunos tests fallaron"
  exit 1
else
  echo "\n✅ Todos los tests pasaron"
  exit 0
fi
```

## Notas de Seguridad

1. **No ejecutar en producción**: Estos tests pueden desencadenar rate limiting y bloqueos
2. **Usar datos de prueba**: Nunca usar credenciales reales
3. **Limpiar después**: Eliminar usuarios de prueba si es necesario
4. **Monitorear logs**: Verificar que los intentos de ataque se loguean correctamente
5. **Actualizar tests**: Agregar nuevos tests al implementar features de seguridad

## Frecuencia Recomendada

- **Antes de cada deploy**: Tests de autenticación y autorización
- **Semanal**: Todos los tests básicos
- **Mensual**: Tests exhaustivos + auditoría manual
- **Después de cambios de seguridad**: Todos los tests relevantes

## Contacto

Para reportar vulnerabilidades encontradas por estos tests:
- Email: security@mariabags.com
- NO crear issues públicos con detalles de vulnerabilidades

## Referencias

- [OWASP Testing Guide](https://owasp.org/www-project-web-security-testing-guide/)
- [JWT Security Best Practices](https://tools.ietf.org/html/rfc8725)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
