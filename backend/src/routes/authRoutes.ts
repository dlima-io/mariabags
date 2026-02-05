import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { usuarioValidators } from '../utils/validators';
import { validate } from '../middleware/validateInput';
import { loginRateLimiter, passwordChangeRateLimiter, refreshTokenRateLimiter } from '../middleware/rateLimiter';

const router = Router();

/**
 * POST /api/auth/login
 * Iniciar sesión (con rate limiting: 5 intentos por 15 min)
 */
router.post('/login', loginRateLimiter.middleware, validate(usuarioValidators.login), AuthController.login);

/**
 * POST /api/auth/refresh
 * Renovar token (con rate limiting: 10 intentos por hora)
 */
router.post('/refresh', refreshTokenRateLimiter.middleware, validate(usuarioValidators.refreshToken), AuthController.refreshToken);

/**
 * POST /api/auth/verify
 * Verificar token
 */
router.post('/verify', AuthController.verifyToken);

/**
 * GET /api/auth/me
 * Obtener información del usuario autenticado
 */
router.get('/me', authMiddleware, AuthController.getMe);

/**
 * POST /api/auth/change-password
 * Cambiar contraseña (requiere autenticación, rate limiting: 3 intentos por 15 min)
 */
router.post('/change-password', authMiddleware, passwordChangeRateLimiter.middleware, validate(usuarioValidators.changePassword), AuthController.changePassword);

export default router;
