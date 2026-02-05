import api from './api';
import { Cliente, ClienteConSaldo, CreateClienteDTO, UpdateClienteDTO } from '@/types/Cliente.types';

/**
 * Cliente Service - Servicios para la gestión de clientes
 *
 * Maneja todas las llamadas a la API de clientes
 * Incluye funciones para CRUD completo y búsqueda
 */

export const clienteService = {
  /**
   * Obtiene todos los clientes
   */
  getAllClientes: async (): Promise<Cliente[]> => {
    try {
      const response = await api.get<Cliente[]>('/clientes');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener clientes');
    }
  },

  /**
   * Obtiene todos los clientes con saldo
   */
  getAllClientesWithSaldo: async (): Promise<ClienteConSaldo[]> => {
    try {
      const response = await api.get<ClienteConSaldo[]>('/clientes/with-saldo');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener clientes con saldo');
    }
  },

  /**
   * Obtiene un cliente por ID
   */
  getClienteById: async (id: string): Promise<Cliente> => {
    try {
      const response = await api.get<Cliente>(`/clientes/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener cliente');
    }
  },

  /**
   * Obtiene un cliente por ID con saldo
   */
  getClienteByIdWithSaldo: async (id: string): Promise<ClienteConSaldo> => {
    try {
      const response = await api.get<ClienteConSaldo>(`/clientes/${id}/saldo`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener cliente con saldo');
    }
  },

  /**
   * Crea un nuevo cliente
   */
  createCliente: async (data: CreateClienteDTO): Promise<Cliente> => {
    try {
      const response = await api.post<Cliente>('/clientes', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al crear cliente');
    }
  },

  /**
   * Actualiza un cliente existente
   */
  updateCliente: async (id: string, data: UpdateClienteDTO): Promise<Cliente> => {
    try {
      const response = await api.put<Cliente>(`/clientes/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al actualizar cliente');
    }
  },

  /**
   * Desactiva un cliente (soft delete)
   */
  deleteCliente: async (id: string): Promise<void> => {
    try {
      await api.delete(`/clientes/${id}`);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al desactivar cliente');
    }
  },

  /**
   * Busca clientes por término (con saldo)
   */
  searchClientes: async (term: string): Promise<ClienteConSaldo[]> => {
    try {
      const response = await api.get<ClienteConSaldo[]>(`/clientes/search?q=${encodeURIComponent(term)}`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al buscar clientes');
    }
  },

  /**
   * Obtiene clientes con deuda incluyendo información del último pago
   */
  getClientesConDeudaDetalle: async (): Promise<any[]> => {
    try {
      const response = await api.get<any[]>('/clientes/deuda-detalle');
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al obtener detalle de deudas');
    }
  },

  /**
   * Obtiene el link de WhatsApp para un cliente
   */
  getWhatsAppLink: async (id: string, message?: string): Promise<string> => {
    try {
      const response = await api.get<{ url: string }>(`/clientes/${id}/whatsapp`, {
        params: message ? { message } : undefined
      });
      return response.data.url;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Error al generar link de WhatsApp');
    }
  },
};

export default clienteService;
