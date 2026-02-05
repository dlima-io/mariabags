import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/formatters';

/**
 * PreviewCard Molecule - Visualización del impacto de un ajuste
 *
 * Muestra el cálculo en tiempo real de cómo el ajuste afectará el saldo
 * Colores semánticos:
 * - Verde: Disminuye la deuda (mejor para el cliente)
 * - Rojo: Aumenta la deuda (peor para el cliente)
 * - Gris: Sin cambios
 *
 * Animación suave al actualizar valores
 */

interface PreviewCardProps {
  saldoActual: number;
  ajuste: number;
  className?: string;
}

const PreviewCard = ({ saldoActual, ajuste, className = '' }: PreviewCardProps) => {
  const nuevoSaldo = saldoActual + ajuste;

  /**
   * Determina si el ajuste es favorable (disminuye deuda) o no
   * Lógica:
   * - Si saldo es positivo (cliente debe): ajuste negativo es favorable
   * - Si saldo es negativo (cliente tiene a favor): ajuste positivo es favorable
   * - Si saldo es cero: cualquier ajuste negativo es favorable
   */
  const esAjusteFavorable = (): boolean => {
    if (ajuste === 0) return false;
    if (saldoActual > 0) return ajuste < 0; // Cliente debe, descuento es favorable
    if (saldoActual < 0) return ajuste > 0; // Cliente tiene a favor, aumento es favorable
    return ajuste < 0; // Saldo cero, descuento es favorable
  };

  const favorable = esAjusteFavorable();

  // Colores según el impacto
  const colorClasses = favorable
    ? 'bg-green-50 border-green-200'
    : ajuste === 0
    ? 'bg-gray-50 border-gray-200'
    : 'bg-red-50 border-red-200';

  const textColorClasses = favorable
    ? 'text-green-700'
    : ajuste === 0
    ? 'text-gray-700'
    : 'text-red-700';

  const iconColorClasses = favorable
    ? 'text-green-600'
    : ajuste === 0
    ? 'text-gray-600'
    : 'text-red-600';

  // Icono según el tipo de cambio
  const Icon =
    ajuste > 0 ? TrendingUp : ajuste < 0 ? TrendingDown : DollarSign;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={`
        border-2 rounded-xl p-5
        ${colorClasses}
        ${className}
      `}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${iconColorClasses}`} />
        <h3 className={`font-bold text-sm uppercase tracking-wide ${textColorClasses}`}>
          Vista Previa del Ajuste
        </h3>
      </div>

      <div className="space-y-3">
        {/* Saldo Actual */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">Saldo actual:</span>
          <motion.span
            key={saldoActual}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-gray-800 font-bold text-lg"
          >
            {formatCurrency(saldoActual)}
          </motion.span>
        </div>

        {/* Ajuste */}
        <div className="flex justify-between items-center">
          <span className="text-gray-600 font-medium">Ajuste:</span>
          <motion.span
            key={ajuste}
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`font-bold text-lg ${
              ajuste > 0
                ? 'text-red-600'
                : ajuste < 0
                ? 'text-green-600'
                : 'text-gray-600'
            }`}
          >
            {ajuste > 0 ? '+' : ''}
            {formatCurrency(ajuste)}
          </motion.span>
        </div>

        {/* Divisor */}
        <div className="border-t-2 border-dashed border-gray-300 my-2" />

        {/* Nuevo Saldo */}
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-bold">Nuevo saldo:</span>
          <motion.span
            key={nuevoSaldo}
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className={`font-bold text-2xl ${textColorClasses}`}
          >
            {formatCurrency(nuevoSaldo)}
          </motion.span>
        </div>
      </div>

      {/* Mensaje de contexto */}
      {ajuste !== 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ delay: 0.1 }}
          className="mt-4 pt-4 border-t border-gray-300"
        >
          <p className={`text-sm font-medium ${textColorClasses}`}>
            {favorable
              ? saldoActual > 0
                ? 'Este ajuste reduce la deuda del cliente'
                : 'Este ajuste aumenta el saldo a favor del cliente'
              : saldoActual >= 0
              ? 'Este ajuste aumenta la deuda del cliente'
              : 'Este ajuste reduce el saldo a favor del cliente'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};

export default PreviewCard;
