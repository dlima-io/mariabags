/**
 * Test de Seguridad - Expiración de Tokens
 *
 * Este script prueba el manejo de tokens expirados
 *
 * PREREQUISITO: Configurar JWT_EXPIRES_IN=5s en .env para testing
 *
 * Uso:
 * node tests/security/test-token-expiry.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Credenciales de prueba
const TEST_USER = {
  username: process.env.TEST_USER || 'admin_test',
  password: process.env.TEST_PASS || 'Admin123!'
};

// Colores para output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.cyan}[TEST]${colors.reset} ${name}`);
}

function logPass(message) {
  log(`  ✓ ${message}`, 'green');
}

function logFail(message) {
  log(`  ✗ ${message}`, 'red');
}

function logInfo(message) {
  log(`  ℹ ${message}`, 'blue');
}

function logWarning(message) {
  log(`  ⚠ ${message}`, 'yellow');
}

// Helper para hacer requests
async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    const data = await response.json().catch(() => ({}));

    return {
      status: response.status,
      data,
      ok: response.ok
    };
  } catch (error) {
    return {
      status: 0,
      data: { error: error.message },
      ok: false
    };
  }
}

// Login helper
async function login(username, password) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  if (result.ok && result.data.token) {
    return {
      token: result.data.token,
      refreshToken: result.data.refreshToken
    };
  }

  throw new Error(`Login failed: ${result.data.error || 'Unknown error'}`);
}

// Sleep helper
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Token válido funciona correctamente
async function testValidToken(token) {
  logTest('Token válido funciona correctamente');

  const result = await request('/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (result.status === 200) {
    logPass('Token válido aceptado (200)');
    logInfo(`Usuario: ${result.data.usuario?.username}`);
  } else {
    logFail(`Esperado 200, recibido ${result.status}`);
  }
}

// Test 2: Token expirado es rechazado
async function testExpiredToken(token) {
  logTest('Token expirado es rechazado');

  logInfo('Esperando expiración del token...');
  logWarning('NOTA: Este test requiere JWT_EXPIRES_IN=5s en .env');

  // Esperar 6 segundos (más que el tiempo de expiración)
  await sleep(6000);

  const result = await request('/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (result.status === 401) {
    logPass('Token expirado rechazado (401)');
    if (result.data.error && result.data.error.toLowerCase().includes('expirado')) {
      logPass('Mensaje de error correcto');
    }
  } else {
    logFail(`Esperado 401, recibido ${result.status}`);
    logWarning('Verificar que JWT_EXPIRES_IN esté configurado a 5s');
  }
}

// Test 3: Refresh token funciona
async function testRefreshToken(refreshToken) {
  logTest('Refresh token genera nuevo token');

  const result = await request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken })
  });

  if (result.status === 200 && result.data.token) {
    logPass('Refresh token genera nuevo token exitosamente');
    logInfo('Nuevo token recibido');
    return result.data.token;
  } else {
    logFail(`Refresh token falló: ${result.status}`);
    return null;
  }
}

// Test 4: Nuevo token es válido
async function testNewTokenValid(token) {
  logTest('Nuevo token generado es válido');

  const result = await request('/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (result.status === 200) {
    logPass('Nuevo token funciona correctamente (200)');
  } else {
    logFail(`Esperado 200, recibido ${result.status}`);
  }
}

// Test 5: Token usado después de refresh sigue siendo inválido
async function testOldTokenStillInvalid(oldToken) {
  logTest('Token viejo sigue inválido después de refresh');

  const result = await request('/auth/me', {
    headers: {
      'Authorization': `Bearer ${oldToken}`
    }
  });

  if (result.status === 401) {
    logPass('Token expirado sigue siendo rechazado (401)');
  } else {
    logFail(`Esperado 401, recibido ${result.status}`);
  }
}

// Test 6: Refresh token inválido es rechazado
async function testInvalidRefreshToken() {
  logTest('Refresh token inválido es rechazado');

  const result = await request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({
      refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature'
    })
  });

  if (result.status === 400 || result.status === 401) {
    logPass('Refresh token inválido rechazado');
  } else {
    logFail(`Esperado 400/401, recibido ${result.status}`);
  }
}

// Test 7: Múltiples requests simultáneos con token expirado
async function testConcurrentExpiredRequests(expiredToken) {
  logTest('Múltiples requests simultáneos con token expirado');

  const promises = Array(5).fill(null).map(() =>
    request('/clientes', {
      headers: {
        'Authorization': `Bearer ${expiredToken}`
      }
    })
  );

  const results = await Promise.all(promises);
  const allRejected = results.every(r => r.status === 401);

  if (allRejected) {
    logPass('Todos los requests rechazados consistentemente (401)');
  } else {
    logFail('Inconsistencia en rechazo de tokens expirados');
  }
}

// Función principal
async function runTests() {
  log('\n========================================', 'cyan');
  log('  TESTS DE SEGURIDAD - EXPIRACIÓN DE TOKENS', 'cyan');
  log('========================================\n', 'cyan');

  log(`API URL: ${API_URL}\n`, 'yellow');

  logWarning('IMPORTANTE: Este test requiere JWT_EXPIRES_IN=5s en .env');
  logWarning('Restaurar a valor normal (1h) después del test\n');

  try {
    // Login
    log('Autenticando usuario de prueba...', 'yellow');
    const { token, refreshToken } = await login(TEST_USER.username, TEST_USER.password);
    log('✓ Autenticación exitosa\n', 'green');

    // Ejecutar tests
    await testValidToken(token);
    await testExpiredToken(token); // Este espera 6 segundos

    const newToken = await testRefreshToken(refreshToken);

    if (newToken) {
      await testNewTokenValid(newToken);
      await testOldTokenStillInvalid(token);
    }

    await testInvalidRefreshToken();
    await testConcurrentExpiredRequests(token);

    log('\n========================================', 'cyan');
    log('  TESTS COMPLETADOS', 'cyan');
    log('========================================\n', 'cyan');

    logWarning('RECORDAR: Restaurar JWT_EXPIRES_IN a su valor normal (1h)');
  } catch (error) {
    log(`\nError fatal: ${error.message}`, 'red');
    log(error.stack, 'red');
    process.exit(1);
  }
}

// Verificar que fetch está disponible
if (typeof fetch === 'undefined') {
  console.error('Error: Este script requiere Node.js 18+ con fetch nativo');
  console.error('O instalar: npm install node-fetch');
  process.exit(1);
}

runTests();
