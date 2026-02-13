import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { MovimientoService } from '../services/movimientoService';
import { CreateMovimientoDTO } from '../types/Movimiento.types';

export class MovimientoController {
  /**
   * GET /api/movimientos/recientes
   * Obtener movimientos recientes
   */
  static async getRecientes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const movimientos = await MovimientoService.getMovimientosRecientes(limit);
      res.json(movimientos);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/movimientos/estadisticas
   * Obtener estadísticas de movimientos
   */
  static async getEstadisticas(req: AuthRequest, res: Response): Promise<void> {
    try {
      const clienteId = req.query.clienteId as string | undefined;
      const estadisticas = await MovimientoService.getEstadisticas(clienteId);
      res.json(estadisticas);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/movimientos/pagos-mes
   * Obtener pagos del mes actual con información del cliente
   */
  static async getPagosDelMes(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const pagos = await MovimientoService.getPagosDelMes();
      res.json(pagos);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/movimientos/cliente/:clienteId
   * Obtener movimientos de un cliente
   */
  static async getByCliente(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const movimientos = await MovimientoService.getMovimientosByCliente(
        req.params.clienteId,
        limit
      );
      res.json(movimientos);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/movimientos/:id
   * Obtener movimiento por ID
   */
  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const movimiento = await MovimientoService.getMovimientoById(req.params.id);
      res.json(movimiento);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * POST /api/movimientos
   * Crear nuevo movimiento
   */
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data: CreateMovimientoDTO = req.body;
      const usuarioId = req.usuario!.id;
      const movimiento = await MovimientoService.createMovimiento(data, usuarioId);
      res.status(201).json(movimiento);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * POST /api/movimientos/compra
   * Registrar compra (atajo para DEBITO)
   */
  static async registrarCompra(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cliente_id, monto, observaciones, fecha } = req.body;
      const usuarioId = req.usuario!.id;
      const movimiento = await MovimientoService.registrarCompra(
        cliente_id,
        monto,
        usuarioId,
        observaciones,
        fecha
      );
      res.status(201).json(movimiento);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * POST /api/movimientos/pago
   * Registrar pago (atajo para CREDITO)
   */
  static async registrarPago(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cliente_id, monto, observaciones, fecha } = req.body;
      const usuarioId = req.usuario!.id;
      const movimiento = await MovimientoService.registrarPago(
        cliente_id,
        monto,
        usuarioId,
        observaciones,
        fecha
      );
      res.status(201).json(movimiento);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * POST /api/movimientos/ajuste
   * Aplicar ajuste
   */
  static async aplicarAjuste(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cliente_id, monto, observaciones, fecha } = req.body;
      const usuarioId = req.usuario!.id;
      const movimiento = await MovimientoService.aplicarAjuste(
        cliente_id,
        monto,
        usuarioId,
        observaciones,
        fecha
      );
      res.status(201).json(movimiento);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * POST /api/movimientos/ajuste-porcentual
   * Aplicar ajuste porcentual
   */
  static async aplicarAjustePorcentual(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cliente_id, porcentaje, observaciones } = req.body;
      const usuarioId = req.usuario!.id;
      const movimiento = await MovimientoService.aplicarAjustePorcentual(
        cliente_id,
        porcentaje,
        usuarioId,
        observaciones
      );
      res.status(201).json(movimiento);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * PATCH /api/movimientos/:id/observaciones
   * Actualizar observaciones
   */
  static async updateObservaciones(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { observaciones } = req.body;
      const movimiento = await MovimientoService.updateObservaciones(
        req.params.id,
        observaciones
      );
      res.json(movimiento);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/movimientos/:id
   * Eliminar movimiento (solo corrección de errores)
   */
  static async delete(req: AuthRequest, res: Response): Promise<void> {
    try {
      await MovimientoService.deleteMovimiento(req.params.id);
      res.json({ message: 'Movimiento eliminado exitosamente' });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
