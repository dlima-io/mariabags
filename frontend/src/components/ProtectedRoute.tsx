import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

/**
 * ProtectedRoute Component - Ruta protegida con autenticación
 *
 * Verifica si el usuario está autenticado antes de mostrar el contenido
 * Redirige a /login si no está autenticado
 * Muestra un spinner mientras verifica la autenticación
 */

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  // Simular un pequeño delay para verificar autenticación
  // Esto evita flashes de redirección en recargas de página
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsChecking(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Mostrar spinner mientras verifica
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Loader2 className="w-12 h-12 text-primary-600" />
          </motion.div>
          <p className="text-primary-700 font-medium">Verificando acceso...</p>
        </motion.div>
      </div>
    );
  }

  // Redirigir a login si no está autenticado
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Renderizar contenido protegido
  return <>{children}</>;
};

export default ProtectedRoute;
