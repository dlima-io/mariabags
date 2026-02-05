import { UsuarioModel } from '../models/UsuarioModel';
import { Usuario, CreateUsuarioDTO, UpdateUsuarioDTO, RolUsuario } from '../types/Usuario.types';
import { AppError } from '../middleware/errorHandler';
import { sanitizeString } from '../utils/sanitizers';

export class UsuarioService {
  /**
   * Obtener todos los usuarios
   */
  static async getAllUsuarios(): Promise<Omit<Usuario, 'password_hash'>[]> {
    return UsuarioModel.findAll();
  }

  /**
   * Obtener usuario por ID
   */
  static async getUsuarioById(id: string): Promise<Omit<Usuario, 'password_hash'>> {
    const usuario = await UsuarioModel.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }
    return usuario;
  }

  /**
   * Crear nuevo usuario
   */
  static async createUsuario(data: CreateUsuarioDTO): Promise<Omit<Usuario, 'password_hash'>> {
    // Sanitizar username
    const sanitizedUsername = sanitizeString(data.username);

    // Validar username
    if (sanitizedUsername.length < 4 || sanitizedUsername.length > 50) {
      throw new AppError('El username debe tener entre 4 y 50 caracteres', 400);
    }

    // Verificar que el username no exista
    const exists = await UsuarioModel.usernameExists(sanitizedUsername);
    if (exists) {
      throw new AppError('El username ya está en uso', 409);
    }

    // Validar contraseña
    if (data.password.length < 8) {
      throw new AppError('La contraseña debe tener al menos 8 caracteres', 400);
    }

    // Validar rol
    if (!Object.values(RolUsuario).includes(data.rol)) {
      throw new AppError('Rol inválido', 400);
    }

    return UsuarioModel.create({
      username: sanitizedUsername,
      password: data.password,
      rol: data.rol
    });
  }

  /**
   * Actualizar usuario
   */
  static async updateUsuario(
    id: string,
    data: UpdateUsuarioDTO
  ): Promise<Omit<Usuario, 'password_hash'>> {
    // Verificar que el usuario existe
    const existingUsuario = await UsuarioModel.findById(id);
    if (!existingUsuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const sanitizedData: UpdateUsuarioDTO = {};

    // Sanitizar y validar username
    if (data.username !== undefined) {
      sanitizedData.username = sanitizeString(data.username);
      if (sanitizedData.username.length < 4 || sanitizedData.username.length > 50) {
        throw new AppError('El username debe tener entre 4 y 50 caracteres', 400);
      }

      // Verificar que el nuevo username no esté en uso
      const exists = await UsuarioModel.usernameExists(sanitizedData.username, id);
      if (exists) {
        throw new AppError('El username ya está en uso', 409);
      }
    }

    // Validar password
    if (data.password !== undefined) {
      if (data.password.length < 8) {
        throw new AppError('La contraseña debe tener al menos 8 caracteres', 400);
      }
      sanitizedData.password = data.password;
    }

    // Validar rol
    if (data.rol !== undefined) {
      if (!Object.values(RolUsuario).includes(data.rol)) {
        throw new AppError('Rol inválido', 400);
      }
      sanitizedData.rol = data.rol;
    }

    const updatedUsuario = await UsuarioModel.update(id, sanitizedData);
    if (!updatedUsuario) {
      throw new AppError('Error al actualizar usuario', 500);
    }

    return updatedUsuario;
  }

  /**
   * Eliminar usuario
   */
  static async deleteUsuario(id: string): Promise<void> {
    const usuario = await UsuarioModel.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    const deleted = await UsuarioModel.delete(id);
    if (!deleted) {
      throw new AppError(
        'No se puede eliminar el usuario porque tiene movimientos registrados',
        409
      );
    }
  }

  /**
   * Cambiar rol de usuario
   */
  static async changeRol(id: string, newRol: RolUsuario): Promise<Omit<Usuario, 'password_hash'>> {
    if (!Object.values(RolUsuario).includes(newRol)) {
      throw new AppError('Rol inválido', 400);
    }

    return this.updateUsuario(id, { rol: newRol });
  }

  /**
   * Cambiar contraseña (requiere contraseña actual)
   */
  static async changePassword(
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Obtener usuario
    const usuario = await UsuarioModel.findById(id);
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Obtener usuario con password hash
    const usuarioConPassword = await UsuarioModel.findByUsername(usuario.username);
    if (!usuarioConPassword) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const isValidPassword = await UsuarioModel.verifyPassword(
      currentPassword,
      usuarioConPassword.password_hash
    );

    if (!isValidPassword) {
      throw new AppError('La contraseña actual es incorrecta', 401);
    }

    // Validar nueva contraseña
    if (newPassword.length < 8) {
      throw new AppError('La nueva contraseña debe tener al menos 8 caracteres', 400);
    }

    const success = await UsuarioModel.changePassword(id, newPassword);
    if (!success) {
      throw new AppError('Error al cambiar contraseña', 500);
    }
  }
}
