import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

/**
 * Logo Atom - Logo/marca de María Bags
 *
 * Diseño vibrante con animación de entrada
 * Incluye icono de bolsa y texto estilizado
 */

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  animated?: boolean;
}

const Logo = ({ size = 'md', showSubtitle = true, animated = true }: LogoProps) => {
  // Tamaños para el icono y texto
  const sizes = {
    sm: {
      icon: 'w-8 h-8',
      title: 'text-2xl',
      subtitle: 'text-sm',
    },
    md: {
      icon: 'w-12 h-12',
      title: 'text-4xl',
      subtitle: 'text-base',
    },
    lg: {
      icon: 'w-16 h-16',
      title: 'text-5xl',
      subtitle: 'text-lg',
    },
  };

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const MotionWrapper = animated ? motion.div : 'div';
  const MotionItem = animated ? motion.div : 'div';

  return (
    <MotionWrapper
      className="flex flex-col items-center gap-2"
      {...(animated && {
        variants: containerVariants,
        initial: 'hidden',
        animate: 'visible',
      })}
    >
      {/* Icono con fondo rosa vibrante */}
      <MotionItem
        className={`
          ${sizes[size].icon}
          bg-gradient-to-br from-primary-400 to-primary-600
          rounded-2xl
          flex items-center justify-center
          shadow-lg
          shadow-primary-500/30
        `}
        {...(animated && {
          variants: itemVariants,
          whileHover: { scale: 1.05, rotate: 5 },
          whileTap: { scale: 0.95 },
        })}
      >
        <ShoppingBag className="text-white w-2/3 h-2/3" strokeWidth={2.5} />
      </MotionItem>

      {/* Título */}
      <MotionItem
        {...(animated && { variants: itemVariants })}
      >
        <h1
          className={`
            ${sizes[size].title}
            font-bold
            bg-gradient-to-r from-primary-600 to-primary-800
            bg-clip-text text-transparent
          `}
        >
          María Bags
        </h1>
      </MotionItem>

      {/* Subtítulo */}
      {showSubtitle && (
        <MotionItem
          {...(animated && { variants: itemVariants })}
        >
          <p className={`${sizes[size].subtitle} text-gray-600 text-center font-medium`}>
            Gestión de Cuentas Corrientes
          </p>
        </MotionItem>
      )}
    </MotionWrapper>
  );
};

export default Logo;
