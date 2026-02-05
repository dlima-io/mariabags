import { motion } from 'framer-motion';
import Logo from '@/components/atoms/Logo';
import LoginForm from '@/components/molecules/LoginForm';
import { useLogin } from '@/hooks/useLogin';

/**
 * Login Page - Pantalla de inicio de sesión
 *
 * Diseño vibrante mobile-first con gradiente rosa
 * Incluye animaciones de entrada y feedback visual
 * Optimizado para touch targets (44px mínimo)
 */

const Login = () => {
  const {
    username,
    password,
    errors,
    isLoading,
    usernameRef,
    setUsername,
    setPassword,
    handleLogin,
  } = useLogin();

  // Animación del contenedor principal
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  // Animación de la card con slide up
  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        delay: 0.2,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen bg-gradient-to-br from-primary-50 via-primary-100 to-primary-200 flex items-center justify-center p-4 safe-top safe-bottom"
    >
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="mb-8">
          <Logo size="lg" showSubtitle animated />
        </div>

        {/* Card del formulario */}
        <motion.div
          variants={cardVariants}
          className="bg-white rounded-2xl shadow-2xl shadow-primary-500/20 p-8"
        >
          {/* Título de la card */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 text-center"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Bienvenido
            </h2>
            <p className="text-gray-600 text-sm">
              Ingresa tus credenciales para continuar
            </p>
          </motion.div>

          {/* Formulario de Login */}
          <LoginForm
            username={username}
            password={password}
            errors={errors}
            isLoading={isLoading}
            onUsernameChange={setUsername}
            onPasswordChange={setPassword}
            onSubmit={handleLogin}
            usernameRef={usernameRef}
          />
        </motion.div>

        {/* Footer con versión */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="text-primary-800 text-sm font-medium">
            v1.0.0 - Sistema de Gestión
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
