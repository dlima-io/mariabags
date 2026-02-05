import { motion } from 'framer-motion';
import { ReactNode } from 'react';

/**
 * Badge Atom - Badge para mostrar estados y etiquetas
 *
 * Variantes de color según el contexto
 * Tamaños adaptables
 * Animación pulse opcional para estados dinámicos
 */

interface BadgeProps {
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  pulse?: boolean;
  children: ReactNode;
  className?: string;
}

const Badge = ({
  variant = 'neutral',
  size = 'md',
  pulse = false,
  children,
  className = '',
}: BadgeProps) => {
  // Clases según variante
  const variantClasses = {
    success: 'bg-green-100 text-green-800 border-green-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
    neutral: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  // Clases según tamaño
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-full border
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${pulse ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      {children}
    </motion.span>
  );
};

export default Badge;
