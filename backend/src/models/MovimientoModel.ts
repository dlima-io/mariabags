import { pool } from '../config/database';
import { Movimiento, CreateMovimientoDTO, TipoMovimiento } from '../types/Movimiento.types';

export class MovimientoModel {
  /**
   * Parsear movimiento para convertir monto a número
   */
  private static parseMovimiento(mov: any): Movimiento {
    return {
      ...mov,
      monto: parseFloat(mov.monto) || 0,
    };
  }

  /**
   * Parsear array de movimientos
   */
  private static parseMovimientos(movs: any[]): Movimiento[] {
    return movs.map(m => this.parseMovimiento(m));
  }
  /**
   * Obtener todos los movimientos de un cliente
   */
  static async findByClienteId(clienteId: string, limit?: number): Promise<Movimiento[]> {
    const query = limit
      ? `SELECT * FROM movimientos
         WHERE cliente_id = $1
         ORDER BY fecha DESC
         LIMIT $2`
      : `SELECT * FROM movimientos
         WHERE cliente_id = $1
         ORDER BY fecha DESC`;

    const params = limit ? [clienteId, limit] : [clienteId];
    const result = await pool.query(query, params);
    return this.parseMovimientos(result.rows);
  }

  /**
   * Obtener movimiento por ID
   */
  static async findById(id: string): Promise<Movimiento | null> {
    const query = 'SELECT * FROM movimientos WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] ? this.parseMovimiento(result.rows[0]) : null;
  }

  /**
   * Crear nuevo movimiento (con auditoría de usuario)
   */
  static async create(data: CreateMovimientoDTO, usuarioId: string): Promise<Movimiento> {
    const query = data.fecha
      ? `INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones, fecha)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`
      : `INSERT INTO movimientos (cliente_id, usuario_id, tipo, monto, observaciones)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`;

    const params = data.fecha
      ? [data.cliente_id, usuarioId, data.tipo, data.monto, data.observaciones || null, data.fecha]
      : [data.cliente_id, usuarioId, data.tipo, data.monto, data.observaciones || null];

    const result = await pool.query(query, params);
    return this.parseMovimiento(result.rows[0]);
  }

  /**
   * Actualizar observaciones de un movimiento
   */
  static async updateObservaciones(id: string, observaciones: string): Promise<Movimiento | null> {
    const query = `
      UPDATE movimientos
      SET observaciones = $1
      WHERE id = $2
      RETURNING *
    `;
    const result = await pool.query(query, [observaciones, id]);
    return result.rows[0] ? this.parseMovimiento(result.rows[0]) : null;
  }

  /**
   * Obtener movimientos por tipo
   */
  static async findByTipo(tipo: TipoMovimiento, limit?: number): Promise<Movimiento[]> {
    const query = limit
      ? `SELECT * FROM movimientos
         WHERE tipo = $1
         ORDER BY fecha DESC
         LIMIT $2`
      : `SELECT * FROM movimientos
         WHERE tipo = $1
         ORDER BY fecha DESC`;

    const params = limit ? [tipo, limit] : [tipo];
    const result = await pool.query(query, params);
    return this.parseMovimientos(result.rows);
  }

  /**
   * Obtener movimientos en un rango de fechas
   */
  static async findByDateRange(
    fechaInicio: Date,
    fechaFin: Date,
    clienteId?: string
  ): Promise<Movimiento[]> {
    const query = clienteId
      ? `SELECT * FROM movimientos
         WHERE fecha BETWEEN $1 AND $2
           AND cliente_id = $3
         ORDER BY fecha DESC`
      : `SELECT * FROM movimientos
         WHERE fecha BETWEEN $1 AND $2
         ORDER BY fecha DESC`;

    const params = clienteId ? [fechaInicio, fechaFin, clienteId] : [fechaInicio, fechaFin];
    const result = await pool.query(query, params);
    return this.parseMovimientos(result.rows);
  }

  /**
   * Obtener últimos N movimientos globales
   */
  static async findRecent(limit: number = 20): Promise<Movimiento[]> {
    const query = `
      SELECT * FROM movimientos
      ORDER BY fecha DESC
      LIMIT $1
    `;
    const result = await pool.query(query, [limit]);
    return this.parseMovimientos(result.rows);
  }

