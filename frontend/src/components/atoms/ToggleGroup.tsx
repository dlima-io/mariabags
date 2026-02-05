import { motion } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * ToggleGroup Atom - Selector de opciones mutuamente excluyentes
 *
 * Componente para seleccionar entre múltiples opciones
 * Diseño mobile-first con touch targets de 44px mínimo
 * Animación suave al cambiar de opción
 */

interface ToggleOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface ToggleGroupProps {
  options: ToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

const ToggleGroup = ({
  options,
  value,
  onChange,
  className = '',
  disabled = false,
}: ToggleGroupProps) => {
  return (
    <div
      className={`
        inline-flex bg-gray-100 rounded-lg p-1
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      role="radiogroup"
      aria-disabled={disabled}
    >
      {options.map((option) => {
        const isSelected = value === option.value;

        return (
          <motion.button
            key={option.value}
            type="button"
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={`
              relative px-6 py-3 rounded-lg font-semibold
              transition-colors duration-200
              min-h-touch
              flex items-center justify-center gap-2
              ${
                isSelected
                  ? 'text-primary-600'
                  : 'text-gray-600 hover:text-gray-900'
              }
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
            whileTap={!disabled ? { scale: 0.97 } : {}}
            role="radio"
            aria-checked={isSelected}
            aria-label={option.label}
          >
            {/* Background animado */}
            {isSelected && (
              <motion.div
                layoutId="toggle-background"
                className="absolute inset-0 bg-white rounded-lg shadow-md"
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 30,
                }}
              />
            )}

            {/* Contenido */}
            <span className="relative z-10 flex items-center gap-2">
              {option.icon && <span>{option.icon}</span>}
              <span>{option.label}</span>
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

export default ToggleGroup;
