/**
 * Test de Seguridad - Autenticación
 *
 * Este script prueba los mecanismos de autenticación del API
 *
 * Uso:
 * node tests/security/test-authentication.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

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

// Test 1: Login con credenciales incorrectas
async function testInvalidCredentials() {
  logTest('Login con credenciales incorrectas');

  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      username: 'usuario_inexistente',
      password: 'password_incorrecta'
    })
  });

  if (result.status === 401) {
    logPass('Rechaza credenciales incorrectas (401)');
  } else {
    logFail(`Esperado 401, recibido ${result.status}`);
  }

  if (result.data.error && !result.data.error.includes('username')) {
    logPass('No revela si el usuario existe');
  } else {
    logFail('Podría revelar información sobre usuarios');
  }
}

// Test 2: Login sin credenciales
async function testMissingCredentials() {
  logTest('Login sin credenciales');

  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({})
  });

  if (result.status === 400) {
    logPass('Rechaza request sin credenciales (400)');
  } else {
    logFail(`Esperado 400, recibido ${result.status}`);
  }
}

// Test 3: Acceso a ruta protegida sin token
async function testProtectedRouteWithoutToken() {
  logTest('Acceso a ruta protegida sin token');

  const result = await request('/clientes');

  if (result.status === 401) {
    logPass('Rechaza acceso sin token (401)');
  } else {
    logFail(`Esperado 401, recibido ${result.status}`);
  }
}

// Test 4: Acceso con token inválido
async function testInvalidToken() {
  logTest('Acceso con token inválido');

  const result = await request('/clientes', {
    headers: {
      'Authorization': 'Bearer token_invalido_12345'
    }
  });

  if (result.status === 401) {
    logPass('Rechaza token inválido (401)');
  } else {
    logFail(`Esperado 401, recibido ${result.status}`);
  }
}

// Test 5: Acceso con token mal formateado
async function testMalformedToken() {
  logTest('Acceso con token mal formateado');

  const result = await request('/clientes', {
    headers: {
      'Authorization': 'InvalidFormat token123'
    }
  });

  if (result.status === 401) {
    logPass('Rechaza token mal formateado (401)');
  } else {
    logFail(`Esperado 401, recibido ${result.status}`);
  }
}

// Test 6: Refresh token sin token
async function testRefreshWithoutToken() {
  logTest('Refresh token sin proporcionar token');

  const result = await request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({})
  });

  if (result.status === 400) {
    logPass('Rechaza refresh sin token (400)');
  } else {
    logFail(`Esperado 400, recibido ${result.status}`);
  }
}

// Test 7: Refresh token inválido
async function testInvalidRefreshToken() {
  logTest('Refresh con token inválido');

  const result = await request('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({
      refreshToken: 'token_invalido'
    })
  });

  if (result.status === 400 || result.status === 401) {
    logPass('Rechaza refresh token inválido');
  } else {
    logFail(`Esperado 400/401, recibido ${result.status}`);
  }
}

// Test 8: Rate Limiting en login
async function testLoginRateLimit() {
  logTest('Rate Limiting en login (máximo 5 intentos)');

  let blocked = false;

  for (let i = 1; i <= 7; i++) {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: `test_ratelimit_${Date.now()}`,
        password: 'test123'
      })
    });

    if (result.status === 429) {
      blocked = true;
      logPass(`Bloqueado en intento ${i} (429 Too Many Requests)`);
      if (result.data.retryAfter) {
        logInfo(`Retry after: ${result.data.retryAfter} segundos`);
      }
      break;
    }
  }

  if (!blocked) {
    logFail('Rate limiting no está funcionando correctamente');
  }
}

// Test 9: SQL Injection en login
async function testSQLInjection() {
  logTest('Intento de SQL Injection en login');

  const sqlPayloads = [
    "admin' OR '1'='1",
    "admin'--",
    "admin' OR 1=1--",
    "'; DROP TABLE usuarios; --"
  ];

  let vulnerable = false;

  for (const payload of sqlPayloads) {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: payload,
        password: 'test'
      })
    });

    if (result.status === 200 || result.status === 500) {
      vulnerable = true;
      logFail(`Posible vulnerabilidad con payload: ${payload}`);
    }
  }

  if (!vulnerable) {
    logPass('Resistente a payloads básicos de SQL injection');
  }
}

// Test 10: XSS en campos de entrada
async function testXSSInLogin() {
  logTest('Intento de XSS en login');

  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '<img src=x onerror=alert("XSS")>',
    'javascript:alert("XSS")'
  ];

  let vulnerable = false;

  for (const payload of xssPayloads) {
    const result = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        username: payload,
        password: 'test'
      })
    });

    // Si el payload se refleja sin escapar, es vulnerable
    if (result.data.error && result.data.error.includes('<script>')) {
      vulnerable = true;
      logFail(`Posible XSS, payload reflejado: ${payload}`);
    }
  }

  if (!vulnerable) {
    logPass('Campos sanitizados correctamente contra XSS');
  }
}

// Función principal
async function runTests() {
  log('\n========================================', 'cyan');
  log('  TESTS DE SEGURIDAD - AUTENTICACIÓN', 'cyan');
  log('========================================\n', 'cyan');

  log(`API URL: ${API_URL}\n`, 'yellow');

  try {
    await testInvalidCredentials();
    await testMissingCredentials();
    await testProtectedRouteWithoutToken();
    await testInvalidToken();
    await testMalformedToken();
    await testRefreshWithoutToken();
    await testInvalidRefreshToken();
    await testLoginRateLimit();
    await testSQLInjection();
    await testXSSInLogin();

    log('\n========================================', 'cyan');
    log('  TESTS COMPLETADOS', 'cyan');
    log('========================================\n', 'cyan');
  } catch (error) {
    log(`\nError fatal: ${error.message}`, 'red');
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
