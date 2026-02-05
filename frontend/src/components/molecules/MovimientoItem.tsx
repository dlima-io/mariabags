import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import { Movimiento } from '@/types/Movimiento.types';
import MovementBadge from '@/components/atoms/MovementBadge';
import AmountDisplay from '@/components/atoms/AmountDisplay';
import DateDisplay from '@/components/atoms/DateDisplay';
import UserTag from '@/components/atoms/UserTag';
import { memo } from 'react';

/**
 * MovimientoItem Molecule - Card individual de un movimiento
 *
 * Muestra toda la información de un movimiento de forma clara y organizada
 * - Fecha y hora
 * - Tipo de movimiento (badge)
 * - Monto con formato y color
 * - Observaciones (si existen)
 * - Saldo acumulado
 * - Usuario que lo registró
 *
 * Incluye animaciones de entrada y hover
 * Memoizado para optimización de performance
 */

interface MovimientoItemProps {
  movimiento: Movimiento & {
    saldoAcumulado?: number;
    usuario?: { username: string };
  };
  showSaldoAcumulado?: boolean;
  index?: number;
  className?: string;
}

const MovimientoItem = memo<MovimientoItemProps>(({
  movimiento,
  showSaldoAcumulado = true,
  index = 0,
  className = '',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{
        duration: 0.3,
        delay: index * 0.05,
        ease: 'easeOut',
      }}
      whileHover={{
        y: -4,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
      }}
      className={`
        bg-white rounded-xl shadow-md p-5
        border-l-4 border-primary-500
        transition-all duration-200
        ${className}
      `}
    >
      {/* Header: Fecha y hora */}
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-gray-400" />
        <DateDisplay date={movimiento.fecha} showTime />
      </div>

      {/* Body: Badge y Monto */}
      <div className="flex items-start justify-between gap-4 mb-3">
        {/* Lado izquierdo: Badge y observaciones */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <MovementBadge tipo={movimiento.tipo} size="md" />
          </div>
          {movimiento.observaciones && (
            <p className="text-gray-700 text-sm leading-relaxed break-words">
              {movimiento.observaciones}
            </p>
          )}
        </div>

        {/* Lado derecho: Monto */}
        <div className="text-right flex-shrink-0">
          <AmountDisplay
            amount={movimiento.monto}
            tipo={movimiento.tipo}
            size="lg"
          />
        </div>
      </div>

      {/* Footer: Saldo y Usuario */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 gap-4 flex-wrap">
        {/* Saldo acumulado */}
        {showSaldoAcumulado && movimiento.saldoAcumulado !== undefined && (
          <div className="text-sm">
            <span className="text-gray-500">Saldo: </span>
            <span className={`font-bold ${
              movimiento.saldoAcumulado > 0
                ? 'text-red-600'
                : movimiento.saldoAcumulado < 0
                ? 'text-emerald-600'
                : 'text-gray-600'
            }`}>
              ${Math.abs(movimiento.saldoAcumulado).toLocaleString('es-AR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
        )}

        {/* Usuario */}
        {movimiento.usuario && (
          <UserTag username={movimiento.usuario.username} size="sm" />
        )}
      </div>
    </motion.div>
  );
});

MovimientoItem.displayName = 'MovimientoItem';

export default MovimientoItem;
