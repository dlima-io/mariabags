import { Router } from 'express';
import { ClienteController } from '../controllers/clienteController';
import { authMiddleware } from '../middleware/authMiddleware';
import { clienteValidators } from '../utils/validators';
import { validate } from '../middleware/validateInput';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * GET /api/clientes
 * Obtener todos los clientes
 */
router.get('/', ClienteController.getAll);

/**
 * GET /api/clientes/with-saldo
 * Obtener todos los clientes con saldo
 */
router.get('/with-saldo', ClienteController.getAllWithSaldo);

/**
 * GET /api/clientes/deuda
 * Obtener clientes con deuda
 */
router.get('/deuda', ClienteController.getWithDebt);

/**
 * GET /api/clientes/mora
 * Obtener clientes con mora
 */
router.get('/mora', ClienteController.getWithMora);

/**
 * GET /api/clientes/deuda-detalle
 * Obtener clientes con deuda incluyendo información del último pago
 */
router.get('/deuda-detalle', ClienteController.getDebtDetail);

/**
 * GET /api/clientes/search?q=termino
 * Buscar clientes
 */
router.get('/search', ClienteController.search);

/**
 * GET /api/clientes/:id
 * Obtener cliente por ID
 */
router.get('/:id', ClienteController.getById);

/**
 * GET /api/clientes/:id/saldo
 * Obtener cliente con saldo
 */
router.get('/:id/saldo', ClienteController.getByIdWithSaldo);

/**
 * GET /api/clientes/:id/whatsapp
 * Generar link de WhatsApp
 */
router.get('/:id/whatsapp', ClienteController.generateWhatsAppLink);

/**
 * POST /api/clientes
 * Crear nuevo cliente
 */
router.post('/', validate(clienteValidators.create), ClienteController.create);

/**
 * PUT /api/clientes/:id
 * Actualizar cliente
 */
router.put('/:id', validate(clienteValidators.update), ClienteController.update);

/**
 * DELETE /api/clientes/:id
 * Desactivar cliente (soft delete)
 */
router.delete('/:id', ClienteController.deactivate);

export default router;
