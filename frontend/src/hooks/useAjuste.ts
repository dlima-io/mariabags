import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { movimientoService } from '@/services/movimientoService';
import { Movimiento } from '@/types/Movimiento.types';

/**
 * useAjuste Hook - Maneja la lógica de aplicación de ajustes
 *
 * Gestiona los dos tipos de ajustes:
 * - Ajuste fijo: Monto específico (positivo o negativo)
 * - Ajuste porcentual: Porcentaje sobre el saldo actual
 *
 * Incluye manejo de estados de carga y errores
 */

interface UseAjusteReturn {
  loading: boolean;
  error: string | null;
  aplicarAjusteFijo: (clienteId: string, monto: number, observaciones?: string) => Promise<Movimiento | null>;
  aplicarAjustePorcentual: (clienteId: string, porcentaje: number, observaciones?: string) => Promise<Movimiento | null>;
  clearError: () => void;
}

export const useAjuste = (): UseAjusteReturn => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Limpia el estado de error
   */
  const clearError = () => {
    setError(null);
  };

  /**
   * Aplica un ajuste de monto fijo
   */
  const aplicarAjusteFijo = async (
    clienteId: string,
    monto: number,
    observaciones?: string
  ): Promise<Movimiento | null> => {
    setLoading(true);
    setError(null);

    try {
      // Validación básica
      if (monto === 0) {
        throw new Error('El monto del ajuste no puede ser 0');
      }

      if (!clienteId) {
        throw new Error('Cliente no válido');
      }

      // Llamada al servicio
      const movimiento = await movimientoService.aplicarAjusteFijo(
        clienteId,
        monto,
        observaciones
      );

      // Toast de éxito
      toast.success('Ajuste aplicado correctamente');

      return movimiento;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al aplicar ajuste';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aplica un ajuste porcentual
   */
  const aplicarAjustePorcentual = async (
    clienteId: string,
    porcentaje: number,
    observaciones?: string
  ): Promise<Movimiento | null> => {
    setLoading(true);
    setError(null);

    try {
      // Validación básica
      if (porcentaje === 0) {
        throw new Error('El porcentaje del ajuste no puede ser 0');
      }

      if (!clienteId) {
        throw new Error('Cliente no válido');
      }

      // Llamada al servicio
      const movimiento = await movimientoService.aplicarAjustePorcentual(
        clienteId,
        porcentaje,
        observaciones
      );

      // Toast de éxito
      toast.success('Ajuste aplicado correctamente');

      return movimiento;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al aplicar ajuste';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    aplicarAjusteFijo,
    aplicarAjustePorcentual,
    clearError,
  };
};

export default useAjuste;
