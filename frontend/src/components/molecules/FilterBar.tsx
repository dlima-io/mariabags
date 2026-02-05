import { motion } from 'framer-motion';
import { List, ShoppingBag, DollarSign, Settings } from 'lucide-react';
import { TipoMovimiento } from '@/types/Movimiento.types';

/**
 * FilterBar Molecule - Barra de filtros para el historial
 *
 * Permite filtrar movimientos por tipo
 * Muestra contadores de resultados
 * Diseño horizontal scrollable en móvil
 */

type FilterType = 'TODOS' | TipoMovimiento;

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    todos: number;
    debitos: number;
    creditos: number;
    ajustes: number;
  };
  className?: string;
}

const FilterBar = ({
  activeFilter,
  onFilterChange,
  counts,
  className = '',
}: FilterBarProps) => {
  const filters = [
    {
      key: 'TODOS' as FilterType,
      label: 'Todos',
      Icon: List,
      count: counts.todos,
      color: 'bg-gray-500',
    },
    {
      key: TipoMovimiento.DEBITO as FilterType,
      label: 'Compras',
      Icon: ShoppingBag,
      count: counts.debitos,
      color: 'bg-red-500',
    },
    {
      key: TipoMovimiento.CREDITO as FilterType,
      label: 'Pagos',
      Icon: DollarSign,
      count: counts.creditos,
      color: 'bg-emerald-500',
    },
    {
      key: TipoMovimiento.AJUSTE as FilterType,
      label: 'Ajustes',
      Icon: Settings,
      count: counts.ajustes,
      color: 'bg-blue-500',
    },
  ];

  return (
    <div className={`overflow-x-auto scrollbar-hide ${className}`}>
      <div className="flex gap-2 pb-2 min-w-max">
        {filters.map(({ key, label, Icon, count, color }) => {
          const isActive = activeFilter === key;

          return (
            <motion.button
              key={key}
              onClick={() => onFilterChange(key)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold
                whitespace-nowrap transition-all duration-200 min-h-touch
                ${
                  isActive
                    ? `${color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              <span className={`
                text-xs px-2 py-0.5 rounded-full font-bold
                ${isActive ? 'bg-white/20' : 'bg-gray-200'}
              `}>
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default FilterBar;
