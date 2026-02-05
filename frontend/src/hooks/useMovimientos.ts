import { useState, useEffect, useCallback } from 'react';
import { Movimiento, CreateMovimientoDTO } from '@/types/Movimiento.types';
import { movimientoService } from '@/services/movimientoService';
import { toast } from 'react-hot-toast';

/**
 * useMovimientos Hook
 *
 * Hook personalizado para gestionar movimientos de un cliente
 * Proporciona estado, carga automática y funciones para crear movimientos
 */

interface UseMovimientosReturn {
  movimientos: Movimiento[];
  loading: boolean;
  error: string | null;
  fetchMovimientos: (clienteId: string) => Promise<void>;
  createMovimiento: (data: CreateMovimientoDTO) => Promise<Movimiento | null>;
  refresh: () => Promise<void>;
}

export const useMovimientos = (clienteId?: string): UseMovimientosReturn => {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [currentClienteId, setCurrentClienteId] = useState<string | undefined>(clienteId);

  /**
   * Obtiene los movimientos de un cliente
   */
  const fetchMovimientos = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    setCurrentClienteId(id);

    try {
      const data = await movimientoService.getMovimientosByCliente(id);
      setMovimientos(data);
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar movimientos';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Crea un nuevo movimiento
   */
  const createMovimiento = useCallback(
    async (data: CreateMovimientoDTO): Promise<Movimiento | null> => {
      try {
        const nuevoMovimiento = await movimientoService.createMovimiento(data);

        // Actualizar la lista localmente
        setMovimientos((prev) => [nuevoMovimiento, ...prev]);

        toast.success('Movimiento registrado exitosamente');
        return nuevoMovimiento;
      } catch (err: any) {
        const errorMessage = err.message || 'Error al crear movimiento';
        toast.error(errorMessage);
        return null;
      }
    },
    []
  );

  /**
   * Refresca los movimientos del cliente actual
   */
  const refresh = useCallback(async () => {
    if (currentClienteId) {
      await fetchMovimientos(currentClienteId);
    }
  }, [currentClienteId, fetchMovimientos]);

  /**
   * Auto-fetch cuando cambia el clienteId
   */
  useEffect(() => {
    if (clienteId) {
      fetchMovimientos(clienteId);
    }
  }, [clienteId, fetchMovimientos]);

  return {
    movimientos,
    loading,
    error,
    fetchMovimientos,
    createMovimiento,
    refresh,
  };
};

export default useMovimientos;
