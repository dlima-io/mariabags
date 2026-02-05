import { useState, useCallback } from 'react';
import { TipoMovimiento } from '@/types/Movimiento.types';
import { toast } from 'react-hot-toast';
import { movimientoService } from '@/services/movimientoService';

/**
 * useMovimientoForm Hook
 *
 * Hook personalizado para manejar el formulario de movimientos
 * Gestiona estado, validaciones y envío
 */

interface UseMovimientoFormParams {
  clienteId: string;
  onSuccess?: () => void;
}

interface UseMovimientoFormReturn {
  tipo: TipoMovimiento;
  setTipo: (tipo: TipoMovimiento) => void;
  monto: string;
  setMonto: (monto: string) => void;
  observaciones: string;
  setObservaciones: (obs: string) => void;
  loading: boolean;
  error: string | null;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  reset: () => void;
  isValid: boolean;
}

export const useMovimientoForm = ({
  clienteId,
  onSuccess,
}: UseMovimientoFormParams): UseMovimientoFormReturn => {
  const [tipo, setTipo] = useState<TipoMovimiento>(TipoMovimiento.DEBITO);
  const [monto, setMonto] = useState<string>('');
  const [observaciones, setObservaciones] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Valida el formulario
   */
  const validate = useCallback((): { valid: boolean; error?: string } => {
    // Validar monto
    const montoNum = parseFloat(monto);

    if (!monto || isNaN(montoNum)) {
      return { valid: false, error: 'El monto debe ser un número válido' };
    }

    if (montoNum === 0) {
      return { valid: false, error: 'El monto no puede ser cero' };
    }

    if (montoNum > 99999999.99) {
      return { valid: false, error: 'El monto es demasiado grande' };
    }

    // Para DEBITO y CREDITO, el monto debe ser positivo
    if (tipo !== TipoMovimiento.AJUSTE && montoNum < 0) {
      return { valid: false, error: 'El monto no puede ser negativo para compras y pagos' };
    }

    // Validar observaciones (opcional, pero con límite)
    if (observaciones.length > 500) {
      return { valid: false, error: 'Las observaciones no pueden superar los 500 caracteres' };
    }

    return { valid: true };
  }, [monto, tipo, observaciones]);

  /**
   * Verifica si el formulario es válido
   */
  const isValid = validate().valid;

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validar
      const validation = validate();
      if (!validation.valid) {
        setError(validation.error || 'Error de validación');
        toast.error(validation.error || 'Error de validación');
        return;
      }

      const montoNum = parseFloat(monto);

      // Confirmación para montos grandes
      if (Math.abs(montoNum) > 10000) {
        const confirmed = window.confirm(
          `¿Confirmar movimiento de $${Math.abs(montoNum).toLocaleString('es-AR')}?`
        );
        if (!confirmed) {
          return;
        }
      }

      setLoading(true);
      setError(null);

      try {
        const data = {
          cliente_id: clienteId,
          monto: Math.abs(montoNum),
          observaciones: observaciones.trim() || undefined,
        };

        // Llamar al servicio según el tipo
        switch (tipo) {
          case TipoMovimiento.DEBITO:
            await movimientoService.createCompra(data);
            break;
          case TipoMovimiento.CREDITO:
            await movimientoService.createPago(data);
            break;
          case TipoMovimiento.AJUSTE:
            await movimientoService.createAjuste({
              ...data,
              monto: montoNum, // Para ajustes, mantener el signo
            });
            break;
        }

        toast.success('Movimiento registrado exitosamente');
        reset();

        if (onSuccess) {
          onSuccess();
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Error al registrar movimiento';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [clienteId, tipo, monto, observaciones, validate, onSuccess]
  );

  /**
   * Resetea el formulario
   */
  const reset = useCallback(() => {
    setTipo(TipoMovimiento.DEBITO);
    setMonto('');
    setObservaciones('');
    setError(null);
  }, []);

  return {
    tipo,
    setTipo,
    monto,
    setMonto,
    observaciones,
    setObservaciones,
    loading,
    error,
    handleSubmit,
    reset,
    isValid,
  };
};

export default useMovimientoForm;
