import { motion } from 'framer-motion';
import { TipoMovimiento } from '@/types/Movimiento.types';

/**
 * AmountDisplay Atom - Muestra montos con formato y semántica visual
 *
 * Formatea números como moneda con separadores
 * Aplica colores según tipo de movimiento
 * Muestra signos + o - según corresponda
 *
 * DEBITO (Compra): + Rojo (aumenta deuda)
 * CREDITO (Pago): - Verde (reduce deuda)
 * AJUSTE: + o - Azul (según signo)
 */

interface AmountDisplayProps {
  amount: number;
  tipo: TipoMovimiento;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSign?: boolean;
  animate?: boolean;
  className?: string;
}

const AmountDisplay = ({
  amount,
  tipo,
  size = 'md',
  showSign = true,
  animate = false,
  className = '',
}: AmountDisplayProps) => {
  /**
   * Formatea el monto como moneda argentina
   */
  const formatAmount = (value: number): string => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(value));
  };

  /**
   * Obtiene el signo y color según el tipo de movimiento
   */
  const getSignAndColor = () => {
    if (tipo === TipoMovimiento.DEBITO) {
      return { sign: '+', color: 'text-red-600' };
    } else if (tipo === TipoMovimiento.CREDITO) {
      return { sign: '-', color: 'text-emerald-600' };
    } else {
      // AJUSTE
      return {
        sign: amount >= 0 ? '+' : '-',
        color: amount >= 0 ? 'text-blue-600' : 'text-orange-600',
      };
    }
  };

  const { sign, color } = getSignAndColor();

  // Clases según tamaño
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-3xl',
  };

  const content = (
    <span className={`font-bold ${color} ${sizeClasses[size]} ${className}`}>
      {showSign && <span className="mr-1">{sign}</span>}
      {formatAmount(amount)}
    </span>
  );

  if (animate) {
    return (
      <motion.span
        initial={{ scale: 1.2, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
      >
        {content}
      </motion.span>
    );
  }

  return content;
};

export default AmountDisplay;
