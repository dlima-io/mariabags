import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { UsuarioService } from '../services/usuarioService';
import { CreateUsuarioDTO, UpdateUsuarioDTO, RolUsuario } from '../types/Usuario.types';

export class UsuarioController {
  /**
   * GET /api/usuarios
   * Obtener todos los usuarios (solo ADMIN)
   */
  static async getAll(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarios = await UsuarioService.getAllUsuarios();
      res.json(usuarios);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/usuarios/:id
   * Obtener usuario por ID
   */
  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuario = await UsuarioService.getUsuarioById(req.params.id);
      res.json(usuario);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * POST /api/usuarios
   * Crear nuevo usuario (solo ADMIN)
   */
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data: CreateUsuarioDTO = req.body;
      const usuario = await UsuarioService.createUsuario(data);
      res.status(201).json(usuario);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/usuarios/:id
   * Actualizar usuario (solo ADMIN)
   */
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data: UpdateUsuarioDTO = req.body;
      const usuario = await UsuarioService.updateUsuario(req.params.id, data);
      res.json(usuario);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/usuarios/:id
   * Eliminar usuario (solo ADMIN)
   */
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      // No permitir que un usuario se elimine a sí mismo
      if (req.params.id === req.usuario!.id) {
        res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
        return;
      }

      await UsuarioService.deleteUsuario(req.params.id);
      res.json({ message: 'Usuario eliminado exitosamente' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * PATCH /api/usuarios/:id/rol
   * Cambiar rol de usuario (solo ADMIN)
   */
  static async changeRol(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { rol } = req.body;

      if (!rol || !Object.values(RolUsuario).includes(rol)) {
        res.status(400).json({ error: 'Rol inválido' });
        return;
      }

      // No permitir que un admin se quite sus propios privilegios
      if (req.params.id === req.usuario!.id && rol !== RolUsuario.ADMIN) {
        res.status(400).json({ error: 'No puedes cambiar tu propio rol de ADMIN' });
        return;
      }

      const usuario = await UsuarioService.changeRol(req.params.id, rol);
      res.json(usuario);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * POST /api/usuarios/cambiar-password
   * Cambiar contraseña del usuario autenticado
   */
  static async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Se requiere contraseña actual y nueva' });
        return;
      }

      await UsuarioService.changePassword(
        req.usuario!.id,
        currentPassword,
        newPassword
      );

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
