import { MovimientoModel } from '../models/MovimientoModel';
import { ClienteModel } from '../models/ClienteModel';
import { Movimiento, CreateMovimientoDTO, TipoMovimiento } from '../types/Movimiento.types';
import { AppError } from '../middleware/errorHandler';
import { sanitizeString } from '../utils/sanitizers';

export class MovimientoService {
  /**
   * Obtener movimientos de un cliente
   */
  static async getMovimientosByCliente(clienteId: string, limit?: number): Promise<Movimiento[]> {
    // Verificar que el cliente existe
    const cliente = await ClienteModel.findById(clienteId);
    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }

    return MovimientoModel.findByClienteId(clienteId, limit);
  }

  /**
   * Obtener movimiento por ID
   */
  static async getMovimientoById(id: string): Promise<Movimiento> {
    const movimiento = await MovimientoModel.findById(id);
    if (!movimiento) {
      throw new AppError('Movimiento no encontrado', 404);
    }
    return movimiento;
  }

  /**
   * Registrar nuevo movimiento
   */
  static async createMovimiento(data: CreateMovimientoDTO, usuarioId: string): Promise<Movimiento> {
    // Verificar que el cliente existe y está activo
    const cliente = await ClienteModel.findById(data.cliente_id);
    if (!cliente) {
      throw new AppError('Cliente no encontrado', 404);
    }
    if (!cliente.activo) {
      throw new AppError('No se pueden registrar movimientos para clientes inactivos', 400);
    }

    // Validar monto
    if (data.monto <= 0 && data.tipo !== TipoMovimiento.AJUSTE) {
      throw new AppError('El monto debe ser mayor a 0', 400);
    }
    if (data.monto === 0 && data.tipo === TipoMovimiento.AJUSTE) {
      throw new AppError('Los ajustes no pueden ser de monto 0', 400);
    }

    // Sanitizar observaciones
    const sanitizedData = {
      ...data,
      observaciones: data.observaciones ? sanitizeString(data.observaciones) : undefined
    };

    return MovimientoModel.create(sanitizedData, usuarioId);
  }

  /**
   * Registrar compra (DEBITO)
   */
  static async registrarCompra(
    clienteId: string,
    monto: number,
    usuarioId: string,
    observaciones?: string
  ): Promise<Movimiento> {
    return this.createMovimiento(
      {
        cliente_id: clienteId,
        tipo: TipoMovimiento.DEBITO,
        monto,
        observaciones
      },
      usuarioId
    );
  }

  /**
   * Registrar pago (CREDITO)
   */
  static async registrarPago(
    clienteId: string,
    monto: number,
    usuarioId: string,
    observaciones?: string
  ): Promise<Movimiento> {
    return this.createMovimiento(
      {
        cliente_id: clienteId,
        tipo: TipoMovimiento.CREDITO,
        monto,
        observaciones
      },
      usuarioId
    );
  }

  /**
   * Aplicar ajuste (puede ser positivo o negativo)
   */
  static async aplicarAjuste(
    clienteId: string,
    monto: number,
    usuarioId: string,
    observaciones?: string
  ): Promise<Movimiento> {
    if (monto === 0) {
      throw new AppError('El ajuste no puede ser 0', 400);
    }

    const tipoAjuste = monto > 0 ? 'recargo' : 'descuento';
    const observacionesAuto = observaciones || `Ajuste ${tipoAjuste} aplicado`;

    return this.createMovimiento(
      {
        cliente_id: clienteId,
        tipo: TipoMovimiento.AJUSTE,
        monto,
        observaciones: observacionesAuto
      },
      usuarioId
    );
  }

  /**
   * Aplicar ajuste porcentual sobre el saldo actual
   */
  static async aplicarAjustePorcentual(
    clienteId: string,
    porcentaje: number,
    usuarioId: string,
    observaciones?: string
  ): Promise<Movimiento> {
    if (porcentaje === 0) {
      throw new AppError('El porcentaje no puede ser 0', 400);
    }

    // Obtener saldo actual del cliente
    const clienteConSaldo = await ClienteModel.findByIdWithSaldo(clienteId);
    if (!clienteConSaldo) {
      throw new AppError('Cliente no encontrado', 404);
    }

    if (clienteConSaldo.saldo === 0) {
      throw new AppError('No se puede aplicar ajuste porcentual sobre saldo 0', 400);
    }

    // Calcular monto del ajuste
    const montoAjuste = (clienteConSaldo.saldo * porcentaje) / 100;

    const tipoAjuste = porcentaje > 0 ? 'recargo' : 'descuento';
    const observacionesAuto =
      observaciones ||
      `Ajuste ${tipoAjuste} del ${Math.abs(porcentaje)}% sobre saldo de $${clienteConSaldo.saldo}`;

    return this.createMovimiento(
      {
        cliente_id: clienteId,
        tipo: TipoMovimiento.AJUSTE,
        monto: montoAjuste,
        observaciones: observacionesAuto
      },
      usuarioId
    );
  }

  /**
   * Actualizar observaciones
   */
  static async updateObservaciones(id: string, observaciones: string): Promise<Movimiento> {
    const movimiento = await MovimientoModel.updateObservaciones(
      id,
      sanitizeString(observaciones)
    );
    if (!movimiento) {
      throw new AppError('Movimiento no encontrado', 404);
    }
    return movimiento;
  }

  /**
   * Obtener movimientos recientes (todos los clientes)
   */
  static async getMovimientosRecientes(limit: number = 20): Promise<any[]> {
    if (limit < 1 || limit > 100) {
      throw new AppError('El límite debe estar entre 1 y 100', 400);
    }
    return MovimientoModel.findWithClienteInfo(limit);
  }

  /**
   * Obtener estadísticas de movimientos
   */
  static async getEstadisticas(clienteId?: string): Promise<any> {
    if (clienteId) {
      const cliente = await ClienteModel.findById(clienteId);
      if (!cliente) {
        throw new AppError('Cliente no encontrado', 404);
      }
    }
    return MovimientoModel.getEstadisticas(clienteId);
  }

  /**
   * Obtener movimientos por rango de fechas
   */
  static async getMovimientosByDateRange(
    fechaInicio: Date,
    fechaFin: Date,
    clienteId?: string
  ): Promise<Movimiento[]> {
    if (fechaInicio > fechaFin) {
      throw new AppError('La fecha de inicio debe ser anterior a la fecha de fin', 400);
    }

    if (clienteId) {
      const cliente = await ClienteModel.findById(clienteId);
      if (!cliente) {
        throw new AppError('Cliente no encontrado', 404);
      }
    }

    return MovimientoModel.findByDateRange(fechaInicio, fechaFin, clienteId);
  }

  /**
   * Obtener pagos del mes actual con información del cliente
   */
  static async getPagosDelMes(): Promise<any[]> {
    return MovimientoModel.getPagosDelMes();
  }

  /**
   * Eliminar movimiento (solo para corrección de errores)
   */
  static async deleteMovimiento(id: string): Promise<void> {
    const movimiento = await MovimientoModel.findById(id);
    if (!movimiento) {
      throw new AppError('Movimiento no encontrado', 404);
    }

    const deleted = await MovimientoModel.delete(id);
    if (!deleted) {
      throw new AppError('Error al eliminar movimiento', 500);
    }
  }
}
