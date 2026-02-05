import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Spinner Atom - Indicador de carga
 *
 * Spinner animado con Framer Motion
 * Múltiples tamaños y colores
 */

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'primary' | 'white' | 'gray';
  className?: string;
}

const Spinner = ({ size = 'md', color = 'primary', className = '' }: SpinnerProps) => {
  // Tamaños del spinner
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12',
  };

  // Colores del spinner
  const colors = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-600',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} ${colors[color]} ${className}`}
    >
      <Loader2 className="w-full h-full" />
    </motion.div>
  );
};

export default Spinner;
