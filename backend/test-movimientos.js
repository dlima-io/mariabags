const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mariabags',
  user: 'postgres',
  password: '2412'
});

async function testMovimientos() {
  try {
    const result = await pool.query('SELECT id, tipo, monto FROM movimientos LIMIT 3');

    console.log('=== Test de Movimientos ===\n');
    console.log(`Total: ${result.rows.length} movimientos\n`);

    result.rows.forEach((m, i) => {
      console.log(`${i + 1}. Tipo: ${m.tipo}`);
      console.log(`   Monto: ${m.monto}`);
      console.log(`   Tipo de dato: ${typeof m.monto}`);
      console.log('');
    });

  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await pool.end();
  }
}

testMovimientos();
