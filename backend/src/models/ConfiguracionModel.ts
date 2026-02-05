import { pool } from '../config/database';
import { Configuracion, CreateConfiguracionDTO, UpdateConfiguracionDTO } from '../types/Configuracion.types';

export class ConfiguracionModel {
  /**
   * Obtener todas las configuraciones
   */
  static async findAll(): Promise<Configuracion[]> {
    const query = 'SELECT * FROM configuracion ORDER BY clave';
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Obtener configuración por clave
   */
  static async findByClave(clave: string): Promise<Configuracion | null> {
    const query = 'SELECT * FROM configuracion WHERE clave = $1';
    const result = await pool.query(query, [clave]);
    return result.rows[0] || null;
  }

  /**
   * Obtener valor de configuración por clave
   */
  static async getValue(clave: string, defaultValue?: string): Promise<string | null> {
    const config = await this.findByClave(clave);
    return config ? config.valor : (defaultValue || null);
  }

  /**
   * Crear nueva configuración
   */
  static async create(data: CreateConfiguracionDTO): Promise<Configuracion> {
    const query = `
      INSERT INTO configuracion (clave, valor)
      VALUES ($1, $2)
      RETURNING *
    `;
    const result = await pool.query(query, [data.clave, data.valor]);
    return result.rows[0];
  }

  /**
   * Actualizar configuración
   */
  static async update(clave: string, data: UpdateConfiguracionDTO): Promise<Configuracion | null> {
    const query = `
      UPDATE configuracion
      SET valor = $1
      WHERE clave = $2
      RETURNING *
    `;
    const result = await pool.query(query, [data.valor, clave]);
    return result.rows[0] || null;
  }

  /**
   * Crear o actualizar configuración
   */
  static async upsert(clave: string, valor: string): Promise<Configuracion> {
    const query = `
      INSERT INTO configuracion (clave, valor)
      VALUES ($1, $2)
      ON CONFLICT (clave)
      DO UPDATE SET valor = EXCLUDED.valor
      RETURNING *
    `;
    const result = await pool.query(query, [clave, valor]);
    return result.rows[0];
  }

  /**
   * Eliminar configuración
   */
  static async delete(clave: string): Promise<boolean> {
    const query = 'DELETE FROM configuracion WHERE clave = $1 RETURNING clave';
    const result = await pool.query(query, [clave]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Obtener múltiples configuraciones
   */
  static async findMultiple(claves: string[]): Promise<Configuracion[]> {
    const query = 'SELECT * FROM configuracion WHERE clave = ANY($1)';
    const result = await pool.query(query, [claves]);
    return result.rows;
  }

  /**
   * Obtener configuraciones como objeto clave-valor
   */
  static async getAsObject(claves?: string[]): Promise<Record<string, string>> {
    const configs = claves ? await this.findMultiple(claves) : await this.findAll();
    return configs.reduce((acc, config) => {
      acc[config.clave] = config.valor;
      return acc;
    }, {} as Record<string, string>);
  }
}
