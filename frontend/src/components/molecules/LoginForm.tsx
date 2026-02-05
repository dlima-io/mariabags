import { motion } from 'framer-motion';
import { User, Lock, LogIn } from 'lucide-react';
import { FormEvent } from 'react';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';

/**
 * LoginForm Molecule - Formulario de inicio de sesión
 *
 * Incluye campos de username y password
 * Maneja el submit y validaciones
 * Animaciones de entrada con stagger
 */

interface LoginFormProps {
  username: string;
  password: string;
  errors: {
    username?: string;
    password?: string;
    general?: string;
  };
  isLoading: boolean;
  onUsernameChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  usernameRef?: React.RefObject<HTMLInputElement>;
}

const LoginForm = ({
  username,
  password,
  errors,
  isLoading,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  usernameRef,
}: LoginFormProps) => {
  // Animaciones en cascada para los campos
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <motion.form
      onSubmit={onSubmit}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-5"
    >
      {/* Mensaje de error general */}
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-2 border-red-200 rounded-lg p-4"
        >
          <p className="text-red-700 text-sm font-medium text-center">
            {errors.general}
          </p>
        </motion.div>
      )}

      {/* Campo de Usuario */}
      <FormField
        ref={usernameRef}
        label="Usuario"
        icon={User}
        type="text"
        placeholder="Ingresa tu usuario"
        value={username}
        onChange={(e) => onUsernameChange(e.target.value)}
        error={errors.username}
        disabled={isLoading}
        autoComplete="username"
        required
      />

      {/* Campo de Contraseña */}
      <FormField
        label="Contraseña"
        icon={Lock}
        type="password"
        placeholder="Ingresa tu contraseña"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        error={errors.password}
        disabled={isLoading}
        autoComplete="current-password"
        required
      />

      {/* Botón de Submit */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon={LogIn}
          iconPosition="right"
          isLoading={isLoading}
          fullWidth
          className="mt-2"
        >
          Iniciar Sesión
        </Button>
      </motion.div>
    </motion.form>
  );
};

export default LoginForm;
