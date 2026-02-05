import { Router } from 'express';
import { MovimientoController } from '../controllers/movimientoController';
import { authMiddleware } from '../middleware/authMiddleware';
import { movimientoValidators } from '../utils/validators';
import { validate } from '../middleware/validateInput';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * GET /api/movimientos/recientes
 * Obtener movimientos recientes
 */
router.get('/recientes', MovimientoController.getRecientes);

/**
 * GET /api/movimientos/estadisticas
 * Obtener estadísticas de movimientos
 */
router.get('/estadisticas', MovimientoController.getEstadisticas);

/**
 * GET /api/movimientos/pagos-mes
 * Obtener pagos del mes actual con información del cliente
 */
router.get('/pagos-mes', MovimientoController.getPagosDelMes);

/**
 * GET /api/movimientos/cliente/:clienteId
 * Obtener movimientos de un cliente
 */
router.get('/cliente/:clienteId', MovimientoController.getByCliente);

/**
 * GET /api/movimientos/:id
 * Obtener movimiento por ID
 */
router.get('/:id', MovimientoController.getById);

/**
 * POST /api/movimientos
 * Crear nuevo movimiento
 */
router.post('/', validate(movimientoValidators.create), MovimientoController.create);

/**
 * POST /api/movimientos/compra
 * Registrar compra (atajo para DEBITO)
 */
router.post('/compra', MovimientoController.registrarCompra);

/**
 * POST /api/movimientos/pago
 * Registrar pago (atajo para CREDITO)
 */
router.post('/pago', MovimientoController.registrarPago);

/**
 * POST /api/movimientos/ajuste
 * Aplicar ajuste
 */
router.post('/ajuste', MovimientoController.aplicarAjuste);

/**
 * POST /api/movimientos/ajuste-porcentual
 * Aplicar ajuste porcentual
 */
router.post('/ajuste-porcentual', MovimientoController.aplicarAjustePorcentual);

/**
 * PATCH /api/movimientos/:id/observaciones
 * Actualizar observaciones
 */
router.patch('/:id/observaciones', MovimientoController.updateObservaciones);

/**
 * DELETE /api/movimientos/:id
 * Eliminar movimiento (solo corrección de errores)
 */
router.delete('/:id', MovimientoController.delete);

export default router;
