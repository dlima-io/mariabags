import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { ClienteService } from '../services/clienteService';
import { CreateClienteDTO, UpdateClienteDTO } from '../types/Cliente.types';

export class ClienteController {
  /**
   * GET /api/clientes
   * Obtener todos los clientes
   */
  static async getAll(req: AuthRequest, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const clientes = await ClienteService.getAllClientes(includeInactive);
      res.json(clientes);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/clientes/with-saldo
   * Obtener todos los clientes con saldo
   */
  static async getAllWithSaldo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const includeInactive = req.query.includeInactive === 'true';
      const clientes = await ClienteService.getAllClientesWithSaldo(includeInactive);
      res.json(clientes);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/clientes/deuda
   * Obtener clientes con deuda
   */
  static async getWithDebt(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const clientes = await ClienteService.getClientesWithDebt();
      res.json(clientes);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/clientes/mora
   * Obtener clientes con mora
   */
  static async getWithMora(req: AuthRequest, res: Response): Promise<void> {
    try {
      const dias = parseInt(req.query.dias as string) || 30;
      const clientes = await ClienteService.getClientesWithMora(dias);
      res.json(clientes);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/clientes/search?q=termino
   * Buscar clientes
   */
  static async search(req: AuthRequest, res: Response): Promise<void> {
    try {
      const searchTerm = req.query.q as string;
      const includeInactive = req.query.includeInactive === 'true';
      const clientes = await ClienteService.searchClientes(searchTerm, includeInactive);
      res.json(clientes);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/clientes/:id
   * Obtener cliente por ID
   */
  static async getById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cliente = await ClienteService.getClienteById(req.params.id);
      res.json(cliente);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/clientes/:id/saldo
   * Obtener cliente con saldo
   */
  static async getByIdWithSaldo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cliente = await ClienteService.getClienteWithSaldoById(req.params.id);
      res.json(cliente);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * POST /api/clientes
   * Crear nuevo cliente
   */
  static async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data: CreateClienteDTO = req.body;
      const cliente = await ClienteService.createCliente(data);
      res.status(201).json(cliente);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * PUT /api/clientes/:id
   * Actualizar cliente
   */
  static async update(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data: UpdateClienteDTO = req.body;
      const cliente = await ClienteService.updateCliente(req.params.id, data);
      res.json(cliente);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * DELETE /api/clientes/:id
   * Desactivar cliente (soft delete)
   */
  static async deactivate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cliente = await ClienteService.deactivateCliente(req.params.id);
      res.json({ message: 'Cliente desactivado exitosamente', cliente });
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/clientes/deuda-detalle
   * Obtener clientes con deuda incluyendo información del último pago
   */
  static async getDebtDetail(_req: AuthRequest, res: Response): Promise<void> {
    try {
      const clientes = await ClienteService.getClientesWithDebtAndLastPayment();
      res.json(clientes);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  /**
   * GET /api/clientes/:id/whatsapp
   * Generar link de WhatsApp
   */
  static async generateWhatsAppLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const message = req.query.message as string | undefined;
      const result = await ClienteService.generateWhatsAppLink(req.params.id, message);
      res.json(result);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}
