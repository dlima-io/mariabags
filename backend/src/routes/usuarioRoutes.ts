import { Router } from 'express';
import { UsuarioController } from '../controllers/usuarioController';
import { authMiddleware, requireRole } from '../middleware/authMiddleware';
import { usuarioValidators } from '../utils/validators';
import { validate } from '../middleware/validateInput';
import { RolUsuario } from '../types/Usuario.types';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * POST /api/usuarios/cambiar-password
 * Cambiar contraseña del usuario autenticado
 */
router.post('/cambiar-password', UsuarioController.changePassword);

/**
 * GET /api/usuarios
 * Obtener todos los usuarios (solo ADMIN)
 */
router.get('/', requireRole(RolUsuario.ADMIN), UsuarioController.getAll);

/**
 * GET /api/usuarios/:id
 * Obtener usuario por ID
 */
router.get('/:id', UsuarioController.getById);

/**
 * POST /api/usuarios
 * Crear nuevo usuario (solo ADMIN)
 */
router.post(
  '/',
  requireRole(RolUsuario.ADMIN),
  validate(usuarioValidators.create),
  UsuarioController.create
);

/**
 * PUT /api/usuarios/:id
 * Actualizar usuario (solo ADMIN)
 */
router.put('/:id', requireRole(RolUsuario.ADMIN), UsuarioController.update);

/**
 * DELETE /api/usuarios/:id
 * Eliminar usuario (solo ADMIN)
 */
router.delete('/:id', requireRole(RolUsuario.ADMIN), UsuarioController.delete);

/**
 * PATCH /api/usuarios/:id/rol
 * Cambiar rol de usuario (solo ADMIN)
 */
router.patch('/:id/rol', requireRole(RolUsuario.ADMIN), UsuarioController.changeRol);

export default router;
