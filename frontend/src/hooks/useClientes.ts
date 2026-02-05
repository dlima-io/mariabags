import { useState, useEffect, useCallback } from 'react';
import { ClienteConSaldo, CreateClienteDTO, UpdateClienteDTO } from '@/types/Cliente.types';
import clienteService from '@/services/clienteService';

/**
 * useClientes Hook - Gestión completa de clientes
 *
 * Maneja el estado de clientes, loading y errores
 * Proporciona funciones para CRUD y búsqueda
 * Auto-fetch al montar el componente
 */

interface UseClientesReturn {
  clientes: ClienteConSaldo[];
  loading: boolean;
  error: string | null;
  fetchClientes: () => Promise<void>;
  createCliente: (data: CreateClienteDTO) => Promise<ClienteConSaldo>;
  updateCliente: (id: string, data: UpdateClienteDTO) => Promise<ClienteConSaldo>;
  deleteCliente: (id: string) => Promise<void>;
  searchClientes: (term: string) => Promise<void>;
  clearError: () => void;
}

export const useClientes = (): UseClientesReturn => {
  const [clientes, setClientes] = useState<ClienteConSaldo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene todos los clientes con saldo
   */
  const fetchClientes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await clienteService.getAllClientesWithSaldo();
      setClientes(data);
    } catch (err: any) {
      setError(err.message || 'Error al cargar clientes');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo cliente
   */
  const createCliente = useCallback(async (data: CreateClienteDTO): Promise<ClienteConSaldo> => {
    try {
      setError(null);
      const nuevoCliente = await clienteService.createCliente(data);
      // Agregar saldo 0 al nuevo cliente
      const nuevoClienteConSaldo: ClienteConSaldo = { ...nuevoCliente, saldo: 0 };
      setClientes((prev) => [nuevoClienteConSaldo, ...prev]);
      return nuevoClienteConSaldo;
    } catch (err: any) {
      setError(err.message || 'Error al crear cliente');
      throw err;
    }
  }, []);

  /**
   * Actualiza un cliente existente
   */
  const updateCliente = useCallback(async (id: string, data: UpdateClienteDTO): Promise<ClienteConSaldo> => {
    try {
      setError(null);
      const clienteActualizado = await clienteService.updateCliente(id, data);

      // Actualizar en la lista manteniendo el saldo
      setClientes((prev) =>
        prev.map((cliente) => {
          if (cliente.id === id) {
            // Mantener el saldo existente
            return { ...clienteActualizado, saldo: cliente.saldo };
          }
          return cliente;
        })
      );

      return { ...clienteActualizado, saldo: 0 }; // El saldo se debe obtener del backend
    } catch (err: any) {
      setError(err.message || 'Error al actualizar cliente');
      throw err;
    }
  }, []);

  /**
   * Desactiva un cliente
   */
  const deleteCliente = useCallback(async (id: string): Promise<void> => {
    try {
      setError(null);
      await clienteService.deleteCliente(id);
      // Actualizar estado local - marcar como inactivo
      setClientes((prev) =>
        prev.map((cliente) =>
          cliente.id === id ? { ...cliente, activo: false } : cliente
        )
      );
    } catch (err: any) {
      setError(err.message || 'Error al desactivar cliente');
      throw err;
    }
  }, []);

  /**
   * Busca clientes por término
   */
  const searchClientes = useCallback(async (term: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (!term.trim()) {
        // Si no hay término, cargar todos
        await fetchClientes();
        return;
      }

      const data = await clienteService.searchClientes(term);
      setClientes(data);
    } catch (err: any) {
      setError(err.message || 'Error al buscar clientes');
      setClientes([]);
    } finally {
      setLoading(false);
    }
  }, [fetchClientes]);

  /**
   * Limpia el error actual
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Auto-fetch al montar
  useEffect(() => {
    fetchClientes();
  }, [fetchClientes]);

  return {
    clientes,
    loading,
    error,
    fetchClientes,
    createCliente,
    updateCliente,
    deleteCliente,
    searchClientes,
    clearError,
  };
};

export default useClientes;
