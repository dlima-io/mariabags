import api from './api';
import { Movimiento, CreateMovimientoDTO } from '@/types/Movimiento.types';

/**
 * Movimiento Service - Servicios para la gestión de movimientos contables
 *
 * Maneja todas las llamadas a la API de movimientos
 * Incluye funciones para registrar compras, pagos y ajustes
 */

interface CreateCompraDTO {
  cliente_id: string;
  monto: number;
  observaciones?: string;
  fecha?: string;
}

interface CreatePagoDTO {
  cliente_id: string;
  monto: number;
  observaciones?: string;
  fecha?: string;
}

interface CreateAjusteDTO {
  cliente_id: string;
  monto: number;
  observaciones?: string;
  porcentaje?: number;
  fecha?: string;
}

interface EstadisticasMovimientos {
  totalDebitos: number;
  totalCreditos: number;
  totalAjustes: number;
  saldoActual: number;
  cantidadMovimientos: number;
}

export const movimientoService = {
  /**
   * Obtiene todos los movimientos de un cliente
   */
  getMovimientosByCliente: async (clienteId: string): Promise<Movimiento[]> => {
    try {
      const response = await api.get<Movimiento[]>(`/movimientos/cliente/${clienteId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener movimientos');
    }
  },

  /**
   * Crea un movimiento genérico
   */
  createMovimiento: async (data: CreateMovimientoDTO): Promise<Movimiento> => {
    try {
      const response = await api.post<Movimiento>('/movimientos', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear movimiento');
    }
  },

  /**
   * Registra una compra (DEBITO)
   */
  createCompra: async (data: CreateCompraDTO): Promise<Movimiento> => {
    try {
      const response = await api.post<Movimiento>('/movimientos/compra', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrar compra');
    }
  },

  /**
   * Registra un pago (CREDITO)
   */
  createPago: async (data: CreatePagoDTO): Promise<Movimiento> => {
    try {
      const response = await api.post<Movimiento>('/movimientos/pago', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrar pago');
    }
  },

  /**
   * Registra un ajuste
   */
  createAjuste: async (data: CreateAjusteDTO): Promise<Movimiento> => {
    try {
      const response = await api.post<Movimiento>('/movimientos/ajuste', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al registrar ajuste');
    }
  },

  /**
   * Obtiene estadísticas de movimientos
   */
  getEstadisticas: async (clienteId?: string): Promise<EstadisticasMovimientos> => {
    try {
      const url = clienteId
        ? `/movimientos/estadisticas/${clienteId}`
        : '/movimientos/estadisticas';
      const response = await api.get<EstadisticasMovimientos>(url);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener estadísticas');
    }
  },

  /**
   * Aplica un ajuste de monto fijo
   */
  aplicarAjusteFijo: async (clienteId: string, monto: number, observaciones?: string): Promise<Movimiento> => {
    try {
      const response = await api.post<Movimiento>('/movimientos/ajuste', {
        cliente_id: clienteId,
        monto,
        observaciones,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al aplicar ajuste');
    }
  },

  /**
   * Aplica un ajuste porcentual
   */
  aplicarAjustePorcentual: async (clienteId: string, porcentaje: number, observaciones?: string): Promise<Movimiento> => {
    try {
      const response = await api.post<Movimiento>('/movimientos/ajuste-porcentual', {
        cliente_id: clienteId,
        porcentaje,
        observaciones,
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al aplicar ajuste porcentual');
    }
  },

  /**
   * Obtiene los pagos del mes actual con información del cliente
   */
  getPagosDelMes: async (): Promise<any[]> => {
    try {
      const response = await api.get<any[]>('/movimientos/pagos-mes');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener pagos del mes');
    }
  },
};

export default movimientoService;
