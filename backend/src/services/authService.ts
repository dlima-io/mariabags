import jwt from 'jsonwebtoken';
import { UsuarioModel } from '../models/UsuarioModel';
import { LoginDTO, AuthResponse, RolUsuario } from '../types/Usuario.types';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  /**
   * Login de usuario
   */
  static async login(data: LoginDTO): Promise<AuthResponse> {
    // Buscar usuario por username
    const usuario = await UsuarioModel.findByUsername(data.username);
    if (!usuario) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Verificar contraseña
    const isPasswordValid = await UsuarioModel.verifyPassword(data.password, usuario.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Credenciales inválidas', 401);
    }

    // Generar tokens
    const tokens = this.generateTokens(usuario.id, usuario.username, usuario.rol);

    return {
      ...tokens,
      usuario: {
        id: usuario.id,
        username: usuario.username,
        rol: usuario.rol
      }
    };
  }

  /**
   * Generar JWT token y refresh token
   */
  private static generateTokens(
    id: string,
    username: string,
    rol: RolUsuario
  ): { token: string; refreshToken: string } {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no configurado');
    }

    const payload = { id, username, rol };

    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
      algorithm: 'HS256',
      issuer: 'mariabags-api'
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(payload, jwtSecret, {
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
      algorithm: 'HS256',
      issuer: 'mariabags-api'
    } as jwt.SignOptions);

    return { token, refreshToken };
  }

  /**
   * Renovar token usando refresh token
   */
  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no configurado');
    }

    try {
      // Verificar refresh token con algoritmo específico
      const decoded = jwt.verify(refreshToken, jwtSecret, {
        algorithms: ['HS256'],
        issuer: 'mariabags-api'
      }) as {
        id: string;
        username: string;
        rol: RolUsuario;
      };

      // Verificar que el usuario aún existe
      const usuario = await UsuarioModel.findById(decoded.id);
      if (!usuario) {
        throw new AppError('Usuario no encontrado', 401);
      }

      // Generar nuevos tokens
      const tokens = this.generateTokens(decoded.id, decoded.username, decoded.rol);

      return {
        ...tokens,
        usuario: {
          id: decoded.id,
          username: decoded.username,
          rol: decoded.rol
        }
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token inválido o expirado', 401);
      }
      throw error;
    }
  }

  /**
   * Verificar token
   */
  static verifyToken(token: string): { id: string; username: string; rol: RolUsuario } {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET no configurado');
    }

    try {
      const decoded = jwt.verify(token, jwtSecret, {
        algorithms: ['HS256'],
        issuer: 'mariabags-api'
      }) as {
        id: string;
        username: string;
        rol: RolUsuario;
      };
      return decoded;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expirado', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Token inválido', 401);
      }
      throw error;
    }
  }

  /**
   * Cambiar contraseña
   */
  static async changePassword(
    usuarioId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Obtener usuario con password
    const usuario = await UsuarioModel.findByUsername(
      (await UsuarioModel.findById(usuarioId))!.username
    );
    if (!usuario) {
      throw new AppError('Usuario no encontrado', 404);
    }

    // Verificar contraseña actual
    const isPasswordValid = await UsuarioModel.verifyPassword(currentPassword, usuario.password_hash);
    if (!isPasswordValid) {
      throw new AppError('Contraseña actual incorrecta', 401);
    }

    // Validar nueva contraseña
    if (newPassword.length < 8) {
      throw new AppError('La nueva contraseña debe tener al menos 8 caracteres', 400);
    }

    // Cambiar contraseña
    const success = await UsuarioModel.changePassword(usuarioId, newPassword);
    if (!success) {
      throw new AppError('Error al cambiar contraseña', 500);
    }
  }
}