  /**
   * Obtener movimientos con información del cliente
   */
  static async findWithClienteInfo(limit?: number): Promise<any[]> {
    const query = limit
      ? `SELECT
          m.*,
          c.nombre,
          c.apellido,
          c.telefono
        FROM movimientos m
        INNER JOIN clientes c ON m.cliente_id = c.id
        ORDER BY m.fecha DESC
        LIMIT $1`
      : `SELECT
          m.*,
          c.nombre,
          c.apellido,
          c.telefono
        FROM movimientos m
        INNER JOIN clientes c ON m.cliente_id = c.id
        ORDER BY m.fecha DESC`;

    const params = limit ? [limit] : [];
    const result = await pool.query(query, params);

    // Parsear monto a número
    return result.rows.map(row => ({
      ...row,
      monto: parseFloat(row.monto) || 0,
    }));
  }

  /**
   * Obtener estadísticas de movimientos
   */
  static async getEstadisticas(clienteId?: string): Promise<any> {
    const query = clienteId
      ? `SELECT
          COUNT(*) as total_movimientos,
          COALESCE(SUM(CASE WHEN tipo = 'DEBITO' THEN monto ELSE 0 END), 0) as total_debitos,
          COALESCE(SUM(CASE WHEN tipo = 'CREDITO' THEN monto ELSE 0 END), 0) as total_creditos,
          COALESCE(SUM(CASE WHEN tipo = 'AJUSTE' THEN monto ELSE 0 END), 0) as total_ajustes,
          COALESCE(
            SUM(CASE
              WHEN tipo = 'CREDITO'
                AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
              THEN monto
              ELSE 0
            END),
          0) as pagos_del_mes,
          MIN(fecha) as primer_movimiento,
          MAX(fecha) as ultimo_movimiento
        FROM movimientos
        WHERE cliente_id = $1`
      : `SELECT
          COUNT(*) as total_movimientos,
          COALESCE(SUM(CASE WHEN tipo = 'DEBITO' THEN monto ELSE 0 END), 0) as total_debitos,
          COALESCE(SUM(CASE WHEN tipo = 'CREDITO' THEN monto ELSE 0 END), 0) as total_creditos,
          COALESCE(SUM(CASE WHEN tipo = 'AJUSTE' THEN monto ELSE 0 END), 0) as total_ajustes,
          COALESCE(
            SUM(CASE
              WHEN tipo = 'CREDITO'
                AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
                AND EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
              THEN monto
              ELSE 0
            END),
          0) as pagos_del_mes,
          MIN(fecha) as primer_movimiento,
          MAX(fecha) as ultimo_movimiento
        FROM movimientos`;

    const params = clienteId ? [clienteId] : [];
    const result = await pool.query(query, params);

    // Parsear montos a números y transformar a camelCase
    const stats = result.rows[0];
    return {
      total_movimientos: parseInt(stats.total_movimientos) || 0,
      total_debitos: parseFloat(stats.total_debitos) || 0,
      total_creditos: parseFloat(stats.total_creditos) || 0,
      total_ajustes: parseFloat(stats.total_ajustes) || 0,
      pagosDelMes: parseFloat(stats.pagos_del_mes) || 0,
      primer_movimiento: stats.primer_movimiento,
      ultimo_movimiento: stats.ultimo_movimiento,
    };
  }

  /**
   * Obtener pagos del mes actual con información del cliente
   */
  static async getPagosDelMes(): Promise<any[]> {
    const query = `
      SELECT
        m.id,
        m.monto,
        m.fecha,
        m.observaciones,
        c.id as cliente_id,
        c.nombre,
        c.apellido,
        c.telefono
      FROM movimientos m
      INNER JOIN clientes c ON m.cliente_id = c.id
      WHERE m.tipo = 'CREDITO'
        AND EXTRACT(YEAR FROM m.fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
        AND EXTRACT(MONTH FROM m.fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
      ORDER BY m.fecha DESC
    `;

    const result = await pool.query(query);

    // Parsear monto a número
    return result.rows.map(row => ({
      ...row,
      monto: parseFloat(row.monto) || 0,
    }));
  }

  /**
   * Eliminar movimiento (solo para correcciones de errores - usar con precaución)
   */
  static async delete(id: string): Promise<boolean> {
    const query = 'DELETE FROM movimientos WHERE id = $1 RETURNING id';
    const result = await pool.query(query, [id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }
}
