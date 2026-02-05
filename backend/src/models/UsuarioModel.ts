import { pool } from '../config/database';
import { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO } from '../types/Usuario.types';
import bcrypt from 'bcryptjs';

export class UsuarioModel {
  /**
   * Obtener todos los usuarios
   */
  static async findAll(): Promise<Omit<Usuario, 'password_hash'>[]> {
    const query = `
      SELECT id, username, rol, created_at, updated_at
      FROM usuarios
      ORDER BY username
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Obtener usuario por ID (sin password)
   */
  static async findById(id: string): Promise<Omit<Usuario, 'password_hash'> | null> {
    const query = `
      SELECT id, username, rol, created_at, updated_at
      FROM usuarios
      WHERE id = $1
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  /**
   * Obtener usuario por username (con password para autenticación)
   */
  static async findByUsername(username: string): Promise<Usuario | null> {
    const query = 'SELECT * FROM usuarios WHERE username = $1';
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  /**
   * Crear nuevo usuario
   */
  static async create(data: CreateUsuarioDTO): Promise<Omit<Usuario, 'password_hash'>> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const passwordHash = await bcrypt.hash(data.password, saltRounds);

    const query = `
      INSERT INTO usuarios (username, password_hash, rol)
      VALUES ($1, $2, $3)
      RETURNING id, username, rol, created_at, updated_at
    `;
    const result = await pool.query(query, [data.username, passwordHash, data.rol]);
    return result.rows[0];
  }

  /**
   * Actualizar usuario
   */
  static async update(id: string, data: UpdateUsuarioDTO): Promise<Omit<Usuario, 'password_hash'> | null> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (data.username !== undefined) {
      fields.push(`username = $${paramCount++}`);
      values.push(data.username);
    }

    if (data.password !== undefined) {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
      const passwordHash = await bcrypt.hash(data.password, saltRounds);
      fields.push(`password_hash = $${paramCount++}`);
      values.push(passwordHash);
    }

    if (data.rol !== undefined) {
      fields.push(`rol = $${paramCount++}`);
      values.push(data.rol);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    const query = `
      UPDATE usuarios
      SET ${fields.join(', ')}
      WHERE id = $${paramCount}
      RETURNING id, username, rol, created_at, updated_at
    `;

    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  /**
   * Eliminar usuario (verificar que no tenga movimientos registrados)
   */
  static async delete(id: string): Promise<boolean> {
    try {
      const query = 'DELETE FROM usuarios WHERE id = $1 RETURNING id';
      const result = await pool.query(query, [id]);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error: any) {
      // Si hay constraint violation (movimientos registrados), retornar false
      if (error.code === '23503') {
        return false;
      }
      throw error;
    }
  }

  /**
   * Verificar contraseña
   */
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(id: string, newPassword: string): Promise<boolean> {
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '10');
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    const query = `
      UPDATE usuarios
      SET password_hash = $1
      WHERE id = $2
      RETURNING id
    `;
    const result = await pool.query(query, [passwordHash, id]);
    return result.rowCount ? result.rowCount > 0 : false;
  }

  /**
   * Verificar si username ya existe
   */
  static async usernameExists(username: string, excludeId?: string): Promise<boolean> {
    const query = excludeId
      ? 'SELECT 1 FROM usuarios WHERE username = $1 AND id != $2'
      : 'SELECT 1 FROM usuarios WHERE username = $1';

    const params = excludeId ? [username, excludeId] : [username];
    const result = await pool.query(query, params);
    return result.rows.length > 0;
  }
}
