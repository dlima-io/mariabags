import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Shield } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { usuarioService, CreateUsuarioDTO, Usuario } from '@/services/usuarioService';
import Button from '@/components/atoms/Button';
import Spinner from '@/components/atoms/Spinner';

/**
 * UsuarioFormModal - Modal para crear/editar usuarios
 */

interface UsuarioFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  usuario?: Usuario | null;
  onSuccess: () => void;
}

const UsuarioFormModal = ({ isOpen, onClose, usuario, onSuccess }: UsuarioFormModalProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<'ADMIN' | 'STAFF'>('STAFF');
  const [loading, setLoading] = useState(false);

  const isEditing = !!usuario;

  useEffect(() => {
    if (isOpen) {
      if (usuario) {
        setUsername(usuario.username);
        setPassword('');
        setRol(usuario.rol);
      } else {
        setUsername('');
        setPassword('');
        setRol('STAFF');
      }
    }
  }, [isOpen, usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim()) {
      toast.error('El nombre de usuario es requerido');
      return;
    }

    if (!isEditing && !password) {
      toast.error('La contraseña es requerida');
      return;
    }

    if (!isEditing && password.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        const data: any = { username, rol };
        if (password) {
          data.password = password;
        }
        await usuarioService.updateUsuario(usuario!.id, data);
        toast.success('Usuario actualizado exitosamente');
      } else {
        const data: CreateUsuarioDTO = {
          username: username.trim(),
          password,
          rol,
        };
        await usuarioService.createUsuario(data);
        toast.success('Usuario creado exitosamente');
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="
                bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl
                w-full max-w-md
                flex flex-col
                overflow-hidden
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  {isEditing ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-1" />
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="
                      w-full px-4 py-3 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-primary-500
                      transition-all duration-200
                    "
                    placeholder="usuario"
                    autoComplete="off"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Lock className="w-4 h-4 inline mr-1" />
                    Contraseña {isEditing && '(dejar vacío para no cambiar)'}
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="
                      w-full px-4 py-3 border border-gray-300 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-primary-500
                      transition-all duration-200
                    "
                    placeholder={isEditing ? 'Nueva contraseña' : 'Mínimo 8 caracteres'}
                    autoComplete="new-password"
                  />
                </div>

                {/* Rol */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Rol
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setRol('STAFF')}
                      className={`
                        flex-1 py-3 px-4 rounded-lg border-2 font-medium
                        transition-all duration-200
                        ${
                          rol === 'STAFF'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }
                      `}
                    >
                      STAFF
                    </button>
                    <button
                      type="button"
                      onClick={() => setRol('ADMIN')}
                      className={`
                        flex-1 py-3 px-4 rounded-lg border-2 font-medium
                        transition-all duration-200
                        ${
                          rol === 'ADMIN'
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }
                      `}
                    >
                      ADMIN
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {rol === 'ADMIN'
                      ? 'Acceso completo: puede gestionar usuarios y toda la información'
                      : 'Acceso limitado: puede gestionar clientes y movimientos'}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="flex-1"
                    disabled={loading}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner />
                        <span className="ml-2">Guardando...</span>
                      </>
                    ) : (
                      <span>{isEditing ? 'Actualizar' : 'Crear'}</span>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UsuarioFormModal;
