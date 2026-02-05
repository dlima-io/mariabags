import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { AuthService } from '../services/authService';
import { LoginDTO } from '../types/Usuario.types';

export class AuthController {
  /**
   * POST /api/auth/login
   * Iniciar sesión
   */
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const data: LoginDTO = req.body;
      const result = await AuthService.login(data);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * POST /api/auth/refresh
   * Renovar token
   */
  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        res.status(400).json({ error: 'Refresh token requerido' });
        return;
      }

      const result = await AuthService.refreshToken(refreshToken);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * POST /api/auth/change-password
   * Cambiar contraseña
   */
  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;
      const usuarioId = req.usuario!.id;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Contraseña actual y nueva son requeridas' });
        return;
      }

      await AuthService.changePassword(usuarioId, currentPassword, newPassword);
      res.json({ message: 'Contraseña cambiada exitosamente' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/auth/me
   * Obtener información del usuario autenticado
   */
  static async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      res.json({
        usuario: req.usuario
      });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * POST /api/auth/verify
   * Verificar token
   */
  static async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { token } = req.body;
      if (!token) {
        res.status(400).json({ error: 'Token requerido' });
        return;
      }

      const decoded = AuthService.verifyToken(token);
      res.json({ valid: true, usuario: decoded });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message, valid: false });
    }
  }
}
