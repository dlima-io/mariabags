// Script para diagnosticar problema de saldos
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'mariabags',
  user: 'postgres',
  password: '2412'
});

async function testSaldos() {
  try {
    console.log('=== Diagnóstico de Saldos ===\n');

    // 1. Verificar vista materializada
    console.log('1. Consultando vista materializada saldos_clientes...');
    const saldos = await pool.query('SELECT * FROM saldos_clientes LIMIT 5');
    console.log(`✓ Registros encontrados: ${saldos.rows.length}\n`);

    if (saldos.rows.length > 0) {
      console.log('Primeros 5 clientes:');
      saldos.rows.forEach((cliente, i) => {
        console.log(`${i + 1}. ${cliente.nombre} ${cliente.apellido}`);
        console.log(`   ID: ${cliente.cliente_id}`);
        console.log(`   Saldo: ${cliente.saldo} (tipo: ${typeof cliente.saldo})`);
        console.log(`   Total débitos: ${cliente.total_debitos}`);
        console.log(`   Total créditos: ${cliente.total_creditos}`);
        console.log(`   Total ajustes: ${cliente.total_ajustes}`);
        console.log('');
      });
    } else {
      console.log('❌ La vista saldos_clientes está vacía!');
      console.log('   Esto puede significar que:');
      console.log('   1. No hay clientes en la DB');
      console.log('   2. La vista no se creó correctamente');
      console.log('   3. La vista no se refrescó\n');

      // Verificar si hay clientes
      const clientesCount = await pool.query('SELECT COUNT(*) FROM clientes WHERE activo = true');
      console.log(`   Clientes activos en tabla clientes: ${clientesCount.rows[0].count}`);

      // Refrescar vista materializada
      console.log('\n2. Intentando refrescar vista materializada...');
      await pool.query('REFRESH MATERIALIZED VIEW saldos_clientes');
      console.log('✓ Vista refrescada');

      // Volver a consultar
      console.log('\n3. Consultando nuevamente...');
      const saldosNuevos = await pool.query('SELECT * FROM saldos_clientes LIMIT 5');
      console.log(`✓ Registros después de refresh: ${saldosNuevos.rows.length}\n`);

      if (saldosNuevos.rows.length > 0) {
        saldosNuevos.rows.forEach((cliente, i) => {
          console.log(`${i + 1}. ${cliente.nombre} ${cliente.apellido} - Saldo: ${cliente.saldo}`);
        });
      }
    }

    // 4. Verificar movimientos
    console.log('\n4. Verificando movimientos...');
    const movimientos = await pool.query(`
      SELECT
        cliente_id,
        COUNT(*) as cantidad,
        SUM(CASE WHEN tipo = 'DEBITO' THEN monto ELSE 0 END) as debitos,
        SUM(CASE WHEN tipo = 'CREDITO' THEN monto ELSE 0 END) as creditos,
        SUM(CASE WHEN tipo = 'AJUSTE' THEN monto ELSE 0 END) as ajustes
      FROM movimientos
      GROUP BY cliente_id
      LIMIT 5
    `);

    if (movimientos.rows.length > 0) {
      console.log('Movimientos por cliente:');
      movimientos.rows.forEach((mov, i) => {
        const saldoCalculado = mov.debitos - mov.creditos + mov.ajustes;
        console.log(`${i + 1}. Cliente ID: ${mov.cliente_id}`);
        console.log(`   Movimientos: ${mov.cantidad}`);
        console.log(`   Débitos: $${mov.debitos}`);
        console.log(`   Créditos: $${mov.creditos}`);
        console.log(`   Ajustes: $${mov.ajustes}`);
        console.log(`   Saldo calculado: $${saldoCalculado}`);
        console.log('');
      });
    } else {
      console.log('❌ No hay movimientos en la base de datos!');
      console.log('   Todos los clientes tendrán saldo $0');
    }

    console.log('\n=== Diagnóstico completado ===');

  } catch (error) {
    console.error('ERROR:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testSaldos();
