import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Settings } from 'lucide-react';
import { TipoMovimiento } from '@/types/Movimiento.types';

/**
 * MovementBadge Atom - Badge especializado para tipos de movimiento
 *
 * Visualización clara del tipo de movimiento con colores semánticos
 * - COMPRA (DEBITO): Rojo vibrante
 * - PAGO (CREDITO): Verde vibrante
 * - AJUSTE: Azul vibrante
 *
 * Incluye iconos de Lucide React y animaciones de entrada
 */

interface MovementBadgeProps {
  tipo: TipoMovimiento;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const MovementBadge = ({
  tipo,
  size = 'md',
  className = '',
}: MovementBadgeProps) => {
  // Configuración por tipo
  const config = {
    [TipoMovimiento.DEBITO]: {
      text: 'COMPRA',
      bgColor: 'bg-red-500',
      textColor: 'text-white',
      Icon: ShoppingBag,
    },
    [TipoMovimiento.CREDITO]: {
      text: 'PAGO',
      bgColor: 'bg-emerald-500',
      textColor: 'text-white',
      Icon: DollarSign,
    },
    [TipoMovimiento.AJUSTE]: {
      text: 'AJUSTE',
      bgColor: 'bg-blue-500',
      textColor: 'text-white',
      Icon: Settings,
    },
  };

  // Clases según tamaño
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
    lg: 'text-base px-4 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const { text, bgColor, textColor, Icon } = config[tipo];

  return (
    <motion.span
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`
        inline-flex items-center rounded-full font-bold
        ${bgColor} ${textColor} ${sizeClasses[size]}
        shadow-sm
        ${className}
      `}
      role="status"
      aria-label={`Tipo de movimiento: ${text}`}
    >
      <Icon className={iconSizes[size]} />
      <span>{text}</span>
    </motion.span>
  );
};

export default MovementBadge;
