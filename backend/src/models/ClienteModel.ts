import { pool } from '../config/database';
import { Cliente, ClienteConSaldo, CreateClienteDTO, UpdateClienteDTO } from '../types/Cliente.types';

export class ClienteModel {
  /**
   * Obtener todos los clientes (solo activos por defecto)
   */
  static async findAll(includeInactive: boolean = false): Promise<Cliente[]> {
    const query = includeInactive
      ? 'SELECT * FROM clientes ORDER BY apellido, nombre'
      : 'SELECT * FROM clientes WHERE activo = TRUE ORDER BY apellido, nombre';

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Obtener cliente por ID
   */
  static async findById(id: string): Promise<Cliente | null> {
    const query = 'SELECT * FROM clientes WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Obtener cliente por teléfono
   */
  static async findByTelefono(telefono: string): Promise<Cliente | null> {
    const query = 'SELECT * FROM clientes WHERE telefono = $1';
    const result = await pool.query(query, [telefono]);
    return result.rows[0] || null;
  }

  /**
   * Crear nuevo cliente
   */
  static async create(data: CreateClienteDTO): Promise<Cliente> {
    const query = `
      INSERT INTO clientes (nombre, apellido, telefono)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [data.nombre, data.apellido, data.telefono]);
    return result.rows[0];
  }

  /**
   * Actualizar cliente
   */
  static async update(id: string, data: UpdateClienteDTO): Promise<Cliente | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.nombre !== undefined) {
      fields.push(`nombre = $${paramCount++}`);
      values.push(data.nombre);
    }
    if (data.apellido !== undefined) {
      fields.push(`apellido = $${paramCount++}`);
      values.push(data.apellido);
    }
    if (data.telefono !== undefined) {
      fields.push(`telefono = $${paramCount++}`);
      values.push(data.telefono);
    }
    if (data.activo !== undefined) {
      fields.push(`activo = $${paramCount++}`);
      values.push(data.activo);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE clientes
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Desactivar cliente (soft delete)
   */
  static async deactivate(id: string): Promise<Cliente | null> {
    const query = `
      UPDATE clientes
      SET activo = FALSE
      WHERE id = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Obtener cliente con saldo calculado en tiempo real
   */
  static async findByIdWithSaldo(id: string): Promise<ClienteConSaldo | null> {
    const query = `
      SELECT
        c.id,
        c.nombre,
        c.apellido,
        c.telefono,
        c.activo,
        c.fecha_creacion,
        COALESCE(
          SUM(CASE WHEN m.tipo = 'DEBITO' THEN m.monto ELSE 0 END) -
          SUM(CASE WHEN m.tipo = 'CREDITO' THEN m.monto ELSE 0 END) +
          SUM(CASE WHEN m.tipo = 'AJUSTE' THEN m.monto ELSE 0 END),
          0
        ) as saldo,
        COALESCE(SUM(CASE WHEN m.tipo = 'DEBITO' THEN m.monto ELSE 0 END), 0) as total_debitos,
        COALESCE(SUM(CASE WHEN m.tipo = 'CREDITO' THEN m.monto ELSE 0 END), 0) as total_creditos,
        COALESCE(SUM(CASE WHEN m.tipo = 'AJUSTE' THEN m.monto ELSE 0 END), 0) as total_ajustes,
        MAX(m.fecha) as ultima_operacion,
        COUNT(m.id) as cantidad_movimientos
      FROM clientes c
      LEFT JOIN movimientos m ON c.id = m.cliente_id
      WHERE c.id = $1
      GROUP BY c.id, c.nombre, c.apellido, c.telefono, c.activo, c.fecha_creacion
    `;
    const result = await pool.query(query, [id]);
    const cliente = result.rows[0];

    if (!cliente) return null;

    // Convertir saldo a número
    return {
      ...cliente,
      saldo: parseFloat(cliente.saldo) || 0,
      total_debitos: parseFloat(cliente.total_debitos) || 0,
      total_creditos: parseFloat(cliente.total_creditos) || 0,
      total_ajustes: parseFloat(cliente.total_ajustes) || 0,
      cantidad_movimientos: parseInt(cliente.cantidad_movimientos) || 0,
    };
  }

  /**
   * Obtener todos los clientes con saldo
   */
  static async findAllWithSaldo(includeInactive: boolean = false): Promise<ClienteConSaldo[]> {
    const query = includeInactive
      ? `SELECT
          cliente_id as id,
          nombre,
          apellido,
          telefono,
          activo,
          saldo,
          ultima_operacion,
          cantidad_movimientos
        FROM saldos_clientes
        ORDER BY apellido, nombre`
      : `SELECT
          cliente_id as id,
          nombre,
          apellido,
          telefono,
          activo,
          saldo,
          ultima_operacion,
          cantidad_movimientos
        FROM saldos_clientes
        WHERE activo = TRUE
        ORDER BY apellido, nombre`;

    const result = await pool.query(query);

    // Convertir saldos a números
    return result.rows.map(cliente => ({
      ...cliente,
      saldo: parseFloat(cliente.saldo) || 0,
      total_debitos: parseFloat(cliente.total_debitos) || 0,
      total_creditos: parseFloat(cliente.total_creditos) || 0,
      total_ajustes: parseFloat(cliente.total_ajustes) || 0,
    }));
  }

  /**
   * Obtener clientes con deuda (saldo > 0)
   */
  static async findWithDebt(): Promise<ClienteConSaldo[]> {
    const query = `
      SELECT
        cliente_id as id,
        nombre,
        apellido,
        telefono,
        activo,
        saldo,
        ultima_operacion,
        cantidad_movimientos
      FROM saldos_clientes
      WHERE activo = TRUE AND saldo > 0
      ORDER BY saldo DESC
    `;
    const result = await pool.query(query);

    // Convertir saldos a números
    return result.rows.map(cliente => ({
      ...cliente,
      saldo: parseFloat(cliente.saldo) || 0,
      total_debitos: parseFloat(cliente.total_debitos) || 0,
      total_creditos: parseFloat(cliente.total_creditos) || 0,
      total_ajustes: parseFloat(cliente.total_ajustes) || 0,
    }));
  }

  /**
   * Obtener clientes con mora (> X días sin pagar y con deuda)
   */
  static async findWithMora(dias: number = 30): Promise<ClienteConSaldo[]> {
    const query = `
      SELECT
        cliente_id as id,
        nombre,
        apellido,
        telefono,
        activo,
        saldo,
        ultima_operacion,
        cantidad_movimientos,
        EXTRACT(DAY FROM NOW() - ultima_operacion)::INTEGER as dias_mora
      FROM saldos_clientes
      WHERE activo = TRUE
        AND saldo > 0
        AND ultima_operacion < NOW() - INTERVAL '1 day' * $1
      ORDER BY dias_mora DESC
    `;
    const result = await pool.query(query, [dias]);

    // Convertir saldos a números
    return result.rows.map(cliente => ({
      ...cliente,
      saldo: parseFloat(cliente.saldo) || 0,
      total_debitos: parseFloat(cliente.total_debitos) || 0,
      total_creditos: parseFloat(cliente.total_creditos) || 0,
      total_ajustes: parseFloat(cliente.total_ajustes) || 0,
    }));
  }

  /**
   * Obtener clientes con deuda incluyendo información del último pago
   */
  static async findWithDebtAndLastPayment(): Promise<any[]> {
    const query = `
      SELECT
        c.id,
        c.nombre,
        c.apellido,
        c.telefono,
        c.activo,
        sc.saldo,
        sc.ultima_operacion,
        (
          SELECT m.fecha
          FROM movimientos m
          WHERE m.cliente_id = c.id
            AND m.tipo = 'CREDITO'
          ORDER BY m.fecha DESC
          LIMIT 1
        ) as ultimo_pago,
        CASE
          WHEN (
            SELECT m.fecha
            FROM movimientos m
            WHERE m.cliente_id = c.id
              AND m.tipo = 'CREDITO'
            ORDER BY m.fecha DESC
            LIMIT 1
          ) IS NULL THEN NULL
          ELSE EXTRACT(DAY FROM NOW() - (
            SELECT m.fecha
            FROM movimientos m
            WHERE m.cliente_id = c.id
              AND m.tipo = 'CREDITO'
            ORDER BY m.fecha DESC
            LIMIT 1
          ))::INTEGER
        END as dias_sin_pagar
      FROM clientes c
      INNER JOIN saldos_clientes sc ON c.id = sc.cliente_id
      WHERE c.activo = TRUE
        AND sc.saldo > 0
      ORDER BY sc.saldo DESC
    `;

    const result = await pool.query(query);

    // Convertir saldos a números
    return result.rows.map(cliente => ({
      ...cliente,
      saldo: parseFloat(cliente.saldo) || 0,
    }));
  }

  /**
   * Buscar clientes por nombre, apellido o teléfono (con saldo)
   */
  static async search(searchTerm: string, includeInactive: boolean = false): Promise<ClienteConSaldo[]> {
    const searchPattern = `%${searchTerm}%`;
    const query = includeInactive
      ? `SELECT
          cliente_id as id,
          nombre,
          apellido,
          telefono,
          activo,
          saldo,
          ultima_operacion,
          cantidad_movimientos
         FROM saldos_clientes
         WHERE nombre ILIKE $1
            OR apellido ILIKE $1
            OR telefono ILIKE $1
         ORDER BY apellido, nombre`
      : `SELECT
          cliente_id as id,
          nombre,
          apellido,
          telefono,
          activo,
          saldo,
          ultima_operacion,
          cantidad_movimientos
         FROM saldos_clientes
         WHERE activo = TRUE
           AND (nombre ILIKE $1 OR apellido ILIKE $1 OR telefono ILIKE $1)
         ORDER BY apellido, nombre`;

    const result = await pool.query(query, [searchPattern]);

    // Convertir saldos a números
    return result.rows.map(cliente => ({
      ...cliente,
      saldo: parseFloat(cliente.saldo) || 0,
      total_debitos: parseFloat(cliente.total_debitos) || 0,
      total_creditos: parseFloat(cliente.total_creditos) || 0,
      total_ajustes: parseFloat(cliente.total_ajustes) || 0,
    }));
  }
}
