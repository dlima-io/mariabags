import { motion } from 'framer-motion';
import { DollarSign, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import DateDisplay from '@/components/atoms/DateDisplay';

/**
 * SaldoCard Molecule - Card destacado con el saldo actual del cliente
 *
 * Visualización prominente del saldo con gradiente rosa
 * Muestra información contextual (nombre, última operación)
 * Botón de acción para registrar nuevo movimiento
 *
 * Colores semánticos:
 * - Debe (positivo): Énfasis en rojo
 * - Al día (cero): Énfasis neutro
 * - A favor (negativo): Énfasis en verde
 */

interface SaldoCardProps {
  saldo: number;
  clienteNombre: string;
  ultimaOperacion?: string | Date;
  onRegistrarMovimiento: () => void;
  className?: string;
}

const SaldoCard = ({
  saldo,
  clienteNombre,
  ultimaOperacion,
  onRegistrarMovimiento,
  className = '',
}: SaldoCardProps) => {
  /**
   * Obtiene el label del estado de la cuenta
   */
  const getSaldoLabel = (): string => {
    if (saldo > 0) return 'Cliente debe';
    if (saldo < 0) return 'Cliente tiene a favor';
    return 'Cliente está al día';
  };

  /**
   * Obtiene el icono según el estado
   */
  const SaldoIcon = saldo > 0 ? TrendingUp : saldo < 0 ? TrendingDown : DollarSign;

  /**
   * Formatea el saldo
   */
  const formatSaldo = (value: number): string => {
    return Math.abs(value).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      className={`
        bg-gradient-to-br from-primary-500 to-primary-600
        text-white rounded-2xl shadow-2xl p-6
        ${className}
      `}
    >
      {/* Nombre del Cliente */}
      <div className="flex items-center gap-2 mb-5">
        <DollarSign className="w-6 h-6" />
        <h2 className="text-xl font-bold truncate">
          {clienteNombre}
        </h2>
      </div>

      {/* Saldo */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <SaldoIcon className="w-5 h-5 opacity-90" />
          <p className="text-sm opacity-90 font-medium">{getSaldoLabel()}</p>
        </div>
        <motion.p
          key={saldo}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          className="text-5xl font-bold tracking-tight"
        >
          ${formatSaldo(saldo)}
        </motion.p>
      </div>

      {/* Última Operación */}
      {ultimaOperacion && (
        <div className="flex items-center gap-2 mb-5 text-sm opacity-80">
          <Clock className="w-4 h-4" />
          <span>Última operación: </span>
          <DateDisplay
            date={ultimaOperacion}
            format="relative"
            className="text-white font-medium opacity-90"
          />
        </div>
      )}

      {/* Botón de Acción */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onRegistrarMovimiento}
        className="
          w-full bg-white text-primary-600 font-bold py-4 px-6 rounded-xl
          hover:bg-primary-50 active:bg-primary-100
          transition-all duration-200
          flex items-center justify-center gap-2
          shadow-lg hover:shadow-xl
          min-h-touch
        "
        aria-label="Registrar nuevo movimiento"
      >
        <span className="text-2xl">+</span>
        <span className="text-lg">Registrar Movimiento</span>
      </motion.button>
    </motion.div>
  );
};

export default SaldoCard;
