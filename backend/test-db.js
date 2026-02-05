// Script de diagnóstico de base de datos
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mariabags',
  user: 'postgres',
  password: '2412'
});

async function testDatabase() {
  try {
    console.log('=== Test de Base de Datos María Bags ===\n');

    // 1. Verificar conexión
    console.log('1. Verificando conexión a PostgreSQL...');
    const testConn = await pool.query('SELECT NOW()');
    console.log('✓ Conexión exitosa:', testConn.rows[0].now);
    console.log('');

    // 2. Verificar usuarios
    console.log('2. Verificando usuarios en la base de datos...');
    const usuarios = await pool.query('SELECT id, username, rol, password_hash FROM usuarios');
    console.log(`✓ Usuarios encontrados: ${usuarios.rows.length}`);

    if (usuarios.rows.length === 0) {
      console.log('❌ ERROR: No hay usuarios en la base de datos!');
      console.log('   Debes ejecutar el seed: psql -U postgres -d mariabags -f backend/src/db/seeds/001_initial_data.sql');
    } else {
      usuarios.rows.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.username} (${u.rol})`);
        console.log(`      ID: ${u.id}`);
        console.log(`      Hash: ${u.password_hash.substring(0, 30)}...`);
      });
    }
    console.log('');

    // 3. Verificar si existe usuario 'admin'
    console.log('3. Buscando usuario "admin"...');
    const admin = await pool.query('SELECT * FROM usuarios WHERE username = $1', ['admin']);

    if (admin.rows.length === 0) {
      console.log('❌ ERROR: Usuario "admin" no encontrado!');
      console.log('   Ejecuta el seed para crear el usuario.');
    } else {
      console.log('✓ Usuario "admin" encontrado');
      const adminUser = admin.rows[0];
      console.log(`   ID: ${adminUser.id}`);
      console.log(`   Rol: ${adminUser.rol}`);
      console.log(`   Hash: ${adminUser.password_hash}`);
      console.log('');

      // 4. Probar password
      console.log('4. Probando password "admin123"...');
      const passwordToTest = 'admin123';
      const isValid = await bcrypt.compare(passwordToTest, adminUser.password_hash);

      if (isValid) {
        console.log('✓ Password correcta! El hash coincide con "admin123"');
      } else {
        console.log('❌ ERROR: Password incorrecta! El hash NO coincide con "admin123"');
        console.log('   Esto significa que el hash en la base de datos es incorrecto.');

        // Generar hash correcto
        console.log('\n5. Generando hash correcto para "admin123"...');
        const correctHash = await bcrypt.hash('admin123', 12);
        console.log('   Hash correcto (bcrypt rounds=12):');
        console.log(`   ${correctHash}`);
        console.log('\n   Para arreglar, ejecuta en psql:');
        console.log(`   UPDATE usuarios SET password_hash = '${correctHash}' WHERE username = 'admin';`);
      }
    }
    console.log('');

    // 5. Verificar clientes
    console.log('6. Verificando clientes...');
    const clientes = await pool.query('SELECT COUNT(*) FROM clientes');
    console.log(`✓ Clientes en DB: ${clientes.rows[0].count}`);
    console.log('');

    // 6. Verificar movimientos
    console.log('7. Verificando movimientos...');
    const movimientos = await pool.query('SELECT COUNT(*) FROM movimientos');
    console.log(`✓ Movimientos en DB: ${movimientos.rows[0].count}`);
    console.log('');

    console.log('=== Diagnóstico completado ===');

  } catch (error) {
    console.error('ERROR:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n❌ No se puede conectar a PostgreSQL.');
      console.log('   Verifica que PostgreSQL esté corriendo.');
    } else if (error.code === '3D000') {
      console.log('\n❌ La base de datos "mariabags" no existe.');
      console.log('   Ejecuta: psql -U postgres -c "CREATE DATABASE mariabags;"');
    } else if (error.code === '42P01') {
      console.log('\n❌ Las tablas no existen.');
      console.log('   Ejecuta la migración: psql -U postgres -d mariabags -f backend/src/db/migrations/001_initial_schema.sql');
    }
  } finally {
    await pool.end();
  }
}

testDatabase();
