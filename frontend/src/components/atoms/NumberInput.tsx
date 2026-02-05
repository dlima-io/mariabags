import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { forwardRef, ChangeEvent } from 'react';

/**
 * NumberInput Atom - Campo de entrada numérica especializado
 *
 * Input diseñado para números con soporte para:
 * - Valores decimales
 * - Valores negativos (opcional)
 * - Iconos y prefijos/sufijos
 * - Validación y estados de error
 * - Touch-optimized (44px mínimo)
 */

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  icon?: LucideIcon;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  allowNegative?: boolean;
  allowDecimal?: boolean;
  id?: string;
  name?: string;
  className?: string;
}

const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      value,
      onChange,
      onBlur,
      placeholder,
      prefix,
      suffix,
      icon: Icon,
      error = false,
      helperText,
      disabled = false,
      required = false,
      allowNegative = true,
      allowDecimal = true,
      id,
      name,
      className = '',
    },
    ref
  ) => {
    /**
     * Maneja el cambio del input, validando el formato numérico
     */
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;

      // Permitir campo vacío
      if (inputValue === '') {
        onChange('');
        return;
      }

      // Permitir solo signo negativo al inicio
      if (inputValue === '-' && allowNegative) {
        onChange('-');
        return;
      }

      // Construir regex según configuración
      let pattern = '^';
      if (allowNegative) {
        pattern += '-?';
      }
      pattern += '\\d*';
      if (allowDecimal) {
        pattern += '(\\.\\d*)?';
      }
      pattern += '$';

      const regex = new RegExp(pattern);

      // Validar formato
      if (regex.test(inputValue)) {
        onChange(inputValue);
      }
    };

    return (
      <div className="w-full">
        <motion.div
          className="relative"
          initial={false}
          animate={error ? { x: [0, -10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          {/* Icono a la izquierda si existe */}
          {Icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
              <Icon className="w-5 h-5" />
            </div>
          )}

          {/* Prefijo (ej: "$") */}
          {prefix && (
            <div
              className="
                absolute left-4 top-1/2 -translate-y-1/2
                text-gray-600 font-semibold text-base z-10
              "
            >
              {prefix}
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            type="text"
            inputMode="decimal"
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            id={id}
            name={name}
            className={`
              w-full px-4 py-3 rounded-lg border-2
              transition-all duration-200
              text-base font-medium
              min-h-touch
              ${Icon ? 'pl-12' : ''}
              ${prefix ? 'pl-10' : ''}
              ${suffix ? 'pr-10' : ''}
              ${
                error
                  ? 'border-red-500 focus:border-red-600 focus:ring-2 focus:ring-red-200'
                  : 'border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'
              }
              focus:outline-none
              disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500
              placeholder:text-gray-400
              ${className}
            `}
          />

          {/* Sufijo (ej: "%") */}
          {suffix && (
            <div
              className="
                absolute right-4 top-1/2 -translate-y-1/2
                text-gray-600 font-semibold text-base
              "
            >
              {suffix}
            </div>
          )}
        </motion.div>

        {/* Texto de ayuda o error */}
        {helperText && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-1 text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
          >
            {helperText}
          </motion.p>
        )}
      </div>
    );
  }
);

NumberInput.displayName = 'NumberInput';

export default NumberInput;
