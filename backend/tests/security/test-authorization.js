/**
 * Test de Seguridad - Autorización (RBAC)
 *
 * Este script prueba el control de acceso basado en roles
 *
 * PREREQUISITO: Crear usuarios de prueba:
 * - admin_test (rol: ADMIN, password: Admin123!)
 * - staff_test (rol: STAFF, password: Staff123!)
 *
 * Uso:
 * node tests/security/test-authorization.js
 */

const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Credenciales de prueba
const ADMIN_USER = {
  username: process.env.TEST_ADMIN_USER || 'admin_test',
  password: process.env.TEST_ADMIN_PASS || 'Admin123!'
};

const STAFF_USER = {
  username: process.env.TEST_STAFF_USER || 'staff_test',
  password: process.env.TEST_STAFF_PASS || 'Staff123!'
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
    return result.data.token;
  }

  throw new Error(`Login failed: ${result.data.error || 'Unknown error'}`);
}

// Test 1: ADMIN puede acceder a gestión de usuarios
async function testAdminAccessUsers(adminToken) {
  logTest('ADMIN puede acceder a gestión de usuarios');

  const result = await request('/usuarios', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  if (result.status === 200) {
    logPass('ADMIN accede a GET /usuarios (200)');
  } else {
    logFail(`Esperado 200, recibido ${result.status}`);
  }
}

// Test 2: STAFF NO puede acceder a gestión de usuarios
async function testStaffDeniedUsers(staffToken) {
  logTest('STAFF NO puede acceder a gestión de usuarios');

  const result = await request('/usuarios', {
    headers: {
      'Authorization': `Bearer ${staffToken}`
    }
  });

  if (result.status === 403) {
    logPass('STAFF bloqueado en GET /usuarios (403)');
  } else {
    logFail(`Esperado 403, recibido ${result.status}`);
  }
}

// Test 3: ADMIN puede crear usuarios
async function testAdminCreateUser(adminToken) {
  logTest('ADMIN puede crear usuarios');

  const newUser = {
    username: `test_user_${Date.now()}`,
    password: 'Test123!',
    rol: 'STAFF'
  };

  const result = await request('/usuarios', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify(newUser)
  });

  if (result.status === 200 || result.status === 201) {
    logPass('ADMIN crea usuario exitosamente');
  } else {
    logFail(`Esperado 200/201, recibido ${result.status}`);
  }
}

// Test 4: STAFF NO puede crear usuarios
async function testStaffDeniedCreateUser(staffToken) {
  logTest('STAFF NO puede crear usuarios');

  const newUser = {
    username: `test_user_${Date.now()}`,
    password: 'Test123!',
    rol: 'STAFF'
  };

  const result = await request('/usuarios', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${staffToken}`
    },
    body: JSON.stringify(newUser)
  });

  if (result.status === 403) {
    logPass('STAFF bloqueado en POST /usuarios (403)');
  } else {
    logFail(`Esperado 403, recibido ${result.status}`);
  }
}

// Test 5: STAFF puede acceder a clientes
async function testStaffAccessClients(staffToken) {
  logTest('STAFF puede acceder a clientes');

  const result = await request('/clientes', {
    headers: {
      'Authorization': `Bearer ${staffToken}`
    }
  });

  if (result.status === 200) {
    logPass('STAFF accede a GET /clientes (200)');
  } else {
    logFail(`Esperado 200, recibido ${result.status}`);
  }
}

// Test 6: ADMIN puede acceder a clientes
async function testAdminAccessClients(adminToken) {
  logTest('ADMIN puede acceder a clientes');

  const result = await request('/clientes', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });

  if (result.status === 200) {
    logPass('ADMIN accede a GET /clientes (200)');
  } else {
    logFail(`Esperado 200, recibido ${result.status}`);
  }
}

// Test 7: Token JWT contiene rol correcto
async function testTokenContainsRole(token, expectedRole) {
  logTest(`Token contiene rol ${expectedRole}`);

  const result = await request('/auth/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (result.ok && result.data.usuario && result.data.usuario.rol === expectedRole) {
    logPass(`Token contiene rol ${expectedRole} correctamente`);
  } else {
    logFail(`Rol esperado: ${expectedRole}, recibido: ${result.data.usuario?.rol}`);
  }
}

// Test 8: No se puede escalar privilegios cambiando token
async function testNoPrivilegeEscalation(staffToken) {
  logTest('No se puede escalar privilegios manipulando token');

  // Intentar acceder a ruta de ADMIN con token de STAFF
  const result = await request('/usuarios', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${staffToken}`
    },
    body: JSON.stringify({
      username: 'malicious_user',
      password: 'Test123!',
      rol: 'ADMIN'
    })
  });

  if (result.status === 403) {
    logPass('Escalación de privilegios bloqueada (403)');
  } else {
    logFail(`Esperado 403, recibido ${result.status}`);
  }
}

// Función principal
async function runTests() {
  log('\n========================================', 'cyan');
  log('  TESTS DE SEGURIDAD - AUTORIZACIÓN', 'cyan');
  log('========================================\n', 'cyan');

  log(`API URL: ${API_URL}\n`, 'yellow');

  try {
    // Login de usuarios
    log('Autenticando usuarios de prueba...', 'yellow');
    let adminToken, staffToken;

    try {
      adminToken = await login(ADMIN_USER.username, ADMIN_USER.password);
      log('✓ Admin autenticado', 'green');
    } catch (error) {
      logWarning(`No se pudo autenticar ADMIN: ${error.message}`);
      logWarning('Crear usuario: username=admin_test, password=Admin123!, rol=ADMIN');
    }

    try {
      staffToken = await login(STAFF_USER.username, STAFF_USER.password);
      log('✓ Staff autenticado', 'green');
    } catch (error) {
      logWarning(`No se pudo autenticar STAFF: ${error.message}`);
      logWarning('Crear usuario: username=staff_test, password=Staff123!, rol=STAFF');
    }

    if (!adminToken || !staffToken) {
      log('\nNo se pueden ejecutar todos los tests sin usuarios de prueba', 'red');
      process.exit(1);
    }

    // Ejecutar tests
    await testTokenContainsRole(adminToken, 'ADMIN');
    await testTokenContainsRole(staffToken, 'STAFF');
    await testAdminAccessUsers(adminToken);
    await testStaffDeniedUsers(staffToken);
    await testAdminCreateUser(adminToken);
    await testStaffDeniedCreateUser(staffToken);
    await testStaffAccessClients(staffToken);
    await testAdminAccessClients(adminToken);
    await testNoPrivilegeEscalation(staffToken);

    log('\n========================================', 'cyan');
    log('  TESTS COMPLETADOS', 'cyan');
    log('========================================\n', 'cyan');
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
