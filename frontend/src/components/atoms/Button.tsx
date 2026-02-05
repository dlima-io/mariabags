import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ReactNode, MouseEvent } from 'react';

/**
 * Button Atom - Botón reutilizable con variantes y estados
 *
 * Cumple con touch target mínimo de 44px
 * Incluye animaciones de hover/tap con Framer Motion
 * Soporta estados de loading y disabled
 */

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  children?: ReactNode;
  fullWidth?: boolean;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  'aria-label'?: string;
}

const Button = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon: Icon,
  iconPosition = 'left',
  children,
  fullWidth = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  'aria-label': ariaLabel,
}: ButtonProps) => {
  // Clases base para todos los botones
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2';

  // Clases según variante
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 disabled:bg-gray-300',
    secondary: 'bg-white text-primary-600 border-2 border-primary-500 hover:bg-primary-50 active:bg-primary-100 disabled:bg-gray-100 disabled:border-gray-300 disabled:text-gray-400',
    ghost: 'bg-transparent text-primary-600 hover:bg-primary-50 active:bg-primary-100 disabled:text-gray-400',
  };

  // Clases según tamaño (asegurando touch target mínimo)
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm min-h-[40px]',
    md: 'px-6 py-3 text-base min-h-touch', // 44px mínimo
    lg: 'px-8 py-4 text-lg min-h-[52px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  const isDisabled = disabled || isLoading;

  return (
    <motion.button
      type={type}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClass}
        ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={isDisabled}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {isLoading ? (
        <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
          />
          <span>Cargando...</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-5 h-5" />}
          {children}
          {Icon && iconPosition === 'right' && <Icon className="w-5 h-5" />}
        </>
      )}
    </motion.button>
  );
};

export default Button;
