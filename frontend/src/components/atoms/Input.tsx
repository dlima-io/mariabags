import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { forwardRef, ChangeEvent } from 'react';

/**
 * Input Atom - Campo de entrada reutilizable
 *
 * Incluye soporte para iconos, estados de error y animaciones
 * Focus state con borde rosa vibrante
 * Altura mínima para touch targets
 */

interface InputProps {
  type?: 'text' | 'password' | 'email' | 'number' | 'tel';
  placeholder?: string;
  value?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: () => void;
  icon?: LucideIcon;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  id?: string;
  name?: string;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({
    type = 'text',
    placeholder,
    value,
    onChange,
    onBlur,
    icon: Icon,
    error = false,
    helperText,
    disabled = false,
    required = false,
    autoComplete,
    id,
    name,
    className = '',
  }, ref) => {
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
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon className="w-5 h-5" />
            </div>
          )}

          {/* Input field */}
          <input
            ref={ref}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            autoComplete={autoComplete}
            id={id}
            name={name}
            className={`
              w-full px-4 py-3 rounded-lg border-2
              transition-all duration-200
              text-base
              min-h-touch
              ${Icon ? 'pl-12' : ''}
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

Input.displayName = 'Input';

export default Input;
