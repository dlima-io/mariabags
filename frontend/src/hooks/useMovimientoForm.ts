import { useState, useCallback, useMemo } from 'react';
import { TipoMovimiento } from '@/types/Movimiento.types';
import { toast } from 'react-hot-toast';
import { movimientoService } from '@/services/movimientoService';

export interface ItemCompra {
  id: string;
  descripcion: string;
  precio: string;
}

interface UseMovimientoFormParams {
  clienteId: string;
  onSuccess?: (data: { tipo: TipoMovimiento; monto: number; observaciones?: string }) => void;
}

interface UseMovimientoFormReturn {
  tipo: TipoMovimiento;
  setTipo: (tipo: TipoMovimiento) => void;
  monto: string;
  setMonto: (monto: string) => void;
  observaciones: string;
  setObservaciones: (obs: string) => void;
  fecha: string;
  setFecha: (fecha: string) => void;
  items: ItemCompra[];
  addItem: () => void;
  removeItem: (id: string) => void;
  updateItem: (id: string, field: 'descripcion' | 'precio', value: string) => void;
  totalItems: number;
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
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<ItemCompra[]>([{ id: '1', descripcion: '', precio: '' }]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const totalItems = useMemo(() => {
    return items.reduce((sum, item) => {
      const precio = parseFloat(item.precio);
      return sum + (isNaN(precio) || precio < 0 ? 0 : precio);
    }, 0);
  }, [items]);

  const addItem = useCallback(() => {
    setItems(prev => [...prev, { id: Date.now().toString(), descripcion: '', precio: '' }]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, field: 'descripcion' | 'precio', value: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  }, []);

  const validate = useCallback((): { valid: boolean; error?: string } => {
    if (tipo === TipoMovimiento.DEBITO) {
      const itemsValidos = items.filter(item => {
        const precio = parseFloat(item.precio);
        return item.descripcion.trim() !== '' && !isNaN(precio) && precio > 0;
      });
      if (itemsValidos.length === 0) {
        return { valid: false, error: 'Agregá al menos un ítem con descripción y precio válido' };
      }
      return { valid: true };
    }

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

    if (tipo !== TipoMovimiento.AJUSTE && montoNum < 0) {
      return { valid: false, error: 'El monto no puede ser negativo para pagos' };
    }

    if (observaciones.length > 500) {
      return { valid: false, error: 'Las observaciones no pueden superar los 500 caracteres' };
    }

    return { valid: true };
  }, [tipo, items, monto, observaciones]);

  const isValid = validate().valid;

  const reset = useCallback(() => {
    setTipo(TipoMovimiento.DEBITO);
    setMonto('');
    setObservaciones('');
    setFecha(new Date().toISOString().split('T')[0]);
    setItems([{ id: '1', descripcion: '', precio: '' }]);
    setError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validate();
      if (!validation.valid) {
        setError(validation.error || 'Error de validación');
        toast.error(validation.error || 'Error de validación');
        return;
      }

      if (tipo === TipoMovimiento.DEBITO) {
        const itemsValidos = items.filter(item => {
          const precio = parseFloat(item.precio);
          return item.descripcion.trim() !== '' && !isNaN(precio) && precio > 0;
        });
        const montoTotal = itemsValidos.reduce((sum, item) => sum + parseFloat(item.precio), 0);
        const obs = itemsValidos
          .map(item => `${item.descripcion.trim()} $${parseFloat(item.precio).toLocaleString('es-AR')}`)
          .join(' | ');

        if (montoTotal > 10000) {
          const confirmed = window.confirm(
            `¿Confirmar compra de $${montoTotal.toLocaleString('es-AR')}?`
          );
          if (!confirmed) return;
        }

        setLoading(true);
        setError(null);

        try {
          await movimientoService.createCompra({
            cliente_id: clienteId,
            monto: montoTotal,
            observaciones: obs || undefined,
            fecha,
          });

          toast.success('Movimiento registrado exitosamente');
          reset();

          if (onSuccess) {
            onSuccess({ tipo, monto: montoTotal, observaciones: obs || undefined });
          }
        } catch (err: any) {
          const errorMessage = err.message || 'Error al registrar movimiento';
          setError(errorMessage);
          toast.error(errorMessage);
        } finally {
          setLoading(false);
        }
        return;
      }

      // CREDITO / AJUSTE
      const montoNum = parseFloat(monto);

      if (Math.abs(montoNum) > 10000) {
        const confirmed = window.confirm(
          `¿Confirmar movimiento de $${Math.abs(montoNum).toLocaleString('es-AR')}?`
        );
        if (!confirmed) return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = {
          cliente_id: clienteId,
          monto: Math.abs(montoNum),
          observaciones: observaciones.trim() || undefined,
          fecha,
        };

        switch (tipo) {
          case TipoMovimiento.CREDITO:
            await movimientoService.createPago(data);
            break;
          case TipoMovimiento.AJUSTE:
            await movimientoService.createAjuste({
              ...data,
              monto: montoNum,
            });
            break;
        }

        toast.success('Movimiento registrado exitosamente');
        reset();

        if (onSuccess) {
          onSuccess({ tipo, monto: Math.abs(montoNum), observaciones: observaciones.trim() || undefined });
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Error al registrar movimiento';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [clienteId, tipo, monto, observaciones, fecha, items, validate, reset, onSuccess]
  );

  return {
    tipo,
    setTipo,
    monto,
    setMonto,
    observaciones,
    setObservaciones,
    fecha,
    setFecha,
    items,
    addItem,
    removeItem,
    updateItem,
    totalItems,
    loading,
    error,
    handleSubmit,
    reset,
    isValid,
  };
};

export default useMovimientoForm;
