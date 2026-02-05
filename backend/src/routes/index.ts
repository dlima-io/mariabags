import { Router } from 'express';
import clienteRoutes from './clienteRoutes';
import movimientoRoutes from './movimientoRoutes';
import authRoutes from './authRoutes';
import usuarioRoutes from './usuarioRoutes';

const router = Router();

/**
 * Rutas de autenticación
 */
router.use('/auth', authRoutes);

/**
 * Rutas de clientes
 */
router.use('/clientes', clienteRoutes);

/**
 * Rutas de movimientos
 */
router.use('/movimientos', movimientoRoutes);

/**
 * Rutas de usuarios
 */
router.use('/usuarios', usuarioRoutes);

/**
 * Health check para la API
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'API María Bags funcionando correctamente',
    timestamp: new Date().toISOString()
  });
});

export default router;
