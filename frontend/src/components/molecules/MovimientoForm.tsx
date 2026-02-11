import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Settings, AlertCircle } from 'lucide-react';
import { TipoMovimiento } from '@/types/Movimiento.types';
import Button from '@/components/atoms/Button';
import { useMovimientoForm } from '@/hooks/useMovimientoForm';

/**
 * MovimientoForm Molecule - Formulario para registrar movimientos
 *
 * Formulario completo con validaciones en tiempo real
 * - Selector de tipo (Compra / Pago / Ajuste)
 * - Campo de monto con validación
 * - Campo de observaciones opcional
 * - Botones de cancelar y registrar
 *
 * Integrado con useMovimientoForm hook para lógica de negocio
 */

interface MovimientoFormProps {
  clienteId: string;
  onSuccess: (data: { tipo: TipoMovimiento; monto: number; observaciones?: string }) => void;
  onCancel: () => void;
  tipoDefault?: TipoMovimiento;
}

const MovimientoForm = ({
  clienteId,
  onSuccess,
  onCancel,
}: MovimientoFormProps) => {
  const {
    tipo,
    setTipo,
    monto,
    setMonto,
    observaciones,
    setObservaciones,
    loading,
    error,
    handleSubmit,
    isValid,
  } = useMovimientoForm({
    clienteId,
    onSuccess,
  });

  // Configuración de tipos
  const tiposConfig = [
    {
      value: TipoMovimiento.DEBITO,
      label: 'Compra',
      Icon: ShoppingBag,
      color: 'bg-red-500',
    },
    {
      value: TipoMovimiento.CREDITO,
      label: 'Pago',
      Icon: DollarSign,
      color: 'bg-emerald-500',
    },
    {
      value: TipoMovimiento.AJUSTE,
      label: 'Ajuste',
      Icon: Settings,
      color: 'bg-blue-500',
    },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tipo de Movimiento */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          Tipo de Movimiento
        </label>
        <div className="grid grid-cols-3 gap-2">
          {tiposConfig.map(({ value, label, Icon, color }) => (
            <motion.button
              key={value}
              type="button"
              onClick={() => setTipo(value)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`
                flex flex-col items-center justify-center gap-2
                py-3 px-2 rounded-lg font-semibold text-sm
                transition-all duration-200 min-h-touch
                ${
                  tipo === value
                    ? `${color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Monto */}
      <div>
        <label htmlFor="monto" className="block text-sm font-semibold text-gray-700 mb-2">
          Monto <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">
            $
          </span>
          <input
            type="number"
            id="monto"
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            step="0.01"
            placeholder="0.00"
            required
            disabled={loading}
            autoFocus
            className="
              w-full pl-10 pr-4 py-4 border-2 border-gray-200 rounded-xl
              focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              focus:outline-none
              text-lg font-semibold
              transition-all duration-200
              disabled:bg-gray-100 disabled:cursor-not-allowed
              min-h-touch
            "
          />
        </div>
        {tipo === TipoMovimiento.AJUSTE && (
          <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Usa valores negativos para descuentos
          </p>
        )}
      </div>

      {/* Observaciones */}
      <div>
        <label htmlFor="observaciones" className="block text-sm font-semibold text-gray-700 mb-2">
          Observaciones (opcional)
        </label>
        <textarea
          id="observaciones"
          value={observaciones}
          onChange={(e) => setObservaciones(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="Ej: Cartera modelo premium, color negro"
          disabled={loading}
          className="
            w-full px-4 py-3 border-2 border-gray-200 rounded-xl
            focus:ring-2 focus:ring-primary-500 focus:border-primary-500
            focus:outline-none
            resize-none
            transition-all duration-200
            disabled:bg-gray-100 disabled:cursor-not-allowed
          "
        />
        <div className="flex justify-between items-center mt-1">
          <p className="text-xs text-gray-500">
            {observaciones.length}/500 caracteres
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="secondary"
          size="lg"
          onClick={onCancel}
          disabled={loading}
          fullWidth
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          disabled={!isValid || loading}
          fullWidth
        >
          {loading ? 'Registrando...' : 'Registrar'}
        </Button>
      </div>
    </form>
  );
};

export default MovimientoForm;
