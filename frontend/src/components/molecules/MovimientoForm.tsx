import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, DollarSign, AlertCircle, Plus, Trash2, Calendar } from 'lucide-react';
import { TipoMovimiento } from '@/types/Movimiento.types';
import Button from '@/components/atoms/Button';
import { useMovimientoForm } from '@/hooks/useMovimientoForm';
import { formatCurrency } from '@/utils/formatters';

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
    isValid,
  } = useMovimientoForm({ clienteId, onSuccess });

  const tiposConfig = [
    { value: TipoMovimiento.DEBITO,  label: 'Compra', Icon: ShoppingBag, color: 'bg-red-500' },
    { value: TipoMovimiento.CREDITO, label: 'Pago',   Icon: DollarSign,  color: 'bg-emerald-500' },
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
                ${tipo === value ? `${color} text-white shadow-lg` : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
              `}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Fecha del movimiento */}
      <div>
        <label htmlFor="fecha" className="block text-sm font-semibold text-gray-700 mb-2">
          Fecha del movimiento
        </label>
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="date"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            max={new Date().toISOString().split('T')[0]}
            disabled={loading}
            className="
              w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl
              focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              focus:outline-none text-sm font-medium
              transition-all duration-200
              disabled:bg-gray-100 disabled:cursor-not-allowed
            "
          />
        </div>
      </div>

      {tipo === TipoMovimiento.DEBITO ? (

        /* ── Tabla de ítems (solo Compra) ── */
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-semibold text-gray-700">
              Detalle de la compra
            </label>
            <motion.button
              type="button"
              onClick={addItem}
              whileTap={{ scale: 0.95 }}
              disabled={loading}
              className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              Agregar ítem
            </motion.button>
          </div>

          {/* Encabezado */}
          <div className="grid grid-cols-[1fr_7rem_2rem] gap-2 px-1 mb-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Descripción</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-right pr-2">Precio</span>
            <span />
          </div>

          {/* Filas */}
          <div className="space-y-2">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.15 }}
                  className="grid grid-cols-[1fr_7rem_2rem] gap-2 items-center"
                >
                  <input
                    type="text"
                    value={item.descripcion}
                    onChange={(e) => updateItem(item.id, 'descripcion', e.target.value)}
                    placeholder="Ej: Cartera premium"
                    disabled={loading}
                    className="
                      w-full px-3 py-2.5 border-2 border-gray-200 rounded-lg text-sm
                      focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                      focus:outline-none transition-all duration-200
                      disabled:bg-gray-100 disabled:cursor-not-allowed
                    "
                  />
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <input
                      type="number"
                      value={item.precio}
                      onChange={(e) => updateItem(item.id, 'precio', e.target.value)}
                      placeholder="0"
                      step="0.01"
                      min="0"
                      disabled={loading}
                      className="
                        w-full pl-6 pr-2 py-2.5 border-2 border-gray-200 rounded-lg
                        text-sm font-semibold text-right
                        focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                        focus:outline-none transition-all duration-200
                        disabled:bg-gray-100 disabled:cursor-not-allowed
                      "
                    />
                  </div>
                  <motion.button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    whileTap={{ scale: 0.9 }}
                    disabled={items.length === 1 || loading}
                    className="
                      flex items-center justify-center w-8 h-8 rounded-lg
                      text-gray-300 hover:text-red-500 hover:bg-red-50
                      transition-colors duration-200
                      disabled:opacity-20 disabled:cursor-not-allowed
                      disabled:hover:text-gray-300 disabled:hover:bg-transparent
                    "
                  >
                    <Trash2 className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t-2 border-gray-100">
            <span className="text-sm font-semibold text-gray-600">Total de la compra</span>
            <span className={`text-2xl font-bold ${totalItems > 0 ? 'text-gray-900' : 'text-gray-300'}`}>
              {formatCurrency(totalItems)}
            </span>
          </div>
        </div>

      ) : (

        /* ── Monto + Observaciones (Pago / Ajuste) ── */
        <>
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
                  focus:outline-none text-lg font-semibold
                  transition-all duration-200
                  disabled:bg-gray-100 disabled:cursor-not-allowed min-h-touch
                "
              />
            </div>
          </div>

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
              placeholder="Ej: Pago en efectivo"
              disabled={loading}
              className="
                w-full px-4 py-3 border-2 border-gray-200 rounded-xl
                focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                focus:outline-none resize-none
                transition-all duration-200
                disabled:bg-gray-100 disabled:cursor-not-allowed
              "
            />
            <p className="text-xs text-gray-500 mt-1">{observaciones.length}/500 caracteres</p>
          </div>
        </>
      )}

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
        <Button type="button" variant="secondary" size="lg" onClick={onCancel} disabled={loading} fullWidth>
          Cancelar
        </Button>
        <Button type="submit" variant="primary" size="lg" isLoading={loading} disabled={!isValid || loading} fullWidth>
          {loading ? 'Registrando...' : 'Registrar'}
        </Button>
      </div>

    </form>
  );
};

export default MovimientoForm;
