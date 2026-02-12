import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

/**
 * useLogin Hook - Lógica de autenticación
 *
 * Maneja el estado del formulario de login
 * Realiza validaciones y petición al backend
 * Gestiona estados de loading y errores
 */

interface LoginErrors {
  username?: string;
  password?: string;
  general?: string;
}

interface LoginResponse {
  token: string;
  usuario: {
    id: string;
    username: string;
    rol: 'ADMIN' | 'STAFF';
  };
}

export const useLogin = () => {
  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  // Estado del formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<LoginErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  // Ref para auto-focus en el campo de usuario
  const usernameRef = useRef<HTMLInputElement>(null);

  // Auto-focus al montar el componente
  useEffect(() => {
    usernameRef.current?.focus();
  }, []);

  /**
   * Valida los campos del formulario
   * @returns true si los campos son válidos
   */
  const validateForm = (): boolean => {
    const newErrors: LoginErrors = {};

    // Validar username
    if (!username.trim()) {
      newErrors.username = 'El usuario es requerido';
    } else if (username.length < 3) {
      newErrors.username = 'El usuario debe tener al menos 3 caracteres';
    }

    // Validar password
    if (!password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (password.length < 4) {
      newErrors.password = 'La contraseña debe tener al menos 4 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Maneja el envío del formulario de login
   */
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Limpiar errores previos
    setErrors({});

    // Validar campos
    if (!validateForm()) {
      return;
    }

    // Iniciar proceso de login
    setIsLoading(true);

    try {
      // Realizar petición al backend
      const response = await api.post<LoginResponse>('/auth/login', {
        username: username.trim(),
        password,
      });

      const { token, usuario } = response.data;

      // Guardar token y usuario en el contexto
      authLogin(token, usuario);

      // Redirigir a la ruta original o al dashboard
      const redirect = sessionStorage.getItem('mariabags_redirect');
      sessionStorage.removeItem('mariabags_redirect');
      navigate(redirect || '/', { replace: true });
    } catch (error: any) {
      // Manejar errores de la petición
      if (error.response?.status === 401) {
        setErrors({
          general: 'Usuario o contraseña incorrectos',
        });
      } else if (error.response?.status === 404) {
        setErrors({
          general: 'Usuario no encontrado',
        });
      } else if (error.code === 'ECONNABORTED') {
        setErrors({
          general: 'Tiempo de espera agotado. Verifica tu conexión',
        });
      } else if (!error.response) {
        setErrors({
          general: 'Error de conexión. Verifica tu red e intenta nuevamente',
        });
      } else {
        setErrors({
          general: 'Error al iniciar sesión. Intenta nuevamente',
        });
      }

      console.error('Error en login:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    username,
    password,
    errors,
    isLoading,
    usernameRef,
    setUsername,
    setPassword,
    handleLogin,
  };
};
